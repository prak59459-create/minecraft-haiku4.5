class World {
    constructor() {
        this.chunks = new Map();
        this.perlin = new SimplexNoise(WORLD_SEED);
        this.meshes = new Map();
        this.meshUpdateQueue = new Set();
        this.generationQueue = [];
    }

    getBlock(x, y, z) {
        if (y < 0 || y >= CHUNK_HEIGHT) return BLOCKS.AIR;

        const [localX, localY, localZ, chunkX, chunkZ] = getLocalBlockCoords(x, 0, z);
        const hash = hashChunkCoords(chunkX, chunkZ);

        if (!this.chunks.has(hash)) {
            this.generateChunk(chunkX, chunkZ);
        }

        const chunk = this.chunks.get(hash);
        return chunk.getBlock(localX, y, localZ);
    }

    setBlock(x, y, z, blockId) {
        if (y < 0 || y >= CHUNK_HEIGHT) return;

        const [localX, localY, localZ, chunkX, chunkZ] = getLocalBlockCoords(x, 0, z);
        const hash = hashChunkCoords(chunkX, chunkZ);

        if (!this.chunks.has(hash)) {
            this.generateChunk(chunkX, chunkZ);
        }

        const chunk = this.chunks.get(hash);
        chunk.setBlock(localX, y, localZ, blockId);

        if (this.meshes.has(hash)) {
            this.updateChunkMesh(chunkX, chunkZ);
        }

        // Update neighboring chunks if block is on edge
        if (localX === 0) this.updateChunkMesh(chunkX - 1, chunkZ);
        if (localX === CHUNK_SIZE - 1) this.updateChunkMesh(chunkX + 1, chunkZ);
        if (localZ === 0) this.updateChunkMesh(chunkX, chunkZ - 1);
        if (localZ === CHUNK_SIZE - 1) this.updateChunkMesh(chunkX, chunkZ + 1);
    }

    generateChunk(chunkX, chunkZ) {
        const chunk = new Chunk(chunkX, chunkZ);
        const waterLevel = 64;

        for (let x = 0; x < CHUNK_SIZE; x++) {
            for (let z = 0; z < CHUNK_SIZE; z++) {
                const worldX = chunkX * CHUNK_SIZE + x;
                const worldZ = chunkZ * CHUNK_SIZE + z;

                const height = this.getTerrainHeight(worldX, worldZ);

                for (let y = 0; y < CHUNK_HEIGHT; y++) {
                    if (y < height - 2) {
                        chunk.setBlock(x, y, z, BLOCKS.STONE);
                    } else if (y < height - 1) {
                        chunk.setBlock(x, y, z, BLOCKS.DIRT);
                    } else if (y < height) {
                        chunk.setBlock(x, y, z, BLOCKS.GRASS);
                    } else if (y < waterLevel) {
                        if (Math.random() < 0.005) {
                            chunk.setBlock(x, y, z, BLOCKS.WATER);
                        }
                    } else if (y === waterLevel && height < waterLevel) {
                        chunk.setBlock(x, y, z, BLOCKS.WATER);
                    }
                }

                // Add trees
                if (height > 62 && height < 120 && Math.random() < 0.02) {
                    this.generateTree(worldX, height, worldZ);
                }

                // Add beaches
                if (height >= waterLevel - 1 && height <= waterLevel + 2) {
                    if (this.getTerrainHeight(worldX + 1, worldZ) < waterLevel ||
                        this.getTerrainHeight(worldX - 1, worldZ) < waterLevel ||
                        this.getTerrainHeight(worldX, worldZ + 1) < waterLevel ||
                        this.getTerrainHeight(worldX, worldZ - 1) < waterLevel) {
                        const topBlockY = Math.floor(height) - 1;
                        if (topBlockY >= 0 && topBlockY < CHUNK_HEIGHT) {
                            chunk.setBlock(x, topBlockY, z, BLOCKS.SAND);
                        }
                    }
                }
            }
        }

        this.chunks.set(hashChunkCoords(chunkX, chunkZ), chunk);
    }

    getTerrainHeight(x, z) {
        let height = 64;

        // Large scale terrain (mountains/valleys)
        const scale1 = this.perlin.noise2D(x * 0.004, z * 0.004);
        height += scale1 * scale1 * 40;

        // Medium scale detail (rolling hills)
        const scale2 = this.perlin.noise2D(x * 0.015, z * 0.015);
        height += scale2 * 18;

        // Small scale detail (roughness)
        height += this.perlin.noise2D(x * 0.08, z * 0.08) * 3;

        // Micro detail
        height += this.perlin.noise2D(x * 0.3, z * 0.3) * 1;

        return Math.floor(Math.max(1, Math.min(height, 140)));
    }

    generateTree(centerX, baseY, centerZ) {
        const trunkHeight = Math.floor(randomRange(4, 7));

        // Trunk
        for (let y = 0; y < trunkHeight; y++) {
            this.setBlock(centerX, baseY + y, centerZ, BLOCKS.OAK_LOG);
        }

        // Leaves
        const leavesRadius = 3;
        const leavesHeight = trunkHeight - 1;

        for (let dx = -leavesRadius; dx <= leavesRadius; dx++) {
            for (let dz = -leavesRadius; dz <= leavesRadius; dz++) {
                for (let dy = 0; dy < 4; dy++) {
                    const distance = Math.sqrt(dx * dx + dz * dz);
                    if (distance <= leavesRadius && baseY + leavesHeight + dy - 2 >= 0) {
                        const blockY = baseY + leavesHeight + dy - 2;
                        if (this.getBlock(centerX + dx, blockY, centerZ + dz) === BLOCKS.AIR) {
                            this.setBlock(centerX + dx, blockY, centerZ + dz, BLOCKS.LEAVES);
                        }
                    }
                }
            }
        }
    }

    updateChunkMesh(chunkX, chunkZ) {
        const hash = hashChunkCoords(chunkX, chunkZ);
        if (!this.meshes.has(hash)) return;

        const mesh = this.meshes.get(hash);
        mesh.parent.remove(mesh);

        const newMesh = this.createChunkMesh(chunkX, chunkZ);
        this.meshes.set(hash, newMesh);
    }

    createChunkMesh(chunkX, chunkZ) {
        const hash = hashChunkCoords(chunkX, chunkZ);
        if (!this.chunks.has(hash)) {
            this.generateChunk(chunkX, chunkZ);
        }

        const chunk = this.chunks.get(hash);
        const geometry = new THREE.BufferGeometry();
        const vertices = [];
        const colors = [];
        const indices = [];

        let vertexIndex = 0;

        for (let x = 0; x < CHUNK_SIZE; x++) {
            for (let y = 0; y < CHUNK_HEIGHT; y++) {
                for (let z = 0; z < CHUNK_SIZE; z++) {
                    const blockId = chunk.getBlock(x, y, z);

                    if (!isBlockSolid(blockId) || (isBlockLiquid(blockId))) continue;

                    const blockX = chunkX * CHUNK_SIZE + x;
                    const blockY = y;
                    const blockZ = chunkZ * CHUNK_SIZE + z;

                    const color = getBlockColor(blockId);
                    const r = (color >> 16) & 255;
                    const g = (color >> 8) & 255;
                    const b = color & 255;

                    // Check each face
                    // Top face
                    if (y + 1 >= CHUNK_HEIGHT || !isBlockSolid(chunk.getBlock(x, y + 1, z))) {
                        vertices.push(x, y + 1, z, x + 1, y + 1, z, x + 1, y + 1, z + 1, x, y + 1, z + 1);
                        const lightY = Math.min(255, Math.floor((y + 1) / CHUNK_HEIGHT * 255));
                        for (let i = 0; i < 4; i++) {
                            colors.push(r / 255, g / 255, b / 255);
                        }
                        indices.push(vertexIndex, vertexIndex + 1, vertexIndex + 2, vertexIndex, vertexIndex + 2, vertexIndex + 3);
                        vertexIndex += 4;
                    }

                    // Bottom face
                    if (y === 0 || !isBlockSolid(chunk.getBlock(x, y - 1, z))) {
                        vertices.push(x, y, z, x, y, z + 1, x + 1, y, z + 1, x + 1, y, z);
                        for (let i = 0; i < 4; i++) {
                            colors.push(r / 255 * 0.8, g / 255 * 0.8, b / 255 * 0.8);
                        }
                        indices.push(vertexIndex, vertexIndex + 1, vertexIndex + 2, vertexIndex, vertexIndex + 2, vertexIndex + 3);
                        vertexIndex += 4;
                    }

                    // Front face (z+)
                    if (z + 1 >= CHUNK_SIZE || !isBlockSolid(chunk.getBlock(x, y, z + 1))) {
                        vertices.push(x, y, z + 1, x + 1, y, z + 1, x + 1, y + 1, z + 1, x, y + 1, z + 1);
                        for (let i = 0; i < 4; i++) {
                            colors.push(r / 255 * 0.9, g / 255 * 0.9, b / 255 * 0.9);
                        }
                        indices.push(vertexIndex, vertexIndex + 1, vertexIndex + 2, vertexIndex, vertexIndex + 2, vertexIndex + 3);
                        vertexIndex += 4;
                    }

                    // Back face (z-)
                    if (z === 0 || !isBlockSolid(chunk.getBlock(x, y, z - 1))) {
                        vertices.push(x + 1, y, z, x, y, z, x, y + 1, z, x + 1, y + 1, z);
                        for (let i = 0; i < 4; i++) {
                            colors.push(r / 255 * 0.9, g / 255 * 0.9, b / 255 * 0.9);
                        }
                        indices.push(vertexIndex, vertexIndex + 1, vertexIndex + 2, vertexIndex, vertexIndex + 2, vertexIndex + 3);
                        vertexIndex += 4;
                    }

                    // Right face (x+)
                    if (x + 1 >= CHUNK_SIZE || !isBlockSolid(chunk.getBlock(x + 1, y, z))) {
                        vertices.push(x + 1, y, z, x + 1, y, z + 1, x + 1, y + 1, z + 1, x + 1, y + 1, z);
                        for (let i = 0; i < 4; i++) {
                            colors.push(r / 255 * 0.85, g / 255 * 0.85, b / 255 * 0.85);
                        }
                        indices.push(vertexIndex, vertexIndex + 1, vertexIndex + 2, vertexIndex, vertexIndex + 2, vertexIndex + 3);
                        vertexIndex += 4;
                    }

                    // Left face (x-)
                    if (x === 0 || !isBlockSolid(chunk.getBlock(x - 1, y, z))) {
                        vertices.push(x, y, z + 1, x, y, z, x, y + 1, z, x, y + 1, z + 1);
                        for (let i = 0; i < 4; i++) {
                            colors.push(r / 255 * 0.85, g / 255 * 0.85, b / 255 * 0.85);
                        }
                        indices.push(vertexIndex, vertexIndex + 1, vertexIndex + 2, vertexIndex, vertexIndex + 2, vertexIndex + 3);
                        vertexIndex += 4;
                    }
                }
            }
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(vertices), 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array(colors), 3));
        geometry.setIndex(new THREE.BufferAttribute(new Uint32Array(indices), 1));

        const material = new THREE.MeshPhongMaterial({ vertexColors: true, flatShading: true });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(chunkX * CHUNK_SIZE, 0, chunkZ * CHUNK_SIZE);

        this.meshes.set(hash, mesh);
        return mesh;
    }

    cleanup(centerChunkX, centerChunkZ) {
        const toRemove = [];

        for (const [hash, mesh] of this.meshes.entries()) {
            const [cx, cz] = unhashChunkCoords(hash);
            const distance = Math.max(Math.abs(cx - centerChunkX), Math.abs(cz - centerChunkZ));

            if (distance > RENDER_DISTANCE + 1) {
                mesh.parent?.remove(mesh);
                mesh.geometry.dispose();
                mesh.material.dispose();
                toRemove.push(hash);
            }
        }

        toRemove.forEach(hash => {
            this.meshes.delete(hash);
            this.chunks.delete(hash);
        });
    }
}

class Chunk {
    constructor(x, z) {
        this.x = x;
        this.z = z;
        this.blocks = new Uint8Array(CHUNK_SIZE * CHUNK_SIZE * CHUNK_HEIGHT);
    }

    getBlock(x, y, z) {
        if (x < 0 || x >= CHUNK_SIZE || y < 0 || y >= CHUNK_HEIGHT || z < 0 || z >= CHUNK_SIZE) {
            return BLOCKS.AIR;
        }
        return this.blocks[this.getIndex(x, y, z)];
    }

    setBlock(x, y, z, blockId) {
        if (x < 0 || x >= CHUNK_SIZE || y < 0 || y >= CHUNK_HEIGHT || z < 0 || z >= CHUNK_SIZE) {
            return;
        }
        this.blocks[this.getIndex(x, y, z)] = blockId;
    }

    getIndex(x, y, z) {
        return y * CHUNK_SIZE * CHUNK_SIZE + z * CHUNK_SIZE + x;
    }
}
