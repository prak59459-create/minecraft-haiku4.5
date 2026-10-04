import * as THREE from 'three';
import { SimplexNoise } from 'simplex-noise';
import { BLOCK_TYPES, BLOCK_COLORS, TRANSPARENT_BLOCKS } from './blocks.js';

const CHUNK_SIZE = 16;
const CHUNK_HEIGHT = 128;
const RENDER_DISTANCE = 8;

export class Chunk {
    constructor(x, z, scene) {
        this.x = x;
        this.z = z;
        this.blocks = new Uint8Array(CHUNK_SIZE * CHUNK_HEIGHT * CHUNK_SIZE);
        this.scene = scene;
        this.meshes = [];
        this.isGenerated = false;
    }

    setBlock(x, y, z, type) {
        if (x < 0 || x >= CHUNK_SIZE || y < 0 || y >= CHUNK_HEIGHT || z < 0 || z >= CHUNK_SIZE) {
            return;
        }
        this.blocks[x + y * CHUNK_SIZE + z * CHUNK_SIZE * CHUNK_HEIGHT] = type;
    }

    getBlock(x, y, z) {
        if (x < 0 || x >= CHUNK_SIZE || y < 0 || y >= CHUNK_HEIGHT || z < 0 || z >= CHUNK_SIZE) {
            return BLOCK_TYPES.AIR;
        }
        return this.blocks[x + y * CHUNK_SIZE + z * CHUNK_SIZE * CHUNK_HEIGHT];
    }

    buildMesh() {
        this.clearMesh();

        const blockGeometry = new THREE.BoxGeometry(1, 1, 1);
        const blocksByType = new Map();

        for (let x = 0; x < CHUNK_SIZE; x++) {
            for (let y = 0; y < CHUNK_HEIGHT; y++) {
                for (let z = 0; z < CHUNK_SIZE; z++) {
                    const block = this.getBlock(x, y, z);

                    if (block === BLOCK_TYPES.AIR) continue;

                    const worldX = this.x * CHUNK_SIZE + x;
                    const worldY = y;
                    const worldZ = this.z * CHUNK_SIZE + z;

                    if (!this.shouldRenderFace(x, y, z, block)) continue;

                    if (!blocksByType.has(block)) {
                        blocksByType.set(block, []);
                    }
                    blocksByType.get(block).push({ x: worldX, y: worldY, z: worldZ });
                }
            }
        }

        for (let [blockType, positions] of blocksByType) {
            if (positions.length === 0) continue;

            const color = new THREE.Color(BLOCK_COLORS[blockType]);
            const material = new THREE.MeshPhongMaterial({
                color: color,
                side: THREE.FrontSide,
                flatShading: false
            });

            const group = new THREE.Group();

            for (let pos of positions) {
                const mesh = new THREE.Mesh(blockGeometry, material);
                mesh.position.set(pos.x + 0.5, pos.y + 0.5, pos.z + 0.5);
                mesh.castShadow = true;
                mesh.receiveShadow = true;
                group.add(mesh);
            }

            this.scene.add(group);
            this.meshes.push(group);
        }
    }

    shouldRenderFace(x, y, z, block) {
        const neighbors = [
            this.getBlock(x, y + 1, z),
            this.getBlock(x, y - 1, z),
            this.getBlock(x, y, z + 1),
            this.getBlock(x, y, z - 1),
            this.getBlock(x + 1, y, z),
            this.getBlock(x - 1, y, z),
        ];

        for (let neighbor of neighbors) {
            if (neighbor === BLOCK_TYPES.AIR || TRANSPARENT_BLOCKS.has(neighbor)) {
                return true;
            }
        }
        return false;
    }


    clearMesh() {
        for (let mesh of this.meshes) {
            this.scene.remove(mesh);
            mesh.geometry.dispose();
            mesh.material.dispose();
        }
        this.meshes = [];
    }
}

export class World {
    constructor(scene) {
        this.scene = scene;
        this.chunks = new Map();
        this.noise = new SimplexNoise();
        this.blockOperations = [];
    }

    generateChunk(chunkX, chunkZ) {
        const chunk = new Chunk(chunkX, chunkZ, this.scene);

        for (let x = 0; x < CHUNK_SIZE; x++) {
            for (let z = 0; z < CHUNK_SIZE; z++) {
                const worldX = chunkX * CHUNK_SIZE + x;
                const worldZ = chunkZ * CHUNK_SIZE + z;

                const noiseValue = this.noise.noise2D(worldX * 0.08, worldZ * 0.08);
                const detailNoise = this.noise.noise2D(worldX * 0.2, worldZ * 0.2);
                const height = Math.floor(64 + noiseValue * 20 + detailNoise * 5);

                for (let y = 0; y < CHUNK_HEIGHT; y++) {
                    if (y < 1) {
                        chunk.setBlock(x, y, z, BLOCK_TYPES.BEDROCK);
                    } else if (y < height - 6) {
                        const blockType = this.generateOres(worldX, y, worldZ);
                        chunk.setBlock(x, y, z, blockType);
                    } else if (y < height - 1) {
                        chunk.setBlock(x, y, z, BLOCK_TYPES.DIRT);
                    } else if (y === height) {
                        if (height > 75) {
                            chunk.setBlock(x, y, z, BLOCK_TYPES.SAND);
                        } else {
                            chunk.setBlock(x, y, z, BLOCK_TYPES.GRASS);
                        }
                    } else {
                        chunk.setBlock(x, y, z, BLOCK_TYPES.AIR);
                    }
                }

                if (Math.random() < 0.03 && height < 85 && height > 62) {
                    this.generateTree(chunk, x, height + 1, z);
                }

                const waterLevel = 62;
                if (height < waterLevel) {
                    for (let y = height + 1; y <= waterLevel; y++) {
                        chunk.setBlock(x, y, z, BLOCK_TYPES.WATER);
                    }
                }
            }
        }

        chunk.buildMesh();
        chunk.isGenerated = true;
        return chunk;
    }

    generateOres(x, y, z) {
        const seed = x * 73856093 ^ y * 19349663 ^ z * 83492791;
        const random = Math.sin(seed) * 10000 - Math.floor(Math.sin(seed) * 10000);

        if (y < 20 && random < 0.08) {
            return BLOCK_TYPES.COAL_ORE;
        } else if (y < 30 && random < 0.05) {
            return BLOCK_TYPES.IRON_ORE;
        } else if (random < 0.02) {
            return BLOCK_TYPES.GRAVEL;
        }
        return BLOCK_TYPES.STONE;
    }

    generateTree(chunk, x, baseY, z) {
        const height = 4 + Math.floor(Math.random() * 3);

        for (let y = baseY; y < baseY + height; y++) {
            if (y < CHUNK_HEIGHT) {
                chunk.setBlock(x, y, z, BLOCK_TYPES.OAK_LOG);
            }
        }

        for (let dy = -2; dy <= 2; dy++) {
            for (let dz = -2; dz <= 2; dz++) {
                const distance = Math.sqrt(dy * dy + dz * dz);
                if (distance < 2.5) {
                    const nx = x + dy;
                    const nz = z + dz;
                    if (nx >= 0 && nx < CHUNK_SIZE && nz >= 0 && nz < CHUNK_SIZE) {
                        const foliageY = baseY + height - 2;
                        if (foliageY < CHUNK_HEIGHT) {
                            chunk.setBlock(nx, foliageY, nz, BLOCK_TYPES.LEAVES);
                        }
                    }
                }
            }
        }
    }

    getChunk(x, z) {
        const key = `${x},${z}`;
        if (!this.chunks.has(key)) {
            this.chunks.set(key, this.generateChunk(x, z));
        }
        return this.chunks.get(key);
    }

    getBlock(x, y, z) {
        const chunkX = Math.floor(x / CHUNK_SIZE);
        const chunkZ = Math.floor(z / CHUNK_SIZE);
        const chunk = this.getChunk(chunkX, chunkZ);

        const localX = x - chunkX * CHUNK_SIZE;
        const localZ = z - chunkZ * CHUNK_SIZE;

        return chunk.getBlock(localX, y, localZ);
    }

    destroyBlock(x, y, z) {
        this.blockOperations.push({ x, y, z, type: BLOCK_TYPES.AIR });
    }

    placeBlock(x, y, z, blockType) {
        if (blockType !== BLOCK_TYPES.AIR && blockType !== BLOCK_TYPES.WATER) {
            this.blockOperations.push({ x, y, z, type: blockType });
        }
    }

    handleBlockOperations(player, particles, soundManager) {
        const raycaster = new THREE.Raycaster();
        raycaster.ray.origin.copy(player.position);
        raycaster.ray.origin.y += player.eyeHeight;
        raycaster.ray.direction.setFromEuler(new THREE.Euler(player.pitch, player.yaw, 0, 'YXZ'));

        const intersects = raycaster.intersectObjects(this.chunks, true);

        if (intersects.length > 0) {
            const point = intersects[0].point;
            const face = intersects[0].face;

            if (player.isDestroyingBlock) {
                const bx = Math.floor(point.x);
                const by = Math.floor(point.y);
                const bz = Math.floor(point.z);
                const blockType = this.getBlock(bx, by, bz);
                if (blockType !== BLOCK_TYPES.AIR && blockType !== BLOCK_TYPES.WATER) {
                    this.destroyBlock(bx, by, bz);
                    if (soundManager) soundManager.playBlockBreak();
                    if (particles) particles.createBlockBreakParticles(bx, by, bz, BLOCK_COLORS[blockType]);
                }
                player.isDestroyingBlock = false;
            }

            if (player.isPlacingBlock) {
                const normal = face.normal;
                const placePos = new THREE.Vector3(point.x, point.y, point.z).add(normal.multiplyScalar(0.5));
                this.placeBlock(Math.floor(placePos.x), Math.floor(placePos.y), Math.floor(placePos.z), player.selectedBlockType);
                if (soundManager) soundManager.playBlockPlace();
                player.isPlacingBlock = false;
            }
        }

        while (this.blockOperations.length > 0) {
            const op = this.blockOperations.shift();
            const chunkX = Math.floor(op.x / CHUNK_SIZE);
            const chunkZ = Math.floor(op.z / CHUNK_SIZE);
            const chunk = this.getChunk(chunkX, chunkZ);

            const localX = op.x - chunkX * CHUNK_SIZE;
            const localZ = op.z - chunkZ * CHUNK_SIZE;

            chunk.setBlock(localX, op.y, localZ, op.type);
            chunk.buildMesh();

            const neighborChunks = [
                this.getChunk(chunkX - 1, chunkZ),
                this.getChunk(chunkX + 1, chunkZ),
                this.getChunk(chunkX, chunkZ - 1),
                this.getChunk(chunkX, chunkZ + 1),
            ];

            for (let neighborChunk of neighborChunks) {
                neighborChunk.buildMesh();
            }
        }
    }

    updateChunks(playerPos) {
        const playerChunkX = Math.floor(playerPos.x / CHUNK_SIZE);
        const playerChunkZ = Math.floor(playerPos.z / CHUNK_SIZE);

        for (let dx = -RENDER_DISTANCE; dx <= RENDER_DISTANCE; dx++) {
            for (let dz = -RENDER_DISTANCE; dz <= RENDER_DISTANCE; dz++) {
                this.getChunk(playerChunkX + dx, playerChunkZ + dz);
            }
        }

        const keysToDelete = [];
        for (let key of this.chunks.keys()) {
            const [x, z] = key.split(',').map(Number);
            const dx = Math.abs(x - playerChunkX);
            const dz = Math.abs(z - playerChunkZ);

            if (dx > RENDER_DISTANCE || dz > RENDER_DISTANCE) {
                const chunk = this.chunks.get(key);
                chunk.clearMesh();
                keysToDelete.push(key);
            }
        }

        for (let key of keysToDelete) {
            this.chunks.delete(key);
        }
    }
}
