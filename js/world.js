const CHUNK_SIZE = 16;
const CHUNK_HEIGHT = 256;
const RENDER_DISTANCE = 8;
const SEA_LEVEL = 64;

class Chunk {
    constructor(x, z) {
        this.x = x;
        this.z = z;
        this.blocks = new Uint8Array(CHUNK_SIZE * CHUNK_SIZE * CHUNK_HEIGHT);
        this.mesh = null;
        this.generated = false;
    }

    getBlock(x, y, z) {
        if (x < 0 || x >= CHUNK_SIZE || y < 0 || y >= CHUNK_HEIGHT || z < 0 || z >= CHUNK_SIZE) {
            return 0;
        }
        return this.blocks[x + z * CHUNK_SIZE + y * CHUNK_SIZE * CHUNK_SIZE];
    }

    setBlock(x, y, z, type) {
        if (x < 0 || x >= CHUNK_SIZE || y < 0 || y >= CHUNK_HEIGHT || z < 0 || z >= CHUNK_SIZE) {
            return false;
        }
        this.blocks[x + z * CHUNK_SIZE + y * CHUNK_SIZE * CHUNK_SIZE] = type;
        return true;
    }
}

class World {
    constructor(scene) {
        this.scene = scene;
        this.chunks = new Map();
        this.noise = new SimplexNoise();
        this.meshes = new THREE.Group();
        this.scene.add(this.meshes);
    }

    getChunk(x, z) {
        const key = `${x},${z}`;
        return this.chunks.get(key);
    }

    getOrCreateChunk(x, z) {
        const key = `${x},${z}`;
        if (!this.chunks.has(key)) {
            const chunk = new Chunk(x, z);
            this.generateTerrain(chunk);
            this.chunks.set(key, chunk);
            return chunk;
        }
        return this.chunks.get(key);
    }

    generateTerrain(chunk) {
        const offsetX = chunk.x * CHUNK_SIZE;
        const offsetZ = chunk.z * CHUNK_SIZE;

        for (let x = 0; x < CHUNK_SIZE; x++) {
            for (let z = 0; z < CHUNK_SIZE; z++) {
                const worldX = offsetX + x;
                const worldZ = offsetZ + z;

                const height = this.getTerrainHeight(worldX, worldZ);
                const biomeType = this.getBiomeType(worldX, worldZ);

                for (let y = 0; y < CHUNK_HEIGHT; y++) {
                    let blockType = 0;

                    if (y < height - 4) {
                        blockType = 3; // Stone
                    } else if (y < height - 1) {
                        blockType = biomeType === 'sand' ? 7 : 2; // Dirt or Sand
                    } else if (y < height) {
                        blockType = 2; // Dirt
                    } else if (y === height) {
                        if (biomeType === 'sand') {
                            blockType = 7; // Sand
                        } else if (biomeType === 'gravel') {
                            blockType = 8; // Gravel
                        } else {
                            blockType = 1; // Grass
                        }
                    } else if (y < SEA_LEVEL && height <= SEA_LEVEL) {
                        blockType = 6; // Water
                    }

                    // Add caves
                    if (blockType !== 0 && this.isCaveBlock(worldX, y, worldZ)) {
                        blockType = 0;
                    }

                    chunk.setBlock(x, y, z, blockType);
                }

                // Add trees
                if (biomeType !== 'sand' && biomeType !== 'gravel') {
                    const treeChance = biomeType === 'forest' ? 0.05 : 0.02;
                    if (Math.random() < treeChance && height > SEA_LEVEL) {
                        this.generateTree(chunk, x, Math.floor(height), z);
                    }
                }
            }
        }
        chunk.generated = true;
    }

    generateTree(chunk, x, y, z) {
        const height = 5 + Math.floor(Math.random() * 3);
        const offsetX = chunk.x * CHUNK_SIZE;
        const offsetZ = chunk.z * CHUNK_SIZE;

        for (let i = 0; i < height; i++) {
            const worldX = offsetX + x;
            const worldZ = offsetZ + z;
            const targetChunk = this.getOrCreateChunk(Math.floor(worldX / CHUNK_SIZE), Math.floor(worldZ / CHUNK_SIZE));
            const localX = worldX % CHUNK_SIZE;
            const localZ = worldZ % CHUNK_SIZE;
            targetChunk.setBlock(localX, y + i, localZ, 4); // Log
        }

        // Leaves
        const leafRadius = 3;
        for (let dx = -leafRadius; dx <= leafRadius; dx++) {
            for (let dz = -leafRadius; dz <= leafRadius; dz++) {
                for (let dy = -2; dy <= 2; dy++) {
                    const dist = Math.sqrt(dx * dx + dz * dz);
                    if (dist < leafRadius && dy < 2) {
                        const worldX = offsetX + x + dx;
                        const worldZ = offsetZ + z + dz;
                        const targetChunk = this.getOrCreateChunk(Math.floor(worldX / CHUNK_SIZE), Math.floor(worldZ / CHUNK_SIZE));
                        const localX = ((worldX % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
                        const localZ = ((worldZ % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
                        if (y + height + dy < CHUNK_HEIGHT) {
                            targetChunk.setBlock(localX, y + height + dy, localZ, 5); // Leaves
                        }
                    }
                }
            }
        }
    }

    getTerrainHeight(x, z) {
        const scale = 0.05;
        const n1 = this.noise.noise(x * scale, z * scale) * 40;
        const n2 = this.noise.noise(x * scale * 0.5, z * scale * 0.5) * 80;
        const height = SEA_LEVEL + n1 + n2;
        return Math.floor(Math.clamp(height, 10, 200));
    }

    getBiomeType(x, z) {
        const scale = 0.02;
        const biomeNoise = this.noise.noise(x * scale, z * scale);

        if (biomeNoise < -0.3) return 'forest';
        if (biomeNoise < 0) return 'grass';
        if (biomeNoise < 0.3) return 'sand';
        return 'gravel';
    }

    isCaveBlock(x, y, z) {
        const scale = 0.1;
        const caveNoise = this.noise.noise(x * scale, y * scale * 0.5, z * scale);
        return caveNoise > 0.6 && y > 20 && y < 100;
    }

    getBlock(x, y, z) {
        const chunkX = Math.floor(x / CHUNK_SIZE);
        const chunkZ = Math.floor(z / CHUNK_SIZE);
        const chunk = this.getChunk(chunkX, chunkZ);

        if (!chunk) return 0;

        const localX = ((x % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
        const localZ = ((z % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;

        return chunk.getBlock(localX, y, localZ);
    }

    setBlock(x, y, z, type) {
        const chunkX = Math.floor(x / CHUNK_SIZE);
        const chunkZ = Math.floor(z / CHUNK_SIZE);
        const chunk = this.getOrCreateChunk(chunkX, chunkZ);

        const localX = ((x % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
        const localZ = ((z % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;

        const result = chunk.setBlock(localX, y, localZ, type);
        if (result) {
            this.updateChunkMesh(chunk);
            // Update neighboring chunks if block is on edge
            if (localX === 0) this.updateChunkMesh(this.getOrCreateChunk(chunkX - 1, chunkZ));
            if (localX === CHUNK_SIZE - 1) this.updateChunkMesh(this.getOrCreateChunk(chunkX + 1, chunkZ));
            if (localZ === 0) this.updateChunkMesh(this.getOrCreateChunk(chunkX, chunkZ - 1));
            if (localZ === CHUNK_SIZE - 1) this.updateChunkMesh(this.getOrCreateChunk(chunkX, chunkZ + 1));
        }
        return result;
    }

    updateChunkMesh(chunk) {
        if (!chunk || !chunk.generated) return;

        if (chunk.mesh) {
            this.meshes.remove(chunk.mesh);
            chunk.mesh.geometry.dispose();
            chunk.mesh.material.dispose();
            chunk.mesh = null;
        }

        chunk.mesh = this.buildChunkMesh(chunk);
        if (chunk.mesh) {
            this.meshes.add(chunk.mesh);
        }
    }

    buildChunkMesh(chunk) {
        const geometry = new THREE.BufferGeometry();
        const positions = [];
        const colors = [];
        const indices = [];
        let vertexIndex = 0;

        const offsetX = chunk.x * CHUNK_SIZE;
        const offsetZ = chunk.z * CHUNK_SIZE;

        for (let x = 0; x < CHUNK_SIZE; x++) {
            for (let z = 0; z < CHUNK_SIZE; z++) {
                for (let y = 0; y < CHUNK_HEIGHT; y++) {
                    const blockType = chunk.getBlock(x, y, z);
                    if (!isBlockSolid(blockType)) continue;

                    const block = BLOCKS[blockType];
                    if (!block) continue;

                    // Check each face
                    const faces = [
                        { dir: [0, 0, 1], normal: [0, 0, 1], vertices: [[0, 1, 1], [1, 1, 1], [1, 0, 1], [0, 0, 1]] }, // front
                        { dir: [0, 0, -1], normal: [0, 0, -1], vertices: [[1, 1, 0], [0, 1, 0], [0, 0, 0], [1, 0, 0]] }, // back
                        { dir: [1, 0, 0], normal: [1, 0, 0], vertices: [[1, 1, 1], [1, 1, 0], [1, 0, 0], [1, 0, 1]] }, // right
                        { dir: [-1, 0, 0], normal: [-1, 0, 0], vertices: [[0, 1, 0], [0, 1, 1], [0, 0, 1], [0, 0, 0]] }, // left
                        { dir: [0, 1, 0], normal: [0, 1, 0], vertices: [[0, 1, 1], [1, 1, 1], [1, 1, 0], [0, 1, 0]] }, // top
                        { dir: [0, -1, 0], normal: [0, -1, 0], vertices: [[1, 0, 1], [0, 0, 1], [0, 0, 0], [1, 0, 0]] }, // bottom
                    ];

                    faces.forEach((face, faceIdx) => {
                        const neighbor = this.getBlock(
                            offsetX + x + face.dir[0],
                            y + face.dir[1],
                            offsetZ + z + face.dir[2]
                        );

                        if (!isBlockSolid(neighbor)) {
                            const color = new THREE.Color(getBlockColor(blockType, ['front', 'back', 'right', 'left', 'top', 'bottom'][faceIdx]));
                            face.vertices.forEach(vertex => {
                                positions.push(x + vertex[0], y + vertex[1], z + vertex[2]);
                                colors.push(color.r, color.g, color.b);
                            });

                            indices.push(vertexIndex, vertexIndex + 1, vertexIndex + 2);
                            indices.push(vertexIndex, vertexIndex + 2, vertexIndex + 3);
                            vertexIndex += 4;
                        }
                    });
                }
            }
        }

        if (positions.length === 0) return null;

        geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array(colors), 3));
        geometry.setIndex(new THREE.BufferAttribute(new Uint32Array(indices), 1));
        geometry.computeVertexNormals();

        const material = new THREE.MeshStandardMaterial({
            vertexColors: true,
            roughness: 0.7,
            metalness: 0,
            flatShading: false
        });

        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(offsetX, 0, offsetZ);
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        return mesh;
    }

    update(playerPos) {
        const playerChunkX = Math.floor(playerPos.x / CHUNK_SIZE);
        const playerChunkZ = Math.floor(playerPos.z / CHUNK_SIZE);

        // Load chunks around player
        for (let x = playerChunkX - RENDER_DISTANCE; x <= playerChunkX + RENDER_DISTANCE; x++) {
            for (let z = playerChunkZ - RENDER_DISTANCE; z <= playerChunkZ + RENDER_DISTANCE; z++) {
                const chunk = this.getOrCreateChunk(x, z);
                if (!chunk.mesh && chunk.generated) {
                    this.updateChunkMesh(chunk);
                }
            }
        }

        // Unload distant chunks
        for (const [key, chunk] of this.chunks.entries()) {
            const dist = Math.abs(chunk.x - playerChunkX) + Math.abs(chunk.z - playerChunkZ);
            if (dist > RENDER_DISTANCE + 2) {
                this.chunks.delete(key);
                if (chunk.mesh) {
                    this.meshes.remove(chunk.mesh);
                    chunk.mesh.geometry.dispose();
                    chunk.mesh.material.dispose();
                }
            }
        }
    }
}

// Add clamp function if missing
if (!Math.clamp) {
    Math.clamp = function(value, min, max) {
        return Math.min(Math.max(value, min), max);
    };
}
