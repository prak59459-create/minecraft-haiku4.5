import * as THREE from 'three';

export class Chunk {
    constructor(chunkX, chunkZ, size, blockDatabase, terrainGenerator) {
        this.chunkX = chunkX;
        this.chunkZ = chunkZ;
        this.size = size;
        this.blockDatabase = blockDatabase;
        this.terrainGenerator = terrainGenerator;
        this.worldHeight = 256;

        this.blocks = new Uint16Array(size * size * this.worldHeight);
        this.mesh = null;
    }

    getIndex(x, y, z) {
        return x + z * this.size + y * this.size * this.size;
    }

    getBlock(x, y, z) {
        if (x < 0 || x >= this.size || y < 0 || y >= this.worldHeight || z < 0 || z >= this.size) {
            return null;
        }
        const blockId = this.blocks[this.getIndex(x, y, z)];
        return this.blockDatabase.getBlockById(blockId);
    }

    setBlock(x, y, z, blockType) {
        if (x < 0 || x >= this.size || y < 0 || y >= this.worldHeight || z < 0 || z >= this.size) {
            return;
        }
        const blockId = this.blockDatabase.getBlockId(blockType);
        this.blocks[this.getIndex(x, y, z)] = blockId;
    }

    generate() {
        const startX = this.chunkX * this.size;
        const startZ = this.chunkZ * this.size;

        for (let x = 0; x < this.size; x++) {
            for (let z = 0; z < this.size; z++) {
                const worldX = startX + x;
                const worldZ = startZ + z;

                const height = this.terrainGenerator.getHeightAt(worldX, worldZ);

                for (let y = 0; y < this.worldHeight; y++) {
                    let blockType = 'air';

                    if (y < height - 2) {
                        blockType = 'stone';
                    } else if (y < height - 1) {
                        blockType = 'dirt';
                    } else if (y < height) {
                        blockType = 'grass';
                    } else if (y === height && Math.random() < 0.1) {
                        blockType = 'water';
                    } else if (y > 0 && y < 10) {
                        blockType = 'air';
                    }

                    if (y < 5 && Math.random() < 0.3) {
                        blockType = 'water';
                    }

                    this.setBlock(x, y, z, blockType);
                }
            }
        }
    }

    build() {
        const geometry = new THREE.BufferGeometry();
        const vertices = [];
        const indices = [];
        const texCoords = [];
        let indexCount = 0;

        for (let x = 0; x < this.size; x++) {
            for (let y = 0; y < this.worldHeight; y++) {
                for (let z = 0; z < this.size; z++) {
                    const block = this.getBlock(x, y, z);
                    if (!block || block.type === 'air') continue;

                    const worldX = this.chunkX * this.size + x;
                    const worldZ = this.chunkZ * this.size + z;

                    this.addBlockFaces(vertices, indices, texCoords, indexCount, x, y, z, worldX, worldZ, block);
                    indexCount = indices.length / 3;
                }
            }
        }

        if (vertices.length > 0) {
            geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(vertices), 3));
            geometry.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(texCoords), 2));
            geometry.setIndex(new THREE.BufferAttribute(new Uint32Array(indices), 1));
            geometry.computeVertexNormals();

            const material = new THREE.MeshStandardMaterial({
                map: this.getBlockTexture(),
                metalness: 0.1,
                roughness: 0.8
            });

            this.mesh = new THREE.Mesh(geometry, material);
            this.mesh.position.set(this.chunkX * this.size, 0, this.chunkZ * this.size);
            this.mesh.castShadow = true;
            this.mesh.receiveShadow = true;
        }
    }

    addBlockFaces(vertices, indices, texCoords, startIndex, x, y, z, worldX, worldZ, block) {
        const neighbors = [
            this.getBlock(x + 1, y, z),
            this.getBlock(x - 1, y, z),
            this.getBlock(x, y + 1, z),
            this.getBlock(x, y - 1, z),
            this.getBlock(x, y, z + 1),
            this.getBlock(x, y, z - 1)
        ];

        const positions = [
            [
                [x + 1, y, z], [x + 1, y + 1, z], [x + 1, y + 1, z + 1], [x + 1, y, z + 1]
            ],
            [
                [x, y, z + 1], [x, y + 1, z + 1], [x, y + 1, z], [x, y, z]
            ],
            [
                [x, y + 1, z], [x + 1, y + 1, z], [x + 1, y + 1, z + 1], [x, y + 1, z + 1]
            ],
            [
                [x, y, z + 1], [x + 1, y, z + 1], [x + 1, y, z], [x, y, z]
            ],
            [
                [x + 1, y, z + 1], [x + 1, y + 1, z + 1], [x, y + 1, z + 1], [x, y, z + 1]
            ],
            [
                [x, y, z], [x, y + 1, z], [x + 1, y + 1, z], [x + 1, y, z]
            ]
        ];

        for (let i = 0; i < neighbors.length; i++) {
            if (!neighbors[i] || neighbors[i].type === 'air') {
                const face = positions[i];
                const baseIndex = vertices.length / 3;

                for (const point of face) {
                    vertices.push(point[0], point[1], point[2]);
                }

                indices.push(baseIndex, baseIndex + 1, baseIndex + 2);
                indices.push(baseIndex, baseIndex + 2, baseIndex + 3);

                const uv = this.getBlockUV(block.type);
                texCoords.push(uv[0], uv[1]);
                texCoords.push(uv[0], uv[1] + 0.125);
                texCoords.push(uv[0] + 0.125, uv[1] + 0.125);
                texCoords.push(uv[0] + 0.125, uv[1]);
            }
        }
    }

    getBlockUV(blockType) {
        const uvMap = {
            'grass': [0, 0.875],
            'dirt': [0.125, 0.875],
            'stone': [0.25, 0.875],
            'wood': [0.375, 0.875],
            'leaves': [0.5, 0.875],
            'water': [0.625, 0.875],
            'sand': [0.75, 0.875],
            'gravel': [0.875, 0.875],
            'cobblestone': [0, 0.75]
        };
        return uvMap[blockType] || [0, 0];
    }

    getBlockTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');

        const blocks = ['grass', 'dirt', 'stone', 'wood', 'leaves', 'water', 'sand', 'gravel', 'cobblestone'];
        const colors = ['#90EE90', '#8B4513', '#808080', '#CD853F', '#228B22', '#4169E1', '#EDC9AF', '#A9A9A9', '#696969'];

        for (let i = 0; i < blocks.length; i++) {
            const x = (i % 8) * 32;
            const y = Math.floor(i / 8) * 32;
            ctx.fillStyle = colors[i];
            ctx.fillRect(x, y, 32, 32);
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 1;
            ctx.strokeRect(x, y, 32, 32);
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.magFilter = THREE.NearestFilter;
        texture.minFilter = THREE.NearestFilter;
        return texture;
    }

    rebuild() {
        if (this.mesh) {
            this.mesh.geometry.dispose();
            this.mesh.material.dispose();
        }
        this.build();
    }
}
