class Chunk {
    constructor(x, z, worldSeed) {
        this.x = x;
        this.z = z;
        this.data = new Uint8Array(CHUNK_SIZE * CHUNK_HEIGHT * CHUNK_SIZE);
        this.mesh = null;
        this.isDirty = true;
        this.worldSeed = worldSeed;
        this.generateTerrain();
    }

    generateTerrain() {
        const noise = new SimplexNoise(() => Math.random());

        for (let lx = 0; lx < CHUNK_SIZE; lx++) {
            for (let lz = 0; lz < CHUNK_SIZE; lz++) {
                const x = this.x * CHUNK_SIZE + lx;
                const z = this.z * CHUNK_SIZE + lz;

                const height = this.getTerrainHeight(x, z, noise);

                for (let y = 0; y < CHUNK_HEIGHT; y++) {
                    let blockId = 0;

                    if (y < height - 3) {
                        blockId = 1;
                    } else if (y < height) {
                        blockId = 2;
                    } else if (y === height) {
                        blockId = 3;
                    }

                    if (y < 62 && blockId === 0) {
                        blockId = 6;
                    }

                    this.setBlock(lx, y, lz, blockId);
                }

                if (Math.random() < 0.03 && height > 65) {
                    this.generateTree(lx, height, lz);
                }
            }
        }
    }

    getTerrainHeight(x, z, noise) {
        let height = 64;

        const scale1 = noise.noise(x * 0.01, z * 0.01) * 32;
        const scale2 = noise.noise(x * 0.05, z * 0.05) * 16;
        const scale3 = noise.noise(x * 0.1, z * 0.1) * 8;

        height += scale1 + scale2 + scale3;

        return Math.floor(Math.max(50, Math.min(120, height)));
    }

    generateTree(lx, height, lz) {
        const trunkHeight = 4 + Math.floor(Math.random() * 3);

        for (let y = 0; y < trunkHeight; y++) {
            if (height + y < CHUNK_HEIGHT) {
                this.setBlock(lx, height + y, lz, 4);
            }
        }

        const foliageRadius = 3;
        for (let dy = 0; dy < foliageRadius; dy++) {
            const y = height + trunkHeight + dy;
            if (y >= CHUNK_HEIGHT) break;

            const radius = Math.max(0, foliageRadius - dy - 1);
            for (let dx = -radius; dx <= radius; dx++) {
                for (let dz = -radius; dz <= radius; dz++) {
                    if (dx * dx + dz * dz <= radius * radius) {
                        if (Math.abs(dx) === radius || Math.abs(dz) === radius) {
                            this.setBlock(lx + dx, y, lz + dz, 5);
                        } else {
                            this.setBlock(lx + dx, y, lz + dz, 5);
                        }
                    }
                }
            }
        }
    }

    setBlock(x, y, z, id) {
        if (x < 0 || x >= CHUNK_SIZE || y < 0 || y >= CHUNK_HEIGHT || z < 0 || z >= CHUNK_SIZE) {
            return;
        }
        this.data[y * CHUNK_SIZE * CHUNK_SIZE + z * CHUNK_SIZE + x] = id;
        this.isDirty = true;
    }

    getBlock(x, y, z) {
        if (x < 0 || x >= CHUNK_SIZE || y < 0 || y >= CHUNK_HEIGHT || z < 0 || z >= CHUNK_SIZE) {
            return undefined;
        }
        return this.data[y * CHUNK_SIZE * CHUNK_SIZE + z * CHUNK_SIZE + x];
    }

    buildMesh(scene) {
        if (this.mesh) {
            scene.remove(this.mesh);
        }

        if (this.mesh) {
            this.mesh.geometry.dispose();
            this.mesh.material.dispose();
        }

        const geometry = new THREE.BufferGeometry();
        const positions = [];
        const colors = [];
        const indices = [];
        let vertexCount = 0;

        for (let x = 0; x < CHUNK_SIZE; x++) {
            for (let y = 0; y < CHUNK_HEIGHT; y++) {
                for (let z = 0; z < CHUNK_SIZE; z++) {
                    const blockId = this.getBlock(x, y, z);
                    if (blockId === 0) continue;

                    const blockType = blockRegistry.get(blockId);
                    const color = new THREE.Color(blockType.color);

                    this.addBlockGeometry(x, y, z, blockId, positions, colors, indices, vertexCount);
                    vertexCount = positions.length / 3;
                }
            }
        }

        if (positions.length === 0) {
            this.mesh = null;
            return;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(new Uint8Array(colors), 3, true));
        geometry.setIndex(new THREE.BufferAttribute(new Uint32Array(indices), 1));
        geometry.computeBoundingSphere();

        const material = new THREE.MeshPhongMaterial({
            vertexColors: true,
            flatShading: true,
            side: THREE.FrontSide
        });

        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.set(this.x * CHUNK_SIZE, 0, this.z * CHUNK_SIZE);
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;
        this.mesh.frustumCulled = true;

        scene.add(this.mesh);
    }

    addBlockGeometry(x, y, z, blockId, positions, colors, indices, vertexCount) {
        const size = BLOCK_SIZE;
        const bx = x * size;
        const by = y * size;
        const bz = z * size;

        const blockType = blockRegistry.get(blockId);
        const color = new THREE.Color(blockType.color);

        const faces = [
            { vertices: [[0, 1, 0], [1, 1, 0], [1, 1, 1], [0, 1, 1]] },
            { vertices: [[0, 0, 1], [1, 0, 1], [1, 0, 0], [0, 0, 0]] },
            { vertices: [[0, 0, 1], [0, 1, 1], [1, 1, 1], [1, 0, 1]] },
            { vertices: [[1, 0, 0], [1, 1, 0], [0, 1, 0], [0, 0, 0]] },
            { vertices: [[1, 0, 0], [1, 1, 0], [1, 1, 1], [1, 0, 1]] },
            { vertices: [[0, 0, 1], [0, 1, 1], [0, 1, 0], [0, 0, 0]] }
        ];

        for (const face of faces) {
            const startIdx = vertexCount;

            for (const vert of face.vertices) {
                positions.push(bx + vert[0] * size, by + vert[1] * size, bz + vert[2] * size);
                colors.push(
                    Math.floor(color.r * 255),
                    Math.floor(color.g * 255),
                    Math.floor(color.b * 255)
                );
            }

            indices.push(startIdx, startIdx + 1, startIdx + 2);
            indices.push(startIdx, startIdx + 2, startIdx + 3);
            vertexCount += 4;
        }
    }
}

class World {
    constructor(scene, seed = WORLD_SEED) {
        this.scene = scene;
        this.seed = seed;
        this.chunks = new Map();
        this.loadedChunkCoords = new Set();
        this.time = 0;
        this.dayLength = 1200;
    }

    updateChunks(playerPos) {
        const playerChunkX = Math.floor(playerPos.x / CHUNK_SIZE);
        const playerChunkZ = Math.floor(playerPos.z / CHUNK_SIZE);

        const chunksToLoad = [];
        const chunksToUnload = [];

        for (let x = -RENDER_DISTANCE; x <= RENDER_DISTANCE; x++) {
            for (let z = -RENDER_DISTANCE; z <= RENDER_DISTANCE; z++) {
                const chunkX = playerChunkX + x;
                const chunkZ = playerChunkZ + z;
                const key = `${chunkX},${chunkZ}`;

                if (!this.loadedChunkCoords.has(key)) {
                    chunksToLoad.push([chunkX, chunkZ]);
                    this.loadedChunkCoords.add(key);
                }
            }
        }

        for (const [chunkX, chunkZ] of this.loadedChunkCoords) {
            const dist = Math.max(Math.abs(chunkX - playerChunkX), Math.abs(chunkZ - playerChunkZ));
            if (dist > RENDER_DISTANCE) {
                chunksToUnload.push([chunkX, chunkZ]);
            }
        }

        for (const [x, z] of chunksToLoad) {
            this.loadChunk(x, z);
        }

        for (const [x, z] of chunksToUnload) {
            this.unloadChunk(x, z);
        }
    }

    loadChunk(x, z) {
        const key = `${x},${z}`;
        if (this.chunks.has(key)) return;

        const chunk = new Chunk(x, z, this.seed);
        this.chunks.set(key, chunk);
        chunk.buildMesh(this.scene);
    }

    unloadChunk(x, z) {
        const key = `${x},${z}`;
        const chunk = this.chunks.get(key);
        if (chunk) {
            if (chunk.mesh) {
                this.scene.remove(chunk.mesh);
            }
            this.chunks.delete(key);
            this.loadedChunkCoords.delete(key);
        }
    }

    getBlockAt(x, y, z) {
        const chunkX = Math.floor(x / CHUNK_SIZE);
        const chunkZ = Math.floor(z / CHUNK_SIZE);
        const localX = Math.floor(x - chunkX * CHUNK_SIZE);
        const localZ = Math.floor(z - chunkZ * CHUNK_SIZE);
        const localY = Math.floor(y);

        const key = `${chunkX},${chunkZ}`;
        const chunk = this.chunks.get(key);

        if (!chunk) return 0;
        return chunk.getBlock(localX, localY, localZ) || 0;
    }

    setBlockAt(x, y, z, blockId) {
        const chunkX = Math.floor(x / CHUNK_SIZE);
        const chunkZ = Math.floor(z / CHUNK_SIZE);
        const localX = Math.floor(x - chunkX * CHUNK_SIZE);
        const localZ = Math.floor(z - chunkZ * CHUNK_SIZE);
        const localY = Math.floor(y);

        const key = `${chunkX},${chunkZ}`;
        const chunk = this.chunks.get(key);

        if (chunk) {
            chunk.setBlock(localX, localY, localZ, blockId);
            chunk.buildMesh(this.scene);
        }
    }

    update() {
        this.time = (this.time + 1) % this.dayLength;
    }

    getTimeOfDay() {
        return this.time / this.dayLength;
    }

    getSkyColor() {
        const t = this.getTimeOfDay();
        const dayColor = new THREE.Color(0x87ceeb);
        const nightColor = new THREE.Color(0x0a0e27);

        let sunPos = (t - 0.25) * Math.PI / 0.5;
        if (t < 0.25 || t > 0.75) {
            sunPos = Math.PI / 2;
        }

        const brightness = Math.max(0, Math.sin(sunPos));

        return dayColor.lerp(nightColor, 1 - brightness);
    }

    getLightLevel() {
        const t = this.getTimeOfDay();
        const sunPos = (t - 0.25) * Math.PI / 0.5;
        const brightness = Math.max(0.2, Math.sin(sunPos));
        return brightness;
    }
}
