import * as THREE from 'three';
import { SimplexNoise } from 'simplex-noise';
import { Chunk } from './chunk.js';

const CHUNK_SIZE = 16;
const CHUNK_HEIGHT = 256;
const RENDER_DISTANCE = 8;
const WATER_LEVEL = 64;

export class World {
    constructor(scene) {
        this.scene = scene;
        this.chunks = new Map();
        this.noise = new SimplexNoise();
        this.chunkMeshes = new Map();
    }

    getChunkKey(x, z) {
        return `${x},${z}`;
    }

    getTerrainHeight(x, z) {
        const scale = 0.02;
        const value = this.noise.noise2D(x * scale, z * scale);
        const height = Math.floor(64 + value * 32);
        return Math.max(1, Math.min(CHUNK_HEIGHT - 1, height));
    }

    generateChunk(chunkX, chunkZ) {
        const key = this.getChunkKey(chunkX, chunkZ);

        if (this.chunks.has(key)) {
            return this.chunks.get(key);
        }

        const chunk = new Chunk(chunkX, chunkZ, CHUNK_SIZE, CHUNK_HEIGHT);

        // Generate terrain
        for (let x = 0; x < CHUNK_SIZE; x++) {
            for (let z = 0; z < CHUNK_SIZE; z++) {
                const worldX = chunkX * CHUNK_SIZE + x;
                const worldZ = chunkZ * CHUNK_SIZE + z;
                const height = this.getTerrainHeight(worldX, worldZ);

                // Fill terrain from bedrock to surface
                for (let y = 0; y < height; y++) {
                    let blockType = 'stone';

                    if (y < 5) {
                        blockType = 'bedrock';
                    } else if (y < height - 4) {
                        blockType = 'stone';
                    } else if (y < height - 1) {
                        blockType = 'dirt';
                    } else if (y < height) {
                        blockType = 'grass';
                    }

                    if (y < WATER_LEVEL && y >= height) {
                        blockType = 'water';
                    }

                    chunk.setBlock(x, y, z, blockType);
                }

                // Add surface details
                if (height < CHUNK_HEIGHT - 1) {
                    // Trees
                    if (Math.random() < 0.05) {
                        const treeHeight = 4 + Math.floor(Math.random() * 3);
                        for (let ty = 0; ty < treeHeight; ty++) {
                            if (height + ty < CHUNK_HEIGHT) {
                                chunk.setBlock(x, height + ty, z, 'wood');
                            }
                        }
                        // Leaves
                        for (let ty = 1; ty < treeHeight; ty++) {
                            for (let tx = -2; tx <= 2; tx++) {
                                for (let tz = -2; tz <= 2; tz++) {
                                    if (Math.abs(tx) + Math.abs(tz) <= 3) {
                                        const lx = x + tx;
                                        const lz = z + tz;
                                        const ly = height + ty + 1;
                                        if (lx >= 0 && lx < CHUNK_SIZE && lz >= 0 && lz < CHUNK_SIZE && ly < CHUNK_HEIGHT) {
                                            if (chunk.getBlock(lx, ly, lz) === null) {
                                                chunk.setBlock(lx, ly, lz, 'leaves');
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        this.chunks.set(key, chunk);
        return chunk;
    }

    updateChunks(playerPosition) {
        const playerChunkX = Math.floor(playerPosition.x / CHUNK_SIZE);
        const playerChunkZ = Math.floor(playerPosition.z / CHUNK_SIZE);

        // Load nearby chunks
        for (let x = playerChunkX - RENDER_DISTANCE; x <= playerChunkX + RENDER_DISTANCE; x++) {
            for (let z = playerChunkZ - RENDER_DISTANCE; z <= playerChunkZ + RENDER_DISTANCE; z++) {
                const key = this.getChunkKey(x, z);
                const chunk = this.generateChunk(x, z);

                if (!this.chunkMeshes.has(key)) {
                    const mesh = chunk.buildMesh();
                    mesh.position.set(x * CHUNK_SIZE, 0, z * CHUNK_SIZE);
                    mesh.castShadow = true;
                    mesh.receiveShadow = true;
                    this.scene.add(mesh);
                    this.chunkMeshes.set(key, mesh);
                }
            }
        }

        // Unload far chunks
        const keysToRemove = [];
        for (const key of this.chunkMeshes.keys()) {
            const [x, z] = key.split(',').map(Number);
            const distance = Math.max(Math.abs(x - playerChunkX), Math.abs(z - playerChunkZ));
            if (distance > RENDER_DISTANCE + 2) {
                const mesh = this.chunkMeshes.get(key);
                this.scene.remove(mesh);
                mesh.geometry.dispose();
                mesh.material.dispose();
                keysToRemove.push(key);
            }
        }
        keysToRemove.forEach(key => this.chunkMeshes.delete(key));
    }

    getVisibleBlocks() {
        return Array.from(this.chunkMeshes.values());
    }

    destroyBlock(point, direction) {
        const blockPos = new THREE.Vector3(
            Math.floor(point.x),
            Math.floor(point.y),
            Math.floor(point.z)
        );

        // Adjust for block face
        blockPos.add(direction.clone().multiplyScalar(-0.5));

        const chunkX = Math.floor(blockPos.x / CHUNK_SIZE);
        const chunkZ = Math.floor(blockPos.z / CHUNK_SIZE);
        const key = this.getChunkKey(chunkX, chunkZ);

        const chunk = this.chunks.get(key);
        if (chunk) {
            const localX = Math.floor(blockPos.x) % CHUNK_SIZE;
            const localZ = Math.floor(blockPos.z) % CHUNK_SIZE;
            chunk.setBlock(localX, Math.floor(blockPos.y), localZ, null);
            this.rebuildChunkMesh(key);
        }
    }

    placeBlock(point, direction, blockType) {
        const blockPos = new THREE.Vector3(
            Math.floor(point.x),
            Math.floor(point.y),
            Math.floor(point.z)
        );

        // Place on the face the player is looking at
        blockPos.add(direction.clone().multiplyScalar(-0.5));

        const chunkX = Math.floor(blockPos.x / CHUNK_SIZE);
        const chunkZ = Math.floor(blockPos.z / CHUNK_SIZE);
        const key = this.getChunkKey(chunkX, chunkZ);

        const chunk = this.chunks.get(key);
        if (chunk) {
            const localX = Math.floor(blockPos.x) % CHUNK_SIZE;
            const localZ = Math.floor(blockPos.z) % CHUNK_SIZE;
            chunk.setBlock(localX, Math.floor(blockPos.y), localZ, blockType);
            this.rebuildChunkMesh(key);
        }
    }

    rebuildChunkMesh(key) {
        const chunk = this.chunks.get(key);
        const oldMesh = this.chunkMeshes.get(key);

        if (oldMesh) {
            this.scene.remove(oldMesh);
            oldMesh.geometry.dispose();
            oldMesh.material.dispose();
        }

        const mesh = chunk.buildMesh();
        const [x, z] = key.split(',').map(Number);
        mesh.position.set(x * CHUNK_SIZE, 0, z * CHUNK_SIZE);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        this.scene.add(mesh);
        this.chunkMeshes.set(key, mesh);
    }
}
