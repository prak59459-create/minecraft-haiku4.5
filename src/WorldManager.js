import * as THREE from 'three';
import { TerrainGenerator } from './TerrainGenerator.js';

export class WorldManager {
    constructor(scene, blockSystem) {
        this.scene = scene;
        this.blockSystem = blockSystem;

        this.chunkSize = 16;
        this.chunkHeight = 128;
        this.chunks = new Map();
        this.blockData = new Map();
        this.meshes = new Map();

        this.terrainGenerator = new TerrainGenerator();
        this.renderDistance = 8;
        this.maxChunks = 256;
    }

    getChunkKey(cx, cz) {
        return `${cx},${cz}`;
    }

    getBlock(x, y, z) {
        if (y < 0 || y >= this.chunkHeight) return 0;

        const cx = Math.floor(x / this.chunkSize);
        const cz = Math.floor(z / this.chunkSize);
        const key = this.getChunkKey(cx, cz);

        if (!this.blockData.has(key)) {
            return 0;
        }

        const localX = ((x % this.chunkSize) + this.chunkSize) % this.chunkSize;
        const localZ = ((z % this.chunkSize) + this.chunkSize) % this.chunkSize;

        const chunkData = this.blockData.get(key);
        const index = localX + localZ * this.chunkSize + y * this.chunkSize * this.chunkSize;

        return chunkData[index] || 0;
    }

    setBlock(x, y, z, blockId) {
        if (y < 0 || y >= this.chunkHeight) return;

        const cx = Math.floor(x / this.chunkSize);
        const cz = Math.floor(z / this.chunkSize);
        const key = this.getChunkKey(cx, cz);

        if (!this.blockData.has(key)) {
            return;
        }

        const localX = ((x % this.chunkSize) + this.chunkSize) % this.chunkSize;
        const localZ = ((z % this.chunkSize) + this.chunkSize) % this.chunkSize;

        const chunkData = this.blockData.get(key);
        const index = localX + localZ * this.chunkSize + y * this.chunkSize * this.chunkSize;

        chunkData[index] = blockId;
        this.rebuildChunkMesh(cx, cz);

        // Rebuild adjacent chunks if on boundary
        if (localX === 0) this.rebuildChunkMesh(cx - 1, cz);
        if (localX === this.chunkSize - 1) this.rebuildChunkMesh(cx + 1, cz);
        if (localZ === 0) this.rebuildChunkMesh(cx, cz - 1);
        if (localZ === this.chunkSize - 1) this.rebuildChunkMesh(cx, cz + 1);
    }

    generateChunkData(cx, cz) {
        const data = new Uint8Array(this.chunkSize * this.chunkSize * this.chunkHeight);

        for (let x = 0; x < this.chunkSize; x++) {
            for (let z = 0; z < this.chunkSize; z++) {
                const worldX = cx * this.chunkSize + x;
                const worldZ = cz * this.chunkSize + z;

                const height = this.terrainGenerator.getTerrainHeight(worldX, worldZ);

                for (let y = 0; y < this.chunkHeight; y++) {
                    const blockId = this.terrainGenerator.getBlockAtPosition(worldX, y, worldZ, height);
                    const index = x + z * this.chunkSize + y * this.chunkSize * this.chunkSize;
                    data[index] = blockId;
                }
            }
        }

        return data;
    }


    buildChunkMesh(cx, cz) {
        const key = this.getChunkKey(cx, cz);

        if (!this.blockData.has(key)) {
            this.blockData.set(key, this.generateChunkData(cx, cz));
        }

        const positions = [];
        const colors = [];
        const indices = [];

        for (let x = 0; x < this.chunkSize; x++) {
            for (let z = 0; z < this.chunkSize; z++) {
                for (let y = 0; y < this.chunkHeight; y++) {
                    const blockId = this.getBlock(cx * this.chunkSize + x, y, cz * this.chunkSize + z);

                    if (blockId === 0) continue;
                    if (!this.blockSystem.isBlockSolid(blockId)) continue;

                    this.addBlockGeometry(
                        x, y, z,
                        blockId,
                        cx, cz,
                        positions, colors, indices
                    );
                }
            }
        }

        if (positions.length > 0) {
            const geometry = new THREE.BufferGeometry();
            geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3));
            geometry.setAttribute('color', new THREE.BufferAttribute(new Uint8Array(colors), 3, true));
            geometry.setIndex(new THREE.BufferAttribute(new Uint32Array(indices), 1));

            const material = new THREE.MeshPhongMaterial({
                vertexColors: true,
                side: THREE.FrontSide,
                flatShading: true
            });

            const mesh = new THREE.Mesh(geometry, material);
            mesh.position.set(cx * this.chunkSize, 0, cz * this.chunkSize);
            mesh.castShadow = true;
            mesh.receiveShadow = true;

            return { geometry, mesh };
        }

        return null;
    }

    addBlockGeometry(x, y, z, blockId, cx, cz, positions, colors, indices) {
        const worldX = cx * this.chunkSize + x;
        const worldZ = cz * this.chunkSize + z;

        const color = this.blockSystem.blocks[blockId].color;
        const r = (color >> 16) & 255;
        const g = (color >> 8) & 255;
        const b = color & 255;

        const faces = [
            { check: [1, 0, 0], verts: [[x+1,y,z], [x+1,y+1,z], [x+1,y+1,z+1], [x+1,y,z+1]] },
            { check: [-1, 0, 0], verts: [[x,y,z+1], [x,y+1,z+1], [x,y+1,z], [x,y,z]] },
            { check: [0, 1, 0], verts: [[x,y+1,z], [x,y+1,z+1], [x+1,y+1,z+1], [x+1,y+1,z]] },
            { check: [0, -1, 0], verts: [[x,y,z+1], [x+1,y,z+1], [x+1,y,z], [x,y,z]] },
            { check: [0, 0, 1], verts: [[x,y,z+1], [x,y+1,z+1], [x+1,y+1,z+1], [x+1,y,z+1]] },
            { check: [0, 0, -1], verts: [[x+1,y,z], [x+1,y+1,z], [x,y+1,z], [x,y,z]] }
        ];

        for (const face of faces) {
            const nx = worldX + face.check[0];
            const ny = y + face.check[1];
            const nz = worldZ + face.check[2];

            const neighborId = this.getBlock(nx, ny, nz);
            if (neighborId === 0 || !this.blockSystem.isBlockSolid(neighborId)) {
                this.addQuad(face.verts, positions, colors, indices, r, g, b);
            }
        }
    }

    addQuad(verts, positions, colors, indices, r, g, b) {
        const baseIdx = positions.length / 3;

        for (let i = 0; i < 4; i++) {
            positions.push(...verts[i]);
            colors.push(r, g, b);
        }

        indices.push(baseIdx, baseIdx + 1, baseIdx + 2);
        indices.push(baseIdx, baseIdx + 2, baseIdx + 3);
    }

    rebuildChunkMesh(cx, cz) {
        const key = this.getChunkKey(cx, cz);

        if (this.meshes.has(key)) {
            const { mesh, geometry } = this.meshes.get(key);
            this.scene.remove(mesh);
            geometry.dispose();
            this.meshes.delete(key);
        }

        const result = this.buildChunkMesh(cx, cz);
        if (result) {
            this.meshes.set(key, result);
            this.scene.add(result.mesh);
        }
    }

    updateChunks(playerPos) {
        const pcx = Math.floor(playerPos.x / this.chunkSize);
        const pcz = Math.floor(playerPos.z / this.chunkSize);

        const chunksToKeep = new Set();

        for (let x = -this.renderDistance; x <= this.renderDistance; x++) {
            for (let z = -this.renderDistance; z <= this.renderDistance; z++) {
                const cx = pcx + x;
                const cz = pcz + z;
                const key = this.getChunkKey(cx, cz);
                chunksToKeep.add(key);

                if (!this.meshes.has(key)) {
                    this.rebuildChunkMesh(cx, cz);
                }
            }
        }

        for (const key of this.meshes.keys()) {
            if (!chunksToKeep.has(key)) {
                const { mesh, geometry } = this.meshes.get(key);
                this.scene.remove(mesh);
                geometry.dispose();
                this.meshes.delete(key);
                this.blockData.delete(key);
            }
        }
    }

    getChunkCount() {
        return this.meshes.size;
    }
}
