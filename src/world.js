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

        const geometry = new THREE.BufferGeometry();
        const positions = [];
        const colors = [];
        const indices = [];

        let vertexCount = 0;

        for (let x = 0; x < CHUNK_SIZE; x++) {
            for (let y = 0; y < CHUNK_HEIGHT; y++) {
                for (let z = 0; z < CHUNK_SIZE; z++) {
                    const block = this.getBlock(x, y, z);

                    if (block === BLOCK_TYPES.AIR) continue;

                    const blockColor = BLOCK_COLORS[block];
                    const color = new THREE.Color(blockColor);

                    const worldX = this.x * CHUNK_SIZE + x;
                    const worldY = y;
                    const worldZ = this.z * CHUNK_SIZE + z;

                    this.addBlockFaces(
                        x, y, z, block,
                        worldX, worldY, worldZ,
                        positions, colors, indices, vertexCount, color
                    );

                    vertexCount = positions.length / 3;
                }
            }
        }

        if (positions.length > 0) {
            geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3));
            geometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array(colors), 3));
            geometry.setIndex(new THREE.BufferAttribute(new Uint32Array(indices), 1));

            const material = new THREE.MeshPhongMaterial({
                vertexColors: true,
                side: THREE.FrontSide,
                flatShading: false
            });

            const mesh = new THREE.Mesh(geometry, material);
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            this.scene.add(mesh);
            this.meshes.push(mesh);
        }
    }

    addBlockFaces(x, y, z, block, worldX, worldY, worldZ, positions, colors, indices, vertexCount, color) {
        const neighbors = {
            up: this.getBlock(x, y + 1, z),
            down: this.getBlock(x, y - 1, z),
            front: this.getBlock(x, y, z + 1),
            back: this.getBlock(x, y, z - 1),
            right: this.getBlock(x + 1, y, z),
            left: this.getBlock(x - 1, y, z),
        };

        const faces = [
            { normal: [0, 1, 0], dir: neighbors.up, verts: [[0,1,0], [1,1,0], [1,1,1], [0,1,1]] },
            { normal: [0, -1, 0], dir: neighbors.down, verts: [[0,0,1], [1,0,1], [1,0,0], [0,0,0]] },
            { normal: [0, 0, 1], dir: neighbors.front, verts: [[0,0,1], [1,0,1], [1,1,1], [0,1,1]] },
            { normal: [0, 0, -1], dir: neighbors.back, verts: [[1,0,0], [0,0,0], [0,1,0], [1,1,0]] },
            { normal: [1, 0, 0], dir: neighbors.right, verts: [[1,0,0], [1,0,1], [1,1,1], [1,1,0]] },
            { normal: [-1, 0, 0], dir: neighbors.left, verts: [[0,0,1], [0,0,0], [0,1,0], [0,1,1]] }
        ];

        for (let face of faces) {
            if (face.dir === BLOCK_TYPES.AIR || TRANSPARENT_BLOCKS.has(face.dir)) {
                const baseIdx = vertexCount + positions.length / 3;

                for (let vert of face.verts) {
                    positions.push(worldX + vert[0], worldY + vert[1], worldZ + vert[2]);
                    colors.push(color.r, color.g, color.b);
                }

                const shading = 0.7 + 0.3 * Math.random();
                indices.push(
                    baseIdx, baseIdx + 1, baseIdx + 2,
                    baseIdx, baseIdx + 2, baseIdx + 3
                );
            }
        }
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

                const noiseValue = this.noise.noise2D(worldX * 0.1, worldZ * 0.1);
                const height = Math.floor(64 + noiseValue * 16);

                for (let y = 0; y < CHUNK_HEIGHT; y++) {
                    if (y < 1) {
                        chunk.setBlock(x, y, z, BLOCK_TYPES.BEDROCK);
                    } else if (y < height - 4) {
                        chunk.setBlock(x, y, z, BLOCK_TYPES.STONE);
                    } else if (y < height) {
                        chunk.setBlock(x, y, z, BLOCK_TYPES.DIRT);
                    } else if (y === height) {
                        chunk.setBlock(x, y, z, BLOCK_TYPES.GRASS);
                    } else if (y < height + 5 && Math.random() < 0.1) {
                        chunk.setBlock(x, y, z, BLOCK_TYPES.LEAVES);
                    } else {
                        chunk.setBlock(x, y, z, BLOCK_TYPES.AIR);
                    }
                }

                if (Math.random() < 0.02 && height < 80) {
                    const waterLevel = 64;
                    for (let y = height; y <= waterLevel; y++) {
                        chunk.setBlock(x, y, z, BLOCK_TYPES.WATER);
                    }
                }
            }
        }

        chunk.buildMesh();
        chunk.isGenerated = true;
        return chunk;
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

    handleBlockOperations(player) {
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
                this.destroyBlock(bx, by, bz);
                player.isDestroyingBlock = false;
            }

            if (player.isPlacingBlock) {
                const normal = face.normal;
                const placePos = new THREE.Vector3(point.x, point.y, point.z).add(normal.multiplyScalar(0.5));
                this.placeBlock(Math.floor(placePos.x), Math.floor(placePos.y), Math.floor(placePos.z), player.selectedBlockType);
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
