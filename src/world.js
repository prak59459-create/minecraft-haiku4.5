class Chunk {
    constructor(x, z) {
        this.x = x;
        this.z = z;
        this.blocks = new Uint8Array(CONFIG.CHUNK_SIZE * CONFIG.CHUNK_SIZE * CONFIG.CHUNK_HEIGHT);
        this.mesh = null;
        this.isDirty = true;
    }

    getBlock(x, y, z) {
        if (x < 0 || x >= CONFIG.CHUNK_SIZE || y < 0 || y >= CONFIG.CHUNK_HEIGHT || z < 0 || z >= CONFIG.CHUNK_SIZE) {
            return BLOCK_TYPES.AIR;
        }
        const index = y * CONFIG.CHUNK_SIZE * CONFIG.CHUNK_SIZE + z * CONFIG.CHUNK_SIZE + x;
        return this.blocks[index];
    }

    setBlock(x, y, z, block) {
        if (x < 0 || x >= CONFIG.CHUNK_SIZE || y < 0 || y >= CONFIG.CHUNK_HEIGHT || z < 0 || z >= CONFIG.CHUNK_SIZE) {
            return;
        }
        const index = y * CONFIG.CHUNK_SIZE * CONFIG.CHUNK_SIZE + z * CONFIG.CHUNK_SIZE + x;
        this.blocks[index] = block;
        this.isDirty = true;
    }

    dispose() {
        if (this.mesh) {
            this.mesh.geometry.dispose();
            this.mesh.material.dispose();
        }
    }
}

class World {
    constructor() {
        this.chunks = new Map();
        this.noise = new SimplexNoise();
        this.meshes = [];
        this.loaded = false;
    }

    generateTerrain(chunkX, chunkZ) {
        const chunk = new Chunk(chunkX, chunkZ);
        const worldX = chunkX * CONFIG.CHUNK_SIZE;
        const worldZ = chunkZ * CONFIG.CHUNK_SIZE;

        const seaLevel = 64;

        for (let x = 0; x < CONFIG.CHUNK_SIZE; x++) {
            for (let z = 0; z < CONFIG.CHUNK_SIZE; z++) {
                const worldPosX = worldX + x;
                const worldPosZ = worldZ + z;

                let height = this.getTerrainHeight(worldPosX, worldPosZ);
                height = Utils.clamp(height, 0, CONFIG.CHUNK_HEIGHT - 1);

                for (let y = 0; y < CONFIG.CHUNK_HEIGHT; y++) {
                    let block = BLOCK_TYPES.AIR;

                    if (y < height - 2) {
                        block = BLOCK_TYPES.STONE;
                        if (Math.random() < 0.05) block = BLOCK_TYPES.COAL_ORE;
                        if (Math.random() < 0.02) block = BLOCK_TYPES.IRON_ORE;
                        if (Math.random() < 0.005) block = BLOCK_TYPES.GOLD_ORE;
                    } else if (y < height - 1) {
                        block = BLOCK_TYPES.DIRT;
                    } else if (y === Math.floor(height - 1)) {
                        block = y >= seaLevel - 2 ? BLOCK_TYPES.GRASS : BLOCK_TYPES.DIRT;
                    } else if (y < seaLevel) {
                        block = BLOCK_TYPES.WATER;
                    }

                    chunk.setBlock(x, y, z, block);
                }

                this.generateTrees(chunk, x, z, worldPosX, worldPosZ, Math.floor(height));
            }
        }

        return chunk;
    }

    getTerrainHeight(x, z) {
        let height = 64;
        let scale = 100;
        let amplitude = 30;

        for (let i = 0; i < 4; i++) {
            const nx = x / scale;
            const nz = z / scale;
            height += this.noise.noise2D(nx, nz) * amplitude;
            scale /= 2;
            amplitude /= 2;
        }

        return height;
    }

    generateTrees(chunk, chunkLocalX, chunkLocalZ, worldX, worldZ, height) {
        if (Math.random() > 0.02) return;

        const trunkHeight = 5 + Math.floor(Math.random() * 3);

        for (let y = 0; y < trunkHeight && height + y < CONFIG.CHUNK_HEIGHT; y++) {
            if (height + y >= 0) {
                chunk.setBlock(chunkLocalX, height + y, chunkLocalZ, BLOCK_TYPES.OAK_LOG);
            }
        }

        const foliageHeight = height + trunkHeight;
        const foliageRadius = 3;

        for (let dx = -foliageRadius; dx <= foliageRadius; dx++) {
            for (let dz = -foliageRadius; dz <= foliageRadius; dz++) {
                for (let dy = -foliageRadius; dy <= 1; dy++) {
                    if (Math.abs(dx) + Math.abs(dz) + Math.abs(dy) <= foliageRadius + 1) {
                        const y = foliageHeight + dy;
                        if (y >= 0 && y < CONFIG.CHUNK_HEIGHT && dx === 0 && dz === 0) continue;
                        if (y >= 0 && y < CONFIG.CHUNK_HEIGHT) {
                            const localX = chunkLocalX + dx;
                            const localZ = chunkLocalZ + dz;
                            if (localX >= 0 && localX < CONFIG.CHUNK_SIZE && localZ >= 0 && localZ < CONFIG.CHUNK_SIZE) {
                                const current = chunk.getBlock(localX, y, localZ);
                                if (current === BLOCK_TYPES.AIR) {
                                    chunk.setBlock(localX, y, localZ, BLOCK_TYPES.OAK_LEAVES);
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    getChunk(x, z) {
        const key = Utils.chunkKey(x, z);

        if (!this.chunks.has(key)) {
            const chunk = this.generateTerrain(x, z);
            this.chunks.set(key, chunk);
        }

        return this.chunks.get(key);
    }

    unloadFarChunks(playerX, playerZ, renderDistance) {
        const playerChunkX = Math.floor(playerX / CONFIG.CHUNK_SIZE);
        const playerChunkZ = Math.floor(playerZ / CONFIG.CHUNK_SIZE);

        const keysToRemove = [];

        for (const [key, chunk] of this.chunks) {
            const [chunkX, chunkZ] = key.split(',').map(Number);
            const distance = Math.max(Math.abs(chunkX - playerChunkX), Math.abs(chunkZ - playerChunkZ));

            if (distance > renderDistance) {
                keysToRemove.push(key);
            }
        }

        keysToRemove.forEach(key => {
            const chunk = this.chunks.get(key);
            chunk.dispose();
            this.chunks.delete(key);
        });
    }
}
