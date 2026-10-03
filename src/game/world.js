import * as THREE from 'three';

export class World {
    constructor(scene, noise) {
        this.scene = scene;
        this.noise = noise;
        this.chunks = new Map();
        this.chunkSize = 16;
        this.chunkHeight = 256;
        this.renderDistance = 2;
        this.blockTypes = {
            0: { name: 'air', color: 0x87ceeb, solid: false },
            1: { name: 'grass', color: 0x2d5016, solid: true },
            2: { name: 'dirt', color: 0x8b6f47, solid: true },
            3: { name: 'stone', color: 0x7f7f7f, solid: true },
            4: { name: 'wood', color: 0x8b4513, solid: true },
            5: { name: 'leaves', color: 0x228b22, solid: true },
            6: { name: 'water', color: 0x4488ff, solid: false },
        };
    }

    getChunkKey(x, z) {
        return `${Math.floor(x / this.chunkSize)},${Math.floor(z / this.chunkSize)}`;
    }

    getBlockType(x, y, z) {
        const chunkKey = this.getChunkKey(x, z);
        const chunk = this.chunks.get(chunkKey);
        if (!chunk) return 0;

        const localX = ((x % this.chunkSize) + this.chunkSize) % this.chunkSize;
        const localZ = ((z % this.chunkSize) + this.chunkSize) % this.chunkSize;

        if (y < 0 || y >= this.chunkHeight) return 0;

        const idx = localX + localZ * this.chunkSize + y * this.chunkSize * this.chunkSize;
        return chunk.blocks[idx] || 0;
    }

    setBlockType(x, y, z, type) {
        const chunkKey = this.getChunkKey(x, z);
        let chunk = this.chunks.get(chunkKey);
        if (!chunk) return;

        const localX = ((x % this.chunkSize) + this.chunkSize) % this.chunkSize;
        const localZ = ((z % this.chunkSize) + this.chunkSize) % this.chunkSize;

        if (y < 0 || y >= this.chunkHeight) return;

        const idx = localX + localZ * this.chunkSize + y * this.chunkSize * this.chunkSize;
        chunk.blocks[idx] = type;

        this.rebuildChunkMesh(chunkKey);

        // Rebuild adjacent chunks if needed
        if (localX === 0) this.rebuildChunkMesh(this.getChunkKey(x - 1, z));
        if (localX === this.chunkSize - 1) this.rebuildChunkMesh(this.getChunkKey(x + 1, z));
        if (localZ === 0) this.rebuildChunkMesh(this.getChunkKey(x, z - 1));
        if (localZ === this.chunkSize - 1) this.rebuildChunkMesh(this.getChunkKey(x, z + 1));
    }

    generateChunk(chunkX, chunkZ) {
        const blocks = new Uint8Array(this.chunkSize * this.chunkSize * this.chunkHeight);

        for (let x = 0; x < this.chunkSize; x++) {
            for (let z = 0; z < this.chunkSize; z++) {
                const worldX = chunkX * this.chunkSize + x;
                const worldZ = chunkZ * this.chunkSize + z;

                // Use Simplex noise for terrain generation
                const heightNoise = (this.noise.noise2D(worldX * 0.01, worldZ * 0.01) + 1) * 0.5;
                const terrainHeight = Math.floor(heightNoise * 80) + 50;

                for (let y = 0; y < this.chunkHeight; y++) {
                    let blockType = 0;

                    if (y < terrainHeight - 3) {
                        blockType = 3; // stone
                    } else if (y < terrainHeight) {
                        blockType = 2; // dirt
                    } else if (y === terrainHeight) {
                        blockType = 1; // grass
                    } else if (y < terrainHeight + 5) {
                        // Trees
                        const treeNoise = this.noise.noise2D(worldX * 0.1, worldZ * 0.1);
                        if (treeNoise > 0.5 && y === terrainHeight + 1) {
                            blockType = 4; // wood
                        } else if (treeNoise > 0.5 && y > terrainHeight && y < terrainHeight + 5) {
                            blockType = 5; // leaves
                        }
                    }

                    const idx = x + z * this.chunkSize + y * this.chunkSize * this.chunkSize;
                    blocks[idx] = blockType;
                }
            }
        }

        return blocks;
    }

    createChunk(chunkX, chunkZ) {
        const chunkKey = `${chunkX},${chunkZ}`;

        if (this.chunks.has(chunkKey)) {
            return;
        }

        const blocks = this.generateChunk(chunkX, chunkZ);
        const mesh = this.buildChunkMesh(chunkX, chunkZ, blocks);

        const chunk = {
            x: chunkX,
            z: chunkZ,
            blocks: blocks,
            mesh: mesh,
            meshDirty: false
        };

        this.chunks.set(chunkKey, chunk);
        if (mesh) this.scene.add(mesh);
    }

    buildChunkMesh(chunkX, chunkZ, blocks) {
        const geometry = new THREE.BufferGeometry();
        const vertices = [];
        const indices = [];
        const colors = [];
        let vertexCount = 0;

        for (let x = 0; x < this.chunkSize; x++) {
            for (let z = 0; z < this.chunkSize; z++) {
                for (let y = 0; y < this.chunkHeight; y++) {
                    const idx = x + z * this.chunkSize + y * this.chunkSize * this.chunkSize;
                    const blockType = blocks[idx];

                    if (blockType === 0) continue;

                    const blockColor = this.blockTypes[blockType].color;
                    const worldX = chunkX * this.chunkSize + x;
                    const worldY = y;
                    const worldZ = chunkZ * this.chunkSize + z;

                    // Add cube vertices if block is visible
                    this.addBlockFaces(
                        vertices, indices, colors,
                        worldX, worldY, worldZ,
                        blockType, blocks, chunkX, chunkZ,
                        blockColor, vertexCount
                    );
                    vertexCount = vertices.length / 3;
                }
            }
        }

        if (vertices.length === 0) return null;

        geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(vertices), 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(new Uint8Array(colors), 3, true));
        geometry.setIndex(new THREE.BufferAttribute(new Uint32Array(indices), 1));

        const material = new THREE.MeshPhongMaterial({
            vertexColors: true,
            side: THREE.FrontSide,
            flatShading: true
        });

        const mesh = new THREE.Mesh(geometry, material);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        return mesh;
    }

    addBlockFaces(vertices, indices, colors, x, y, z, blockType, blocks, chunkX, chunkZ, color, vertexOffset) {
        const faces = [
            // right
            [
                [x + 1, y, z], [x + 1, y + 1, z], [x + 1, y + 1, z + 1], [x + 1, y, z + 1],
                [1, 0, 0]
            ],
            // left
            [
                [x, y, z + 1], [x, y + 1, z + 1], [x, y + 1, z], [x, y, z],
                [-1, 0, 0]
            ],
            // top
            [
                [x, y + 1, z], [x, y + 1, z + 1], [x + 1, y + 1, z + 1], [x + 1, y + 1, z],
                [0, 1, 0]
            ],
            // bottom
            [
                [x, y, z + 1], [x, y, z], [x + 1, y, z], [x + 1, y, z + 1],
                [0, -1, 0]
            ],
            // front
            [
                [x + 1, y, z], [x + 1, y + 1, z], [x, y + 1, z], [x, y, z],
                [0, 0, -1]
            ],
            // back
            [
                [x, y, z + 1], [x, y + 1, z + 1], [x + 1, y + 1, z + 1], [x + 1, y, z + 1],
                [0, 0, 1]
            ]
        ];

        const r = (color >> 16) & 255;
        const g = (color >> 8) & 255;
        const b = color & 255;
        const colorDarken = 0.8;

        for (const face of faces) {
            const faceVertices = face[0];
            const normal = face[1];

            // Check if face is visible (adjacent block is air)
            const checkX = x + Math.round(normal[0]);
            const checkY = y + Math.round(normal[1]);
            const checkZ = z + Math.round(normal[2]);

            const adjacentBlock = this.getBlockType(checkX, checkY, checkZ);
            if (adjacentBlock !== 0 && this.blockTypes[adjacentBlock]?.solid) continue;

            const startIdx = vertices.length / 3;

            for (const vertex of faceVertices) {
                vertices.push(vertex[0], vertex[1], vertex[2]);

                let faceColor = [r, g, b];
                // Darken based on face direction for depth perception
                if (Math.abs(normal[1]) < 1) {
                    faceColor = faceColor.map(c => Math.floor(c * colorDarken));
                }
                colors.push(...faceColor);
            }

            indices.push(
                startIdx, startIdx + 1, startIdx + 2,
                startIdx, startIdx + 2, startIdx + 3
            );
        }
    }

    rebuildChunkMesh(chunkKey) {
        const chunk = this.chunks.get(chunkKey);
        if (!chunk) return;

        if (chunk.mesh) {
            this.scene.remove(chunk.mesh);
            chunk.mesh.geometry.dispose();
            chunk.mesh.material.dispose();
        }

        const parts = chunkKey.split(',');
        const chunkX = parseInt(parts[0]);
        const chunkZ = parseInt(parts[1]);

        const mesh = this.buildChunkMesh(chunkX, chunkZ, chunk.blocks);
        chunk.mesh = mesh;

        if (mesh) {
            this.scene.add(mesh);
        }
    }

    update(playerPos) {
        const playerChunkX = Math.floor(playerPos.x / this.chunkSize);
        const playerChunkZ = Math.floor(playerPos.z / this.chunkSize);

        // Load chunks
        for (let dx = -this.renderDistance; dx <= this.renderDistance; dx++) {
            for (let dz = -this.renderDistance; dz <= this.renderDistance; dz++) {
                this.createChunk(playerChunkX + dx, playerChunkZ + dz);
            }
        }

        // Unload distant chunks
        for (const [chunkKey, chunk] of this.chunks.entries()) {
            const dist = Math.abs(chunk.x - playerChunkX) + Math.abs(chunk.z - playerChunkZ);
            if (dist > this.renderDistance + 1) {
                this.scene.remove(chunk.mesh);
                if (chunk.mesh) {
                    chunk.mesh.geometry.dispose();
                    chunk.mesh.material.dispose();
                }
                this.chunks.delete(chunkKey);
            }
        }
    }
}
