import * as THREE from 'three';
import { BLOCK_TYPES } from './blocks.js';

const CHUNK_SIZE = 16;
const CHUNK_HEIGHT = 256;

export class Chunk {
    constructor(x, z, size, height) {
        this.x = x;
        this.z = z;
        this.size = size;
        this.height = height;
        this.blocks = new Uint8Array(size * height * size);
        this.blockMaterials = new Map();
        this.initMaterials();
    }

    initMaterials() {
        for (const [type, data] of Object.entries(BLOCK_TYPES)) {
            const material = new THREE.MeshStandardMaterial({
                map: data.texture,
                roughness: 0.8,
                metalness: 0.1
            });
            this.blockMaterials.set(type, material);
        }
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
        return blockId === 0 ? null : Object.keys(BLOCK_TYPES)[blockId - 1];
    }

    setBlock(x, y, z, type) {
        if (x < 0 || x >= this.size || y < 0 || y >= this.height || z < 0 || z >= this.size) {
            return;
        }
        const index = this.getIndex(x, y, z);
        if (type === null) {
            this.blocks[index] = 0;
        } else {
            const blockId = Object.keys(BLOCK_TYPES).indexOf(type) + 1;
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
        const materials = [];
        const groups = [];

        let groupStart = 0;
        let currentMaterial = null;

        for (let y = 0; y < this.height; y++) {
            for (let z = 0; z < this.size; z++) {
                for (let x = 0; x < this.size; x++) {
                    const block = this.getBlock(x, y, z);
                    if (!block) continue;

                    const blockData = BLOCK_TYPES[block];
                    if (!blockData.solid) continue;

                    // Check each face
                    this.addBlockFace(x, y, z, block, positions, normals, uvs, geometry, groupStart);
                    groupStart = positions.length / 3;
                }
            }
        }

        if (positions.length === 0) {
            // Return empty mesh for empty chunks
            return new THREE.Mesh(new THREE.BufferGeometry(), new THREE.Material());
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3));
        geometry.setAttribute('normal', new THREE.BufferAttribute(new Float32Array(normals), 3));
        geometry.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(uvs), 2));

        const material = new THREE.MeshStandardMaterial({
            roughness: 0.8,
            metalness: 0.1
        });

        return new THREE.Mesh(geometry, material);
    }

    addBlockFace(x, y, z, block, positions, normals, uvs, geometry, startIndex) {
        const faces = [
            { dir: [0, 1, 0], face: 'top', vertices: [[x, y+1, z], [x+1, y+1, z], [x+1, y+1, z+1], [x, y+1, z+1]] },
            { dir: [0, -1, 0], face: 'bottom', vertices: [[x, y, z], [x, y, z+1], [x+1, y, z+1], [x+1, y, z]] },
            { dir: [1, 0, 0], face: 'right', vertices: [[x+1, y, z], [x+1, y, z+1], [x+1, y+1, z+1], [x+1, y+1, z]] },
            { dir: [-1, 0, 0], face: 'left', vertices: [[x, y, z], [x, y+1, z], [x, y+1, z+1], [x, y, z+1]] },
            { dir: [0, 0, 1], face: 'front', vertices: [[x, y, z+1], [x+1, y, z+1], [x+1, y+1, z+1], [x, y+1, z+1]] },
            { dir: [0, 0, -1], face: 'back', vertices: [[x, y, z], [x, y+1, z], [x+1, y+1, z], [x+1, y, z]] }
        ];

        for (const faceData of faces) {
            const [dx, dy, dz] = faceData.dir;
            const nx = x + dx;
            const ny = y + dy;
            const nz = z + dz;

            if (!this.isBlockSolid(nx, ny, nz)) {
                const [v0, v1, v2, v3] = faceData.vertices;
                const normalVec = new THREE.Vector3(dx, dy, dz);

                // Triangle 1
                positions.push(...v0, ...v1, ...v2);
                normals.push(normalVec.x, normalVec.y, normalVec.z);
                normals.push(normalVec.x, normalVec.y, normalVec.z);
                normals.push(normalVec.x, normalVec.y, normalVec.z);
                uvs.push(0, 0, 1, 0, 1, 1);

                // Triangle 2
                positions.push(...v0, ...v2, ...v3);
                normals.push(normalVec.x, normalVec.y, normalVec.z);
                normals.push(normalVec.x, normalVec.y, normalVec.z);
                normals.push(normalVec.x, normalVec.y, normalVec.z);
                uvs.push(0, 0, 1, 1, 0, 1);
            }
        }
    }
}
