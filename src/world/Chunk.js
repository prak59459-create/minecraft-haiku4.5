import * as THREE from 'three';
import { BlockType } from './BlockType.js';
import { TreeGenerator } from './TreeGenerator.js';

export class Chunk {
    constructor(x, z, size, height, terrainGenerator) {
        this.x = x;
        this.z = z;
        this.size = size;
        this.height = height;
        this.terrainGenerator = terrainGenerator;

        this.blocks = new Uint8Array(size * height * size);
        this.generateTerrain();

        this.mesh = new THREE.Group();
        this.updateMesh();
    }

    generateTerrain() {
        for (let lx = 0; lx < this.size; lx++) {
            for (let lz = 0; lz < this.size; lz++) {
                const wx = this.x * this.size + lx;
                const wz = this.z * this.size + lz;

                const terrainHeight = Math.floor(
                    this.terrainGenerator.getHeight(wx, wz) * (this.height - 1)
                );

                for (let y = 0; y < this.height; y++) {
                    let blockType = 0;
                    if (y < terrainHeight - 3) {
                        blockType = BlockType.STONE;
                    } else if (y < terrainHeight - 1) {
                        blockType = BlockType.DIRT;
                    } else if (y === terrainHeight - 1) {
                        blockType = BlockType.GRASS;
                    }

                    if (y < 5 && blockType === 0) {
                        blockType = BlockType.WATER;
                    }

                    this.setBlock(lx, y, lz, blockType);
                }

                // Generate trees
                if (this.x % 2 === 0 && this.z % 2 === 0) {
                    if (TreeGenerator.shouldGenerateTree(wx, wz)) {
                        TreeGenerator.generateTree(this.terrainGenerator.chunkManager || {
                            getBlock: (x, y, z) => this.getBlock(x - this.x * this.size, y, z - this.z * this.size),
                            setBlock: (x, y, z, type) => this.setBlock(x - this.x * this.size, y, z - this.z * this.size, type)
                        }, wx, terrainHeight, wz);
                    }
                }
            }
        }
    }

    getBlock(x, y, z) {
        if (x < 0 || x >= this.size || y < 0 || y >= this.height || z < 0 || z >= this.size) {
            return 0;
        }
        return this.blocks[x + y * this.size + z * this.size * this.height];
    }

    setBlock(x, y, z, type) {
        if (x >= 0 && x < this.size && y >= 0 && y < this.height && z >= 0 && z < this.size) {
            this.blocks[x + y * this.size + z * this.size * this.height] = type;
        }
    }

    updateMesh() {
        this.mesh.clear();

        const geometry = new THREE.BufferGeometry();
        const positions = [];
        const colors = [];
        const indices = [];
        let vertexIndex = 0;

        for (let x = 0; x < this.size; x++) {
            for (let y = 0; y < this.height; y++) {
                for (let z = 0; z < this.size; z++) {
                    const blockType = this.getBlock(x, y, z);
                    if (blockType === 0) continue;

                    const worldX = this.x * this.size + x;
                    const worldZ = this.z * this.size + z;
                    const color = BlockType.getColor(blockType);

                    const faces = [
                        { dir: [1, 0, 0], corners: [[1, 1, 0], [1, 1, 1], [1, 0, 1], [1, 0, 0]] },
                        { dir: [-1, 0, 0], corners: [[0, 1, 1], [0, 1, 0], [0, 0, 0], [0, 0, 1]] },
                        { dir: [0, 1, 0], corners: [[0, 1, 1], [1, 1, 1], [1, 1, 0], [0, 1, 0]] },
                        { dir: [0, -1, 0], corners: [[0, 0, 0], [1, 0, 0], [1, 0, 1], [0, 0, 1]] },
                        { dir: [0, 0, 1], corners: [[0, 0, 1], [1, 0, 1], [1, 1, 1], [0, 1, 1]] },
                        { dir: [0, 0, -1], corners: [[1, 0, 0], [1, 1, 0], [0, 1, 0], [0, 0, 0]] }
                    ];

                    for (const face of faces) {
                        const [dx, dy, dz] = face.dir;
                        const neighborX = x + dx;
                        const neighborY = y + dy;
                        const neighborZ = z + dz;

                        if (this.getBlock(neighborX, neighborY, neighborZ) === 0) {
                            const baseIndex = vertexIndex;

                            for (const [cx, cy, cz] of face.corners) {
                                positions.push(worldX + cx, y + cy, worldZ + cz);
                                colors.push(color.r, color.g, color.b);
                            }

                            indices.push(baseIndex, baseIndex + 1, baseIndex + 2);
                            indices.push(baseIndex, baseIndex + 2, baseIndex + 3);
                            vertexIndex += 4;
                        }
                    }
                }
            }
        }

        if (positions.length > 0) {
            geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3));
            geometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array(colors), 3));
            geometry.setIndex(new THREE.BufferAttribute(new Uint32Array(indices), 1));

            const material = new THREE.MeshPhongMaterial({
                side: THREE.FrontSide,
                vertexColors: true,
                flatShading: true
            });

            const mesh = new THREE.Mesh(geometry, material);
            this.mesh.add(mesh);
        }
    }

    dispose() {
        this.mesh.traverse(obj => {
            if (obj.geometry) obj.geometry.dispose();
            if (obj.material) obj.material.dispose();
        });
    }
}
