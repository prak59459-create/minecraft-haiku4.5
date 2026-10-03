import * as THREE from 'three';
import { Chunk } from './chunk.js';
import { BlockDatabase } from './blocks.js';
import { TerrainGenerator } from './terrain.js';

export class World {
    constructor(scene) {
        this.scene = scene;
        this.chunks = new Map();
        this.chunkSize = 16;
        this.worldHeight = 256;
        this.renderDistance = 3;

        this.blockDatabase = new BlockDatabase();
        this.terrainGenerator = new TerrainGenerator();

        this.loadedChunks = new Set();
    }

    generate() {
        for (let x = -this.renderDistance; x <= this.renderDistance; x++) {
            for (let z = -this.renderDistance; z <= this.renderDistance; z++) {
                this.loadChunk(x, z);
            }
        }
    }

    loadChunk(chunkX, chunkZ) {
        const key = `${chunkX},${chunkZ}`;
        if (this.chunks.has(key)) return;

        const chunk = new Chunk(chunkX, chunkZ, this.chunkSize, this.blockDatabase, this.terrainGenerator);
        chunk.generate();
        chunk.build();
        this.chunks.set(key, chunk);
        this.loadedChunks.add(key);

        this.scene.add(chunk.mesh);
    }

    unloadChunk(chunkX, chunkZ) {
        const key = `${chunkX},${chunkZ}`;
        const chunk = this.chunks.get(key);
        if (chunk) {
            this.scene.remove(chunk.mesh);
            this.chunks.delete(key);
            this.loadedChunks.delete(key);
        }
    }

    getChunkKey(worldX, worldZ) {
        const chunkX = Math.floor(worldX / this.chunkSize);
        const chunkZ = Math.floor(worldZ / this.chunkSize);
        return `${chunkX},${chunkZ}`;
    }

    getChunk(worldX, worldZ) {
        const chunkX = Math.floor(worldX / this.chunkSize);
        const chunkZ = Math.floor(worldZ / this.chunkSize);
        const key = `${chunkX},${chunkZ}`;
        return this.chunks.get(key);
    }

    getBlock(position) {
        const blockX = Math.floor(position.x);
        const blockY = Math.floor(position.y);
        const blockZ = Math.floor(position.z);

        if (blockY < 0 || blockY >= this.worldHeight) return null;

        const chunk = this.getChunk(blockX, blockZ);
        if (!chunk) return null;

        const chunkX = Math.floor(blockX / this.chunkSize);
        const chunkStartX = chunkX * this.chunkSize;
        const localX = blockX - chunkStartX;

        const chunkZ = Math.floor(blockZ / this.chunkSize);
        const chunkStartZ = chunkZ * this.chunkSize;
        const localZ = blockZ - chunkStartZ;

        return chunk.getBlock(localX, blockY, localZ);
    }

    setBlock(position, blockType) {
        const blockX = Math.floor(position.x);
        const blockY = Math.floor(position.y);
        const blockZ = Math.floor(position.z);

        if (blockY < 0 || blockY >= this.worldHeight) return;

        const chunk = this.getChunk(blockX, blockZ);
        if (!chunk) return;

        const chunkX = Math.floor(blockX / this.chunkSize);
        const chunkStartX = chunkX * this.chunkSize;
        const localX = blockX - chunkStartX;

        const chunkZ = Math.floor(blockZ / this.chunkSize);
        const chunkStartZ = chunkZ * this.chunkSize;
        const localZ = blockZ - chunkStartZ;

        chunk.setBlock(localX, blockY, localZ, blockType);
        chunk.rebuild();
    }

    destroyBlock(chunk, localPos) {
        chunk.setBlock(localPos.x, localPos.y, localPos.z, 'air');
        chunk.rebuild();
    }

    placeBlock(worldPos, blockType) {
        const chunk = this.getChunk(worldPos.x, worldPos.z);
        if (!chunk) return;

        const localX = Math.floor(worldPos.x) % this.chunkSize;
        const localY = Math.floor(worldPos.y);
        const localZ = Math.floor(worldPos.z) % this.chunkSize;

        if (localX < 0 || localX >= this.chunkSize) return;
        if (localY < 0 || localY >= this.worldHeight) return;
        if (localZ < 0 || localZ >= this.chunkSize) return;

        chunk.setBlock(localX, localY, localZ, blockType);
        chunk.rebuild();
    }

    rayCastFromPlayer(player) {
        const raycast = player.getHeadRaycast();
        const origin = raycast.origin;
        const direction = raycast.direction;

        const maxDistance = 5;
        const step = 0.05;
        let distance = 0;
        let lastValidDistance = 0;

        while (distance < maxDistance) {
            const pos = origin.clone().addScaledVector(direction, distance);
            const blockX = Math.floor(pos.x);
            const blockY = Math.floor(pos.y);
            const blockZ = Math.floor(pos.z);

            const chunk = this.getChunk(blockX, blockZ);
            if (!chunk) {
                distance += step;
                continue;
            }

            const localX = blockX % this.chunkSize;
            const localZ = blockZ % this.chunkSize;
            const block = chunk.getBlock(localX, blockY, localZ);

            if (block && block.type !== 'air') {
                const worldPos = new THREE.Vector3(blockX, blockY, blockZ);
                const normal = this.getNormal(direction);

                return {
                    block,
                    chunk,
                    localPos: new THREE.Vector3(localX, blockY, localZ),
                    worldPos,
                    normal,
                    distance
                };
            }

            lastValidDistance = distance;
            distance += step;
        }

        return null;
    }

    getNormal(direction) {
        const absX = Math.abs(direction.x);
        const absY = Math.abs(direction.y);
        const absZ = Math.abs(direction.z);

        if (absX > absY && absX > absZ) {
            return direction.x > 0 ? new THREE.Vector3(1, 0, 0) : new THREE.Vector3(-1, 0, 0);
        } else if (absY > absX && absY > absZ) {
            return direction.y > 0 ? new THREE.Vector3(0, 1, 0) : new THREE.Vector3(0, -1, 0);
        } else {
            return direction.z > 0 ? new THREE.Vector3(0, 0, 1) : new THREE.Vector3(0, 0, -1);
        }
    }

    update(player) {
        const chunkX = Math.floor(player.position.x / this.chunkSize);
        const chunkZ = Math.floor(player.position.z / this.chunkSize);

        for (let x = chunkX - this.renderDistance; x <= chunkX + this.renderDistance; x++) {
            for (let z = chunkZ - this.renderDistance; z <= chunkZ + this.renderDistance; z++) {
                this.loadChunk(x, z);
            }
        }

        for (let [key, chunk] of this.chunks.entries()) {
            const [cx, cz] = key.split(',').map(Number);
            if (Math.abs(cx - chunkX) > this.renderDistance || Math.abs(cz - chunkZ) > this.renderDistance) {
                this.unloadChunk(cx, cz);
            }
        }
    }
}
