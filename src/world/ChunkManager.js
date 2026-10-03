import * as THREE from 'three';
import { Chunk } from './Chunk.js';
import { TerrainGenerator } from './TerrainGenerator.js';

export class ChunkManager {
    constructor(scene, chunkSize, chunkHeight, renderDistance, seed) {
        this.scene = scene;
        this.chunkSize = chunkSize;
        this.chunkHeight = chunkHeight;
        this.renderDistance = renderDistance;
        this.chunks = new Map();
        this.terrainGenerator = new TerrainGenerator(seed);
        this.loadedChunks = new Set();
    }

    getChunkKey(x, z) {
        return `${x},${z}`;
    }

    getChunk(x, z) {
        const key = this.getChunkKey(x, z);
        if (!this.chunks.has(key)) {
            const chunk = new Chunk(x, z, this.chunkSize, this.chunkHeight, this.terrainGenerator);
            this.chunks.set(key, chunk);
            this.scene.add(chunk.mesh);
        }
        return this.chunks.get(key);
    }

    getBlock(x, y, z) {
        const chunkX = Math.floor(x / this.chunkSize);
        const chunkZ = Math.floor(z / this.chunkSize);
        const localX = ((x % this.chunkSize) + this.chunkSize) % this.chunkSize;
        const localZ = ((z % this.chunkSize) + this.chunkSize) % this.chunkSize;

        if (y < 0 || y >= this.chunkHeight) return 0;

        const chunk = this.chunks.get(this.getChunkKey(chunkX, chunkZ));
        if (!chunk) return 0;
        return chunk.getBlock(localX, y, localZ);
    }

    setBlock(x, y, z, blockType) {
        const chunkX = Math.floor(x / this.chunkSize);
        const chunkZ = Math.floor(z / this.chunkSize);
        const localX = ((x % this.chunkSize) + this.chunkSize) % this.chunkSize;
        const localZ = ((z % this.chunkSize) + this.chunkSize) % this.chunkSize;

        if (y < 0 || y >= this.chunkHeight) return;

        const chunk = this.getChunk(chunkX, chunkZ);
        chunk.setBlock(localX, y, localZ, blockType);
        chunk.updateMesh();

        const adjChunks = [
            [chunkX + 1, chunkZ],
            [chunkX - 1, chunkZ],
            [chunkX, chunkZ + 1],
            [chunkX, chunkZ - 1]
        ];

        for (const [cx, cz] of adjChunks) {
            const adjChunk = this.chunks.get(this.getChunkKey(cx, cz));
            if (adjChunk) adjChunk.updateMesh();
        }
    }

    updateVisibleChunks(centerChunkX, centerChunkZ) {
        const newLoaded = new Set();

        for (let x = centerChunkX - this.renderDistance; x <= centerChunkX + this.renderDistance; x++) {
            for (let z = centerChunkZ - this.renderDistance; z <= centerChunkZ + this.renderDistance; z++) {
                const key = this.getChunkKey(x, z);
                newLoaded.add(key);
                this.getChunk(x, z);
            }
        }

        for (const key of this.loadedChunks) {
            if (!newLoaded.has(key)) {
                const chunk = this.chunks.get(key);
                if (chunk) {
                    this.scene.remove(chunk.mesh);
                    chunk.dispose();
                    this.chunks.delete(key);
                }
            }
        }

        this.loadedChunks = newLoaded;
    }

    raycast(origin, direction, maxDistance = 100) {
        const step = 0.1;
        let distance = 0;
        const currentPos = origin.clone();
        const lastPos = origin.clone();

        while (distance < maxDistance) {
            lastPos.copy(currentPos);
            currentPos.addScaledVector(direction, step);
            distance += step;

            const x = Math.floor(currentPos.x);
            const y = Math.floor(currentPos.y);
            const z = Math.floor(currentPos.z);

            const block = this.getBlock(x, y, z);
            if (block > 0) {
                return {
                    blockPos: new THREE.Vector3(x, y, z),
                    placePos: new THREE.Vector3(
                        Math.floor(lastPos.x),
                        Math.floor(lastPos.y),
                        Math.floor(lastPos.z)
                    ),
                    distance
                };
            }
        }

        return null;
    }
}
