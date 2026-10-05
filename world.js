import { BLOCKS } from './blocks.js';

const CHUNK_SIZE = 16;
const CHUNK_HEIGHT = 256;
const WORLD_HEIGHT = 256;

let perlinNoise;
const NOISE_CACHE = new Map();

export function initPerlinNoise() {
    if (typeof SimplexNoise !== 'undefined') {
        perlinNoise = new SimplexNoise();
    }
}

function getCachedNoise2D(x, z, scale) {
    const key = `${Math.floor(x)},${Math.floor(z)},${scale}`;
    if (!NOISE_CACHE.has(key)) {
        if (NOISE_CACHE.size > 10000) {
            const firstKey = NOISE_CACHE.keys().next().value;
            NOISE_CACHE.delete(firstKey);
        }
        NOISE_CACHE.set(key, perlinNoise.noise2D(x * scale, z * scale));
    }
    return NOISE_CACHE.get(key);
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
                        const caveNoise = getCachedNoise2D(wx * 0.05 + y * 0.02, wz * 0.05 + y * 0.02, 1);
                        if (caveNoise > 0.6 && y > 20 && y < 100) {
                            this.setBlock(x, y, z, BLOCKS.AIR);
                        } else {
                            const block = getOreBlock(wx, y, wz);
                            this.setBlock(x, y, z, block);
                        }
                    } else if (y < height - 1) {
                        if (terrainType === 'sand') {
                            this.setBlock(x, y, z, BLOCKS.SAND);
                        } else if (terrainType === 'forest') {
                            this.setBlock(x, y, z, BLOCKS.PODZOL);
                        } else {
                            this.setBlock(x, y, z, BLOCKS.DIRT);
                        }
                    } else if (y < height) {
                        if (terrainType === 'sand') {
                            this.setBlock(x, y, z, BLOCKS.SAND);
                        } else {
                            this.setBlock(x, y, z, BLOCKS.GRASS);
                        }
                    } else if (y < 62) {
                        this.setBlock(x, y, z, BLOCKS.WATER);
                    }
                }

                if (height > 65 && (terrainType === 'grass' || terrainType === 'forest')) {
                    generateTree(this, x, z, height);
                }
            }
        }

        this.generated = true;
    }
}

function getTerrainHeight(x, z) {
    if (!perlinNoise) return 60;

    let height = 65;
    height += getCachedNoise2D(x, z, 0.005) * 30;
    height += getCachedNoise2D(x, z, 0.02) * 15;
    height += getCachedNoise2D(x, z, 0.05) * 8;
    height += getCachedNoise2D(x, z, 0.1) * 4;

    return Math.max(20, Math.min(160, Math.floor(height)));
}

function getTerrainType(x, z) {
    if (!perlinNoise) return 'grass';

    const temp = getCachedNoise2D(x, z, 0.02);
    const humidity = getCachedNoise2D(x, z, 0.015);

    if (temp < -0.3) return 'sand';
    if (humidity > 0.4) return 'forest';
    return 'grass';
}

function getOreBlock(x, y, z) {
    if (!perlinNoise) return BLOCKS.STONE;

    let ore = BLOCKS.STONE;
    const coalChance = getCachedNoise2D(x + y * 0.5, z + y * 0.5, 0.1);
    const ironChance = getCachedNoise2D(x + y * 0.3, z + y * 0.3, 0.08);
    const goldChance = getCachedNoise2D(x + y * 0.2, z + y * 0.2, 0.06);
    const diamondChance = getCachedNoise2D(x + y * 0.1, z + y * 0.1, 0.04);
    const emeraldChance = getCachedNoise2D(x + y * 0.15, z + y * 0.15, 0.07);

    if (y < 160 && coalChance > 0.5) ore = BLOCKS.COAL_ORE;
    if (y < 120 && ironChance > 0.6) ore = BLOCKS.IRON_ORE;
    if (y < 80 && goldChance > 0.7) ore = BLOCKS.GOLD_ORE;
    if (y < 60 && emeraldChance > 0.72) ore = BLOCKS.EMERALD_ORE;
    if (y < 30 && diamondChance > 0.75) ore = BLOCKS.DIAMOND_ORE;

    return ore;
}

function generateTree(chunk, x, z, height) {
    if (!perlinNoise) return;

    const worldX = chunk.x * CHUNK_SIZE + x;
    const worldZ = chunk.z * CHUNK_SIZE + z;
    const treeChance = getCachedNoise2D(worldX, worldZ, 0.02);
    if (treeChance < 0.4) return;

    const treeType = getCachedNoise2D(worldX, worldZ, 0.05) > 0.5 ? 'tall' : 'normal';
    const trunkHeight = treeType === 'tall'
        ? 6 + Math.floor(Math.random() * 4)
        : 4 + Math.floor(Math.random() * 3);
    const y = height;

    for (let i = 0; i < trunkHeight && y + i < WORLD_HEIGHT; i++) {
        if (x >= 0 && x < CHUNK_SIZE && z >= 0 && z < CHUNK_SIZE) {
            if (chunk.getBlock(x, y + i, z) === BLOCKS.AIR) {
                chunk.setBlock(x, y + i, z, BLOCKS.OAK_LOG);
            }
        }
    }

    const foliageStart = y + Math.max(2, trunkHeight - 3);
    const foliageRadius = treeType === 'tall' ? 3 : 2 + Math.floor(Math.random() * 2);

    for (let dy = 0; dy < foliageRadius + 2; dy++) {
        const radiusAtLevel = Math.max(1, foliageRadius - Math.floor(dy / 2));
        for (let angle = 0; angle < Math.PI * 2; angle += 0.5) {
            for (let dist = 0.5; dist <= radiusAtLevel; dist += 1.0) {
                const dx = Math.round(Math.cos(angle) * dist);
                const dz = Math.round(Math.sin(angle) * dist);
                const fx = x + dx;
                const fz = z + dz;
                const fy = foliageStart + dy;

                if (fx >= 0 && fx < CHUNK_SIZE && fz >= 0 && fz < CHUNK_SIZE && fy >= 0 && fy < WORLD_HEIGHT) {
                    const currentBlock = chunk.getBlock(fx, fy, fz);
                    if (currentBlock === BLOCKS.AIR || currentBlock === BLOCKS.OAK_LEAVES) {
                        chunk.setBlock(fx, fy, fz, BLOCKS.OAK_LEAVES);
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
        this.chunkPool = [];
        this.maxPoolSize = 32;
        initPerlinNoise();
    }

    getChunk(cx, cz) {
        const key = `${cx},${cz}`;
        if (!this.chunks.has(key)) {
            let chunk;
            if (this.chunkPool.length > 0) {
                chunk = this.chunkPool.pop();
                chunk.x = cx;
                chunk.z = cz;
                chunk.generated = false;
            } else {
                chunk = new Chunk(cx, cz);
            }
            chunk.generate();
            this.chunks.set(key, chunk);
        }
        return this.chunks.get(key);
    }

    releaseChunk(cx, cz) {
        const key = `${cx},${cz}`;
        if (this.chunks.has(key)) {
            const chunk = this.chunks.get(key);
            this.chunks.delete(key);
            if (this.chunkPool.length < this.maxPoolSize) {
                this.chunkPool.push(chunk);
            }
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
                const key = `${playerChunkX + dx},${playerChunkZ + dz}`;
                chunksToKeep.add(key);
                this.getChunk(playerChunkX + dx, playerChunkZ + dz);
            }
        }

        for (const [key] of this.chunks) {
            if (!chunksToKeep.has(key)) {
                const [cx, cz] = key.split(',').map(Number);
                this.releaseChunk(cx, cz);
            }
        }
    }
}

export const CHUNK_SIZE_EXPORT = CHUNK_SIZE;
export const WORLD_HEIGHT_EXPORT = WORLD_HEIGHT;
