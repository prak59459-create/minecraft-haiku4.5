import { BLOCKS } from './blocks.js';

const CHUNK_SIZE = 16;
const CHUNK_HEIGHT = 256;
const WORLD_HEIGHT = 256;

let perlinNoise;

export function initPerlinNoise() {
    if (typeof SimplexNoise !== 'undefined') {
        perlinNoise = new SimplexNoise();
    }
}

export class Chunk {
    constructor(x, z) {
        this.x = x;
        this.z = z;
        this.blocks = new Uint8Array(CHUNK_SIZE * WORLD_HEIGHT * CHUNK_SIZE);
        this.generated = false;
        this.mesh = null;
    }

    getBlock(x, y, z) {
        const idx = x + y * CHUNK_SIZE + z * CHUNK_SIZE * WORLD_HEIGHT;
        return this.blocks[idx] || 0;
    }

    setBlock(x, y, z, blockId) {
        const idx = x + y * CHUNK_SIZE + z * CHUNK_SIZE * WORLD_HEIGHT;
        this.blocks[idx] = blockId;
    }

    generate() {
        if (this.generated) return;

        const worldX = this.x * CHUNK_SIZE;
        const worldZ = this.z * CHUNK_SIZE;

        for (let x = 0; x < CHUNK_SIZE; x++) {
            for (let z = 0; z < CHUNK_SIZE; z++) {
                const wx = worldX + x;
                const wz = worldZ + z;

                let height = getTerrainHeight(wx, wz);
                let terrainType = getTerrainType(wx, wz);

                for (let y = 0; y < WORLD_HEIGHT; y++) {
                    if (y === 0) {
                        this.setBlock(x, y, z, BLOCKS.BEDROCK);
                    } else if (y < height - 4) {
                        const block = getOreBlock(wx, y, wz);
                        this.setBlock(x, y, z, block);
                    } else if (y < height - 1) {
                        if (terrainType === 'sand') {
                            this.setBlock(x, y, z, BLOCKS.SAND);
                        } else {
                            this.setBlock(x, y, z, BLOCKS.DIRT);
                        }
                    } else if (y < height) {
                        if (terrainType === 'sand') {
                            this.setBlock(x, y, z, BLOCKS.SAND);
                        } else if (terrainType === 'grass') {
                            this.setBlock(x, y, z, BLOCKS.GRASS);
                        } else {
                            this.setBlock(x, y, z, BLOCKS.GRASS);
                        }
                    } else if (y < 62) {
                        this.setBlock(x, y, z, BLOCKS.WATER);
                    }
                }

                if (height > 65) {
                    generateTree(this, x, z, height);
                }
            }
        }

        generateCaves(this);
        this.generated = true;
    }
}

function getTerrainHeight(x, z) {
    if (!perlinNoise) return 60;

    let height = 65;
    height += perlinNoise.noise2D(x * 0.003, z * 0.003) * 40;
    height += perlinNoise.noise2D(x * 0.01, z * 0.01) * 20;
    height += perlinNoise.noise2D(x * 0.05, z * 0.05) * 10;
    height += perlinNoise.noise2D(x * 0.1, z * 0.1) * 5;
    height += perlinNoise.noise2D(x * 0.2, z * 0.2) * 2;

    return Math.max(15, Math.min(180, Math.floor(height)));
}

function getTerrainType(x, z) {
    if (!perlinNoise) return 'grass';

    const temp = perlinNoise.noise2D(x * 0.02, z * 0.02);
    const humidity = perlinNoise.noise2D(x * 0.015, z * 0.015);

    if (temp < -0.2) return 'sand';
    if (humidity > 0.5) return 'grass';
    return 'grass';
}

function getOreBlock(x, y, z) {
    if (!perlinNoise) return BLOCKS.STONE;

    let ore = BLOCKS.STONE;

    const depthFactor = 1 - (y / 160);
    const coalChance = perlinNoise.noise2D(x * 0.1 + y * 0.05, z * 0.1 + y * 0.05);
    const ironChance = perlinNoise.noise2D(x * 0.08 + y * 0.03, z * 0.08 + y * 0.03);
    const goldChance = perlinNoise.noise2D(x * 0.06 + y * 0.02, z * 0.06 + y * 0.02);
    const diamondChance = perlinNoise.noise2D(x * 0.04 + y * 0.01, z * 0.04 + y * 0.01);

    if (y > 50 && y < 160 && coalChance > 0.48) ore = BLOCKS.COAL_ORE;
    if (y > 40 && y < 130 && ironChance > 0.58 - depthFactor * 0.15) ore = BLOCKS.IRON_ORE;
    if (y > 20 && y < 100 && goldChance > 0.65 - depthFactor * 0.2) ore = BLOCKS.GOLD_ORE;
    if (y > 5 && y < 50 && diamondChance > 0.7 - depthFactor * 0.3) ore = BLOCKS.DIAMOND_ORE;

    return ore;
}

function generateTree(chunk, x, z, height) {
    if (!perlinNoise) return;

    const worldX = chunk.x * CHUNK_SIZE + x;
    const worldZ = chunk.z * CHUNK_SIZE + z;
    const treeChance = perlinNoise.noise2D(worldX * 0.02, worldZ * 0.02);
    if (treeChance < 0.55) return;

    const trunkHeight = 5 + Math.floor(Math.random() * 5);
    const y = height;

    for (let i = 0; i < trunkHeight && y + i < WORLD_HEIGHT; i++) {
        if (x >= 0 && x < CHUNK_SIZE && z >= 0 && z < CHUNK_SIZE) {
            if (chunk.getBlock(x, y + i, z) === BLOCKS.AIR) {
                chunk.setBlock(x, y + i, z, BLOCKS.OAK_LOG);
            }
        }
    }

    const foliageStart = y + trunkHeight - 4;
    const foliageRadius = 3 + Math.floor(Math.random() * 2);

    for (let dy = 0; dy < foliageRadius + 3; dy++) {
        const radiusAtLevel = Math.max(1, foliageRadius - Math.floor(dy / 2));
        for (let angle = 0; angle < Math.PI * 2; angle += 0.3) {
            for (let dist = 0; dist <= radiusAtLevel; dist += 0.5) {
                const dx = Math.round(Math.cos(angle) * dist);
                const dz = Math.round(Math.sin(angle) * dist);
                const fx = x + dx;
                const fz = z + dz;
                const fy = foliageStart + dy;

                if (fx >= 0 && fx < CHUNK_SIZE && fz >= 0 && fz < CHUNK_SIZE && fy >= 0 && fy < WORLD_HEIGHT) {
                    if (chunk.getBlock(fx, fy, fz) === BLOCKS.AIR) {
                        chunk.setBlock(fx, fy, fz, BLOCKS.OAK_LEAVES);
                    }
                }
            }
        }
    }
}

function generateCaves(chunk) {
    if (!perlinNoise) return;

    const CAVE_THRESHOLD = 0.45;
    const CAVE_SCALE = 0.05;

    for (let x = 0; x < CHUNK_SIZE; x++) {
        for (let z = 0; z < CHUNK_SIZE; z++) {
            for (let y = 10; y < 120; y++) {
                const worldX = chunk.x * CHUNK_SIZE + x;
                const worldZ = chunk.z * CHUNK_SIZE + z;

                const caveNoise = Math.abs(perlinNoise.noise3D(
                    worldX * CAVE_SCALE,
                    y * 0.05,
                    worldZ * CAVE_SCALE
                ));

                if (caveNoise < CAVE_THRESHOLD) {
                    const block = chunk.getBlock(x, y, z);
                    if (block !== BLOCKS.AIR && block !== BLOCKS.BEDROCK) {
                        chunk.setBlock(x, y, z, BLOCKS.AIR);
                    }
                }
            }
        }
    }
}

export class World {
    constructor(renderDistance = 8) {
        this.chunks = new Map();
        this.renderDistance = renderDistance;
        this.chunkQueue = [];
        this.chunksPerFrame = 2;
        this.isGenerating = false;
        initPerlinNoise();
    }

    getChunk(cx, cz) {
        const key = `${cx},${cz}`;
        if (!this.chunks.has(key)) {
            const chunk = new Chunk(cx, cz);
            chunk.generate();
            this.chunks.set(key, chunk);
        }
        return this.chunks.get(key);
    }

    queueChunkGeneration(cx, cz) {
        const key = `${cx},${cz}`;
        if (!this.chunks.has(key) && !this.chunkQueue.find(c => `${c.x},${c.z}` === key)) {
            this.chunkQueue.push({ x: cx, z: cz });
        }
    }

    processChunkQueue() {
        for (let i = 0; i < Math.min(this.chunksPerFrame, this.chunkQueue.length); i++) {
            const { x, z } = this.chunkQueue.shift();
            this.getChunk(x, z);
        }
    }

    getBlock(x, y, z) {
        if (y < 0 || y >= WORLD_HEIGHT) return BLOCKS.AIR;

        const cx = Math.floor(x / CHUNK_SIZE);
        const cz = Math.floor(z / CHUNK_SIZE);
        const lx = ((x % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
        const lz = ((z % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;

        const chunk = this.getChunk(cx, cz);
        return chunk.getBlock(lx, y, lz);
    }

    setBlock(x, y, z, blockId) {
        if (y < 0 || y >= WORLD_HEIGHT) return;

        const cx = Math.floor(x / CHUNK_SIZE);
        const cz = Math.floor(z / CHUNK_SIZE);
        const lx = ((x % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
        const lz = ((z % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;

        const chunk = this.getChunk(cx, cz);
        chunk.setBlock(lx, y, lz, blockId);
    }

    updateChunksAround(playerX, playerZ) {
        const playerChunkX = Math.floor(playerX / CHUNK_SIZE);
        const playerChunkZ = Math.floor(playerZ / CHUNK_SIZE);

        const chunksToKeep = new Set();
        for (let dx = -this.renderDistance; dx <= this.renderDistance; dx++) {
            for (let dz = -this.renderDistance; dz <= this.renderDistance; dz++) {
                const cx = playerChunkX + dx;
                const cz = playerChunkZ + dz;
                const key = `${cx},${cz}`;
                chunksToKeep.add(key);

                if (!this.chunks.has(key)) {
                    this.queueChunkGeneration(cx, cz);
                }
            }
        }

        const toDelete = [];
        for (const [key] of this.chunks) {
            if (!chunksToKeep.has(key)) {
                toDelete.push(key);
            }
        }

        toDelete.forEach(key => this.chunks.delete(key));
        this.processChunkQueue();
    }
}

export const CHUNK_SIZE_EXPORT = CHUNK_SIZE;
export const WORLD_HEIGHT_EXPORT = WORLD_HEIGHT;
