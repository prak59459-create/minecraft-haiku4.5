import { BLOCKS } from './blocks.js';

const CHUNK_SIZE = 16;
const CHUNK_HEIGHT = 256;
const WORLD_HEIGHT = 256;

let perlinNoise;
const heightCache = new Map();
const heightCacheSize = 512;

export function initPerlinNoise() {
    if (typeof SimplexNoise !== 'undefined') {
        perlinNoise = new SimplexNoise();
    }
}

function getCachedHeight(x, z) {
    const key = `${x},${z}`;
    if (heightCache.has(key)) {
        return heightCache.get(key);
    }

    const height = getTerrainHeight(x, z);
    if (heightCache.size > heightCacheSize) {
        const firstKey = heightCache.keys().next().value;
        heightCache.delete(firstKey);
    }
    heightCache.set(key, height);
    return height;
}

export class Chunk {
    constructor(x, z) {
        this.x = x;
        this.z = z;
        this.blocks = new Uint8Array(CHUNK_SIZE * WORLD_HEIGHT * CHUNK_SIZE);
        this.generated = false;
        this.mesh = null;
        this.meshDirty = false;
    }

    getBlock(x, y, z) {
        if (x < 0 || x >= CHUNK_SIZE || y < 0 || y >= WORLD_HEIGHT || z < 0 || z >= CHUNK_SIZE) {
            return 0;
        }
        const idx = (x * WORLD_HEIGHT + y) * CHUNK_SIZE + z;
        return this.blocks[idx];
    }

    setBlock(x, y, z, blockId) {
        if (x < 0 || x >= CHUNK_SIZE || y < 0 || y >= WORLD_HEIGHT || z < 0 || z >= CHUNK_SIZE) {
            return;
        }
        const idx = (x * WORLD_HEIGHT + y) * CHUNK_SIZE + z;
        this.blocks[idx] = blockId;
        this.meshDirty = true;
    }

    generate() {
        if (this.generated) return;

        const worldX = this.x * CHUNK_SIZE;
        const worldZ = this.z * CHUNK_SIZE;

        for (let x = 0; x < CHUNK_SIZE; x++) {
            for (let z = 0; z < CHUNK_SIZE; z++) {
                const wx = worldX + x;
                const wz = worldZ + z;

                let height = getCachedHeight(wx, wz);
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

        this.generated = true;
    }
}

function getTerrainHeight(x, z) {
    if (!perlinNoise) return 60;

    let height = 65;
    height += perlinNoise.noise2D(x * 0.005, z * 0.005) * 30;
    height += perlinNoise.noise2D(x * 0.02, z * 0.02) * 15;
    height += perlinNoise.noise2D(x * 0.05, z * 0.05) * 8;
    height += perlinNoise.noise2D(x * 0.1, z * 0.1) * 4;

    return Math.max(20, Math.min(160, Math.floor(height)));
}

function getTerrainType(x, z) {
    if (!perlinNoise) return 'grass';

    const temp = perlinNoise.noise2D(x * 0.02, z * 0.02);
    if (temp < -0.3) return 'sand';
    return 'grass';
}

function getOreBlock(x, y, z) {
    if (!perlinNoise) return BLOCKS.STONE;

    let ore = BLOCKS.STONE;
    const depth = 160 - y;

    const coalChance = perlinNoise.noise2D(x * 0.1, z * 0.1) + (y * 0.002);
    const ironChance = perlinNoise.noise2D(x * 0.08, z * 0.08) + (y * 0.001);
    const goldChance = perlinNoise.noise2D(x * 0.06, z * 0.06) - (y * 0.0015);
    const diamondChance = perlinNoise.noise2D(x * 0.04, z * 0.04) - (y * 0.002);

    if (y < 160 && coalChance > 0.5) ore = BLOCKS.COAL_ORE;
    else if (y < 120 && ironChance > 0.6) ore = BLOCKS.IRON_ORE;
    else if (y < 80 && goldChance > 0.65) ore = BLOCKS.GOLD_ORE;
    else if (y < 40 && diamondChance > 0.7) ore = BLOCKS.DIAMOND_ORE;

    return ore;
}

function generateTree(chunk, x, z, height) {
    if (!perlinNoise) return;

    const worldX = chunk.x * CHUNK_SIZE + x;
    const worldZ = chunk.z * CHUNK_SIZE + z;
    const treeChance = perlinNoise.noise2D(worldX * 0.02, worldZ * 0.02);
    if (treeChance < 0.45) return;

    const trunkHeight = 5 + Math.floor(Math.random() * 3);
    const y = height;

    for (let i = 0; i < trunkHeight && y + i < WORLD_HEIGHT; i++) {
        chunk.setBlock(x, y + i, z, BLOCKS.OAK_LOG);
    }

    const foliageStart = y + trunkHeight - 2;
    const foliageRadius = 2;

    for (let dy = 0; dy < foliageRadius + 1; dy++) {
        const radiusAtLevel = foliageRadius - Math.floor(dy * 0.7);
        if (radiusAtLevel < 1) break;

        for (let dx = -radiusAtLevel; dx <= radiusAtLevel; dx++) {
            for (let dz = -radiusAtLevel; dz <= radiusAtLevel; dz++) {
                if (dx * dx + dz * dz <= radiusAtLevel * radiusAtLevel) {
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
}

export class World {
    constructor(renderDistance = 8) {
        this.chunks = new Map();
        this.renderDistance = renderDistance;
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

        const toDelete = [];
        for (const [key] of this.chunks) {
            if (!chunksToKeep.has(key)) {
                toDelete.push(key);
            }
        }

        toDelete.forEach(key => this.chunks.delete(key));
    }
}

export const CHUNK_SIZE_EXPORT = CHUNK_SIZE;
export const WORLD_HEIGHT_EXPORT = WORLD_HEIGHT;
