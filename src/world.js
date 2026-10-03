import * as THREE from 'three';
import { BLOCK_TYPES, getBlockData } from './blocks.js';
import { TerrainGenerator } from './terrain.js';

const CHUNK_SIZE = 16;
const RENDER_DISTANCE = 8;
const MAX_HEIGHT = 256;

export class Chunk {
    constructor(x, z, terrain) {
        this.x = x;
        this.z = z;
        this.terrain = terrain;
        this.blocks = terrain.generateChunk(x, z, CHUNK_SIZE);
        this.mesh = null;
        this.needsUpdate = true;
    }

    getBlock(x, y, z) {
        const key = `${x},${y},${z}`;
        return this.blocks.get(key) || BLOCK_TYPES.AIR;
    }

    setBlock(x, y, z, blockType) {
        const key = `${x},${y},${z}`;
        if (blockType === BLOCK_TYPES.AIR) {
            this.blocks.delete(key);
        } else {
            this.blocks.set(key, blockType);
        }
        this.needsUpdate = true;
    }

    generateMesh() {
        if (!this.needsUpdate && this.mesh) return this.mesh;

        if (this.mesh) {
            this.mesh.geometry.dispose();
            this.mesh.material.dispose();
        }

        const geometry = new THREE.BufferGeometry();
        const positions = [];
        const colors = [];
        const indices = [];
        let indexOffset = 0;

        const baseX = this.x * CHUNK_SIZE;
        const baseZ = this.z * CHUNK_SIZE;

        for (const [key, blockType] of this.blocks) {
            if (blockType === BLOCK_TYPES.AIR) continue;

            const parts = key.split(',');
            const x = parseInt(parts[0]);
            const y = parseInt(parts[1]);
            const z = parseInt(parts[2]);

            const blockData = getBlockData(blockType);
            if (!blockData.solid) continue;

            this.addBlockFaces(
                x, y, z,
                positions, colors, indices, indexOffset,
                blockData
            );
            indexOffset = indices.length;
        }

        if (positions.length === 0) {
            this.mesh = null;
            return null;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(new Uint8Array(colors), 3, true));
        geometry.setIndex(new THREE.BufferAttribute(new Uint32Array(indices), 1));

        const material = new THREE.MeshLambertMaterial({
            vertexColors: true,
            side: THREE.FrontSide,
        });

        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.set(baseX, 0, baseZ);
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;

        this.needsUpdate = false;
        return this.mesh;
    }

    addBlockFaces(x, y, z, positions, colors, indices, indexOffset, blockData) {
        const faces = [
            { dir: [0, 1, 0], vertices: [[0,1,0], [1,1,0], [1,1,1], [0,1,1]], color: blockData.colors.top },
            { dir: [0, -1, 0], vertices: [[0,0,0], [0,0,1], [1,0,1], [1,0,0]], color: blockData.colors.bottom },
            { dir: [0, 0, 1], vertices: [[0,0,1], [0,1,1], [1,1,1], [1,0,1]], color: blockData.colors.side },
            { dir: [0, 0, -1], vertices: [[0,0,0], [1,0,0], [1,1,0], [0,1,0]], color: blockData.colors.side },
            { dir: [1, 0, 0], vertices: [[1,0,0], [1,0,1], [1,1,1], [1,1,0]], color: blockData.colors.side },
            { dir: [-1, 0, 0], vertices: [[0,0,0], [0,1,0], [0,1,1], [0,0,1]], color: blockData.colors.side },
        ];

        for (const face of faces) {
            const nx = x + face.dir[0];
            const ny = y + face.dir[1];
            const nz = z + face.dir[2];

            const neighborType = this.getBlockAt(nx, ny, nz);
            if (neighborType !== BLOCK_TYPES.AIR && getBlockData(neighborType).solid) {
                continue;
            }

            const r = (face.color >> 16) & 0xff;
            const g = (face.color >> 8) & 0xff;
            const b = face.color & 0xff;

            const start = positions.length / 3;
            for (const [vx, vy, vz] of face.vertices) {
                positions.push(x + vx, y + vy, z + vz);
                colors.push(r, g, b);
            }

            indices.push(start, start + 1, start + 2);
            indices.push(start, start + 2, start + 3);
        }
    }

    getBlockAt(x, y, z) {
        const key = `${x},${y},${z}`;
        return this.blocks.get(key) || BLOCK_TYPES.AIR;
    }

    dispose() {
        if (this.mesh) {
            this.mesh.geometry.dispose();
            this.mesh.material.dispose();
            this.mesh = null;
        }
    }
}

export class World {
    constructor(seed = 12345) {
        this.terrain = new TerrainGenerator(seed);
        this.chunks = new Map();
        this.seed = seed;
    }

    getChunk(x, z) {
        const key = `${x},${z}`;
        if (!this.chunks.has(key)) {
            const chunk = new Chunk(x, z, this.terrain);
            this.chunks.set(key, chunk);
        }
        return this.chunks.get(key);
    }

    getBlockAt(x, y, z) {
        const chunkX = Math.floor(x / CHUNK_SIZE);
        const chunkZ = Math.floor(z / CHUNK_SIZE);
        const localX = ((x % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
        const localZ = ((z % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;

        const chunk = this.getChunk(chunkX, chunkZ);
        return chunk.getBlockAt(x, y, z);
    }

    setBlockAt(x, y, z, blockType) {
        const chunkX = Math.floor(x / CHUNK_SIZE);
        const chunkZ = Math.floor(z / CHUNK_SIZE);
        const chunk = this.getChunk(chunkX, chunkZ);
        chunk.setBlock(x, y, z, blockType);

        const chunks = [chunk];
        if (x % CHUNK_SIZE === 0) chunks.push(this.getChunk(chunkX - 1, chunkZ));
        if (x % CHUNK_SIZE === CHUNK_SIZE - 1) chunks.push(this.getChunk(chunkX + 1, chunkZ));
        if (z % CHUNK_SIZE === 0) chunks.push(this.getChunk(chunkX, chunkZ - 1));
        if (z % CHUNK_SIZE === CHUNK_SIZE - 1) chunks.push(this.getChunk(chunkX, chunkZ + 1));

        for (const c of chunks) {
            c.needsUpdate = true;
        }
    }

    update(playerPos) {
        const playerChunkX = Math.floor(playerPos.x / CHUNK_SIZE);
        const playerChunkZ = Math.floor(playerPos.z / CHUNK_SIZE);

        const toLoad = [];
        const loaded = new Set();

        for (let cx = playerChunkX - RENDER_DISTANCE; cx <= playerChunkX + RENDER_DISTANCE; cx++) {
            for (let cz = playerChunkZ - RENDER_DISTANCE; cz <= playerChunkZ + RENDER_DISTANCE; cz++) {
                const key = `${cx},${cz}`;
                const chunk = this.getChunk(cx, cz);
                loaded.add(key);
                toLoad.push(chunk);
            }
        }

        return { chunks: toLoad, loaded };
    }

    getLoadedChunks() {
        const chunks = [];
        for (const chunk of this.chunks.values()) {
            if (chunk.mesh) {
                chunks.push(chunk);
            }
        }
        return chunks;
    }

    dispose() {
        for (const chunk of this.chunks.values()) {
            chunk.dispose();
        }
        this.chunks.clear();
    }
}
