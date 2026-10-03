import * as THREE from 'three';
import { BLOCK_TYPES, BLOCK_NAMES } from './blocks.js';

const CHUNK_SIZE = 16;
const CHUNK_HEIGHT = 256;

export class Chunk {
    constructor(x, z, size, height) {
        this.x = x;
        this.z = z;
        this.size = size;
        this.height = height;
        this.blocks = new Uint8Array(size * height * size);
        this.blockNameToId = new Map();
        this.initBlockIdMap();
    }

    initBlockIdMap() {
        BLOCK_NAMES.forEach((name, index) => {
            this.blockNameToId.set(name, index + 1);
        });
    }

    getIndex(x, y, z) {
        return y * this.size * this.size + z * this.size + x;
    }

    getBlock(x, y, z) {
        if (x < 0 || x >= this.size || y < 0 || y >= this.height || z < 0 || z >= this.size) {
            return null;
        }
        const index = this.getIndex(x, y, z);
        const blockId = this.blocks[index];
        return blockId === 0 ? null : BLOCK_NAMES[blockId - 1];
    }

    setBlock(x, y, z, type) {
        if (x < 0 || x >= this.size || y < 0 || y >= this.height || z < 0 || z >= this.size) {
            return;
        }
        const index = this.getIndex(x, y, z);
        if (type === null) {
            this.blocks[index] = 0;
        } else {
            const blockId = this.blockNameToId.get(type) || 0;
            this.blocks[index] = blockId;
        }
    }

    isBlockSolid(x, y, z) {
        const block = this.getBlock(x, y, z);
        return block && BLOCK_TYPES[block].solid !== false;
    }

    buildMesh() {
        const geometry = new THREE.BufferGeometry();
        const positions = [];
        const normals = [];
        const uvs = [];
        const faceCount = { count: 0 };

        for (let y = 0; y < this.height; y++) {
            for (let z = 0; z < this.size; z++) {
                for (let x = 0; x < this.size; x++) {
                    const block = this.getBlock(x, y, z);
                    if (!block) continue;

                    const blockData = BLOCK_TYPES[block];
                    if (!blockData.solid) continue;

                    this.addBlockFaces(x, y, z, block, positions, normals, uvs);
                }
            }
        }

        if (positions.length === 0) {
            return new THREE.Mesh(new THREE.BufferGeometry(), new THREE.MeshStandardMaterial());
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3));
        geometry.setAttribute('normal', new THREE.BufferAttribute(new Float32Array(normals), 3));
        geometry.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(uvs), 2));
        geometry.computeBoundingSphere();

        const material = new THREE.MeshStandardMaterial({
            roughness: 0.8,
            metalness: 0.1
        });

        return new THREE.Mesh(geometry, material);
    }

    addBlockFaces(x, y, z, block, positions, normals, uvs) {
        const faces = [
            { dir: [0, 1, 0], vertices: [[x, y+1, z], [x+1, y+1, z], [x+1, y+1, z+1], [x, y+1, z+1]] },
            { dir: [0, -1, 0], vertices: [[x, y, z], [x, y, z+1], [x+1, y, z+1], [x+1, y, z]] },
            { dir: [1, 0, 0], vertices: [[x+1, y, z], [x+1, y, z+1], [x+1, y+1, z+1], [x+1, y+1, z]] },
            { dir: [-1, 0, 0], vertices: [[x, y, z], [x, y+1, z], [x, y+1, z+1], [x, y, z+1]] },
            { dir: [0, 0, 1], vertices: [[x, y, z+1], [x+1, y, z+1], [x+1, y+1, z+1], [x, y+1, z+1]] },
            { dir: [0, 0, -1], vertices: [[x, y, z], [x, y+1, z], [x+1, y+1, z], [x+1, y, z]] }
        ];

        for (const faceData of faces) {
            const [dx, dy, dz] = faceData.dir;
            if (!this.isBlockSolid(x + dx, y + dy, z + dz)) {
                const [v0, v1, v2, v3] = faceData.vertices;
                const normal = new THREE.Vector3(dx, dy, dz).normalize();

                positions.push(...v0, ...v1, ...v2);
                positions.push(...v0, ...v2, ...v3);

                for (let i = 0; i < 6; i++) {
                    normals.push(normal.x, normal.y, normal.z);
                }

                uvs.push(0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1);
            }
        }
    }
}
