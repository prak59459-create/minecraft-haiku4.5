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
        const waterLevel = 62;

        for (let x = 0; x < this.size; x++) {
            for (let z = 0; z < this.size; z++) {
                const worldX = startX + x;
                const worldZ = startZ + z;

                const height = this.terrainGenerator.getHeightAt(worldX, worldZ);

                for (let y = 0; y < this.worldHeight; y++) {
                    let blockType = 'air';

                    if (y === 0) {
                        blockType = 'bedrock';
                    } else if (y < height - 3) {
                        blockType = 'stone';
                    } else if (y < height - 1) {
                        blockType = 'dirt';
                    } else if (y < height) {
                        blockType = 'grass';
                    } else if (y <= waterLevel) {
                        blockType = 'water';
                    } else {
                        blockType = 'air';
                    }

                    this.setBlock(x, y, z, blockType);
                }
            }
        }

        this.generateTrees();
    }

    generateTrees() {
        const startX = this.chunkX * this.size;
        const startZ = this.chunkZ * this.size;

        for (let x = 0; x < this.size; x++) {
            for (let z = 0; z < this.size; z++) {
                const worldX = startX + x;
                const worldZ = startZ + z;

                const hash = Math.abs(Math.sin(worldX * 73.1 + worldZ * 97.3) * 10000) % 1000;
                if (hash < 30) {
                    const height = this.terrainGenerator.getHeightAt(worldX, worldZ);
                    if (height > 65 && height < 130) {
                        this.createTree(x, height, z);
                    }
                }
            }
        }
    }

    createTree(x, baseHeight, z) {
        const trunkHeight = 5 + Math.floor(Math.random() * 3);

        for (let i = 0; i < trunkHeight; i++) {
            const y = baseHeight + i;
            if (y < this.worldHeight && this.getBlock(x, y, z) && this.getBlock(x, y, z).type === 'air') {
                this.setBlock(x, y, z, 'wood');
            }
        }

        const foliageRadius = 3;
        const foliageHeight = baseHeight + trunkHeight;

        for (let dx = -foliageRadius; dx <= foliageRadius; dx++) {
            for (let dz = -foliageRadius; dz <= foliageRadius; dz++) {
                for (let dy = 0; dy < 4; dy++) {
                    const nx = x + dx;
                    const nz = z + dz;
                    const ny = foliageHeight + dy;

                    if (nx >= 0 && nx < this.size && nz >= 0 && nz < this.size && ny < this.worldHeight) {
                        const dist = Math.sqrt(dx * dx + dz * dz + dy * dy);
                        if (dist <= foliageRadius + 0.5) {
                            if (this.getBlock(nx, ny, nz) && this.getBlock(nx, ny, nz).type === 'air') {
                                this.setBlock(nx, ny, nz, 'leaves');
                            }
                        }
                    }
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

        const shouldRenderFace = (neighbor) => !neighbor || neighbor.type === 'air' || neighbor.type === 'water';

        const positions = [
            [[x + 1, y, z], [x + 1, y + 1, z], [x + 1, y + 1, z + 1], [x + 1, y, z + 1]],
            [[x, y, z + 1], [x, y + 1, z + 1], [x, y + 1, z], [x, y, z]],
            [[x, y + 1, z], [x + 1, y + 1, z], [x + 1, y + 1, z + 1], [x, y + 1, z + 1]],
            [[x, y, z + 1], [x + 1, y, z + 1], [x + 1, y, z], [x, y, z]],
            [[x + 1, y, z + 1], [x + 1, y + 1, z + 1], [x, y + 1, z + 1], [x, y, z + 1]],
            [[x, y, z], [x, y + 1, z], [x + 1, y + 1, z], [x + 1, y, z]]
        ];

        for (let i = 0; i < neighbors.length; i++) {
            if (shouldRenderFace(neighbors[i])) {
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
            'bedrock': [0, 0.75],
            'grass': [0, 0.875],
            'dirt': [0.125, 0.875],
            'stone': [0.25, 0.875],
            'wood': [0.375, 0.875],
            'leaves': [0.5, 0.875],
            'water': [0.625, 0.875],
            'sand': [0.75, 0.875],
            'gravel': [0.875, 0.875],
            'cobblestone': [0.125, 0.75]
        };
        return uvMap[blockType] || [0, 0];
    }

    getBlockTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');

        const blocks = ['bedrock', 'grass', 'dirt', 'stone', 'wood', 'leaves', 'water', 'sand', 'gravel', 'cobblestone'];
        const colors = ['#1a1a1a', '#90EE90', '#8B4513', '#808080', '#CD853F', '#228B22', '#4169E1', '#EDC9AF', '#A9A9A9', '#696969'];

        for (let i = 0; i < blocks.length; i++) {
            const x = (i % 8) * 32;
            const y = Math.floor(i / 8) * 32;
            ctx.fillStyle = colors[i];
            ctx.fillRect(x, y, 32, 32);

            for (let px = 0; px < 32; px++) {
                for (let py = 0; py < 32; py++) {
                    if (Math.random() < 0.1) {
                        ctx.fillStyle = colors[i].replace(/[0-9a-f]/g, (c) => {
                            const val = parseInt(c, 16);
                            const newVal = Math.max(0, val - 2);
                            return newVal.toString(16);
                        });
                        ctx.fillRect(x + px, y + py, 1, 1);
                    }
                }
            }

            ctx.strokeStyle = '#000';
            ctx.lineWidth = 0.5;
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
