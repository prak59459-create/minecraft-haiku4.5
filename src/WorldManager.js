import * as THREE from 'three';
import { SimplexNoise } from 'simplex-noise';

export class WorldManager {
    constructor(scene, blockSystem) {
        this.scene = scene;
        this.blockSystem = blockSystem;

        this.chunkSize = 16;
        this.chunkHeight = 128;
        this.chunks = new Map();
        this.blockData = new Map();
        this.meshes = new Map();

        this.noise = new SimplexNoise(() => Math.random());
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

                // Perlin noise for height
                const height = this.getTerrainHeight(worldX, worldZ);

                for (let y = 0; y < this.chunkHeight; y++) {
                    let blockId = 0;

                    if (y === 0) {
                        blockId = 3; // Stone bedrock layer
                    } else if (y < height - 1) {
                        blockId = 3; // Stone
                    } else if (y < height) {
                        blockId = 2; // Grass
                    } else if (y < height && y > height - 4) {
                        blockId = 1; // Dirt
                    } else if (y > 60 && y < height + 5) {
                        // Random trees
                        if (Math.random() < 0.02) {
                            if (y === height) blockId = 4; // Wood trunk
                            else if (y > height && y < height + 5) blockId = 5; // Leaves
                        }
                    }

                    // Add some water
                    if (y === 40 && height < 41) {
                        blockId = 6; // Water
                    }

                    const index = x + z * this.chunkSize + y * this.chunkSize * this.chunkSize;
                    data[index] = blockId;
                }
            }
        }

        return data;
    }

    getTerrainHeight(x, z) {
        const scale = 0.05;
        let height = 64 + this.noise.noise2D(x * scale, z * scale) * 20;

        const detailScale = 0.1;
        height += this.noise.noise2D(x * detailScale, z * detailScale) * 10;

        return Math.floor(Math.max(20, Math.min(100, height)));
    }

    buildChunkMesh(cx, cz) {
        const key = this.getChunkKey(cx, cz);

        if (!this.blockData.has(key)) {
            this.blockData.set(key, this.generateChunkData(cx, cz));
        }

        const geometry = new THREE.BufferGeometry();
        const positions = [];
        const colors = [];

        for (let x = 0; x < this.chunkSize; x++) {
            for (let z = 0; z < this.chunkSize; z++) {
                for (let y = 0; y < this.chunkHeight; y++) {
                    const blockId = this.getBlock(cx * this.chunkSize + x, y, cz * this.chunkSize + z);

                    if (blockId === 0) continue;

                    if (!this.blockSystem.isBlockSolid(blockId)) continue;

                    this.addBlockFaces(
                        x, y, z,
                        blockId,
                        cx, cz,
                        positions, colors
                    );
                }
            }
        }

        if (positions.length > 0) {
            geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3));
            geometry.setAttribute('color', new THREE.BufferAttribute(new Uint8Array(colors), 3, true));
            geometry.computeVertexNormals();

            const material = new THREE.MeshPhongMaterial({
                vertexColors: true,
                side: THREE.FrontSide,
                wireframe: false
            });

            const mesh = new THREE.Mesh(geometry, material);
            mesh.position.set(cx * this.chunkSize, 0, cz * this.chunkSize);
            mesh.castShadow = true;
            mesh.receiveShadow = true;

            return { geometry, mesh };
        }

        return null;
    }

    addBlockFaces(x, y, z, blockId, cx, cz, positions, colors) {
        const worldX = cx * this.chunkSize + x;
        const worldZ = cz * this.chunkSize + z;

        const color = this.blockSystem.blocks[blockId].color;
        const r = (color >> 16) & 255;
        const g = (color >> 8) & 255;
        const b = color & 255;

        // Check each face
        const faces = [
            { dir: [1, 0, 0], normal: [1, 0, 0] },  // Right
            { dir: [-1, 0, 0], normal: [-1, 0, 0] }, // Left
            { dir: [0, 1, 0], normal: [0, 1, 0] },   // Top
            { dir: [0, -1, 0], normal: [0, -1, 0] }, // Bottom
            { dir: [0, 0, 1], normal: [0, 0, 1] },   // Front
            { dir: [0, 0, -1], normal: [0, 0, -1] }  // Back
        ];

        for (const face of faces) {
            const nx = worldX + face.dir[0];
            const ny = y + face.dir[1];
            const nz = worldZ + face.dir[2];

            const neighborId = this.getBlock(nx, ny, nz);
            if (neighborId === 0 || !this.blockSystem.isBlockSolid(neighborId)) {
                this.addFace(x, y, z, face.normal, positions, colors, r, g, b);
            }
        }
    }

    addFace(x, y, z, normal, positions, colors, r, g, b) {
        const vertices = [];

        if (normal[0] === 1) { // Right
            vertices.push([x+1, y, z], [x+1, y+1, z], [x+1, y+1, z+1], [x+1, y, z+1]);
        } else if (normal[0] === -1) { // Left
            vertices.push([x, y, z+1], [x, y+1, z+1], [x, y+1, z], [x, y, z]);
        } else if (normal[1] === 1) { // Top
            vertices.push([x, y+1, z], [x, y+1, z+1], [x+1, y+1, z+1], [x+1, y+1, z]);
        } else if (normal[1] === -1) { // Bottom
            vertices.push([x, y, z+1], [x+1, y, z+1], [x+1, y, z], [x, y, z]);
        } else if (normal[2] === 1) { // Front
            vertices.push([x, y, z+1], [x, y+1, z+1], [x+1, y+1, z+1], [x+1, y, z+1]);
        } else if (normal[2] === -1) { // Back
            vertices.push([x+1, y, z], [x+1, y+1, z], [x, y+1, z], [x, y, z]);
        }

        // Add two triangles per face
        for (let i = 0; i < 4; i++) {
            positions.push(...vertices[i]);
            colors.push(r, g, b);
        }

        // First triangle
        const baseIdx = positions.length / 3 - 4;
        // Second triangle
    }

    rebuildChunkMesh(cx, cz) {
        const key = this.getChunkKey(cx, cz);

        // Remove old mesh
        if (this.meshes.has(key)) {
            const { mesh, geometry } = this.meshes.get(key);
            this.scene.remove(mesh);
            geometry.dispose();
            this.meshes.delete(key);
        }

        // Build new mesh
        const result = this.buildChunkMesh(cx, cz);
        if (result) {
            this.meshes.set(key, result);
            this.scene.add(result.mesh);
        }
    }

    updateChunks(playerPos) {
        const pcx = Math.floor(playerPos.x / this.chunkSize);
        const pcz = Math.floor(playerPos.z / this.chunkSize);

        const chunksToLoad = [];
        const chunksToKeep = new Set();

        for (let x = -this.renderDistance; x <= this.renderDistance; x++) {
            for (let z = -this.renderDistance; z <= this.renderDistance; z++) {
                const cx = pcx + x;
                const cz = pcz + z;
                const key = this.getChunkKey(cx, cz);
                chunksToKeep.add(key);

                if (!this.meshes.has(key) && this.chunks.size < this.maxChunks) {
                    chunksToLoad.push({ cx, cz });
                }
            }
        }

        // Load new chunks
        for (const { cx, cz } of chunksToLoad) {
            this.rebuildChunkMesh(cx, cz);
        }

        // Unload far chunks
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
