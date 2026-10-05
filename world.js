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
                        } else if (terrainType === 'clay') {
                            this.setBlock(x, y, z, BLOCKS.CLAY);
                        } else if (terrainType === 'gravel') {
                            this.setBlock(x, y, z, BLOCKS.GRAVEL);
                        } else {
                            this.setBlock(x, y, z, BLOCKS.DIRT);
                        }
                    } else if (y < height) {
                        if (terrainType === 'sand') {
                            this.setBlock(x, y, z, BLOCKS.SAND);
                        } else if (terrainType === 'clay') {
                            this.setBlock(x, y, z, BLOCKS.CLAY);
                        } else if (terrainType === 'gravel') {
                            this.setBlock(x, y, z, BLOCKS.GRAVEL);
                        } else {
                            this.setBlock(x, y, z, BLOCKS.GRASS);
                        }
                    } else if (y < 62) {
                        this.setBlock(x, y, z, BLOCKS.WATER);
                    }
                }

                if (height > 65 && terrainType !== 'sand' && terrainType !== 'clay') {
                    generateTree(this, x, z, height, terrainType);
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
    const humidity = perlinNoise.noise2D(x * 0.015, z * 0.015);

    if (temp < -0.2) return 'sand';
    if (humidity > 0.4) return 'clay';
    if (temp < 0.1) return 'gravel';
    return 'grass';
}

function getOreBlock(x, y, z) {
    if (!perlinNoise) return BLOCKS.STONE;

    let ore = BLOCKS.STONE;

    const depth = 1 - (y / 256);
    const scale = 0.1 + depth * 0.2;

    const coalChance = perlinNoise.noise2D(x * 0.1, z * 0.1) + perlinNoise.noise2D(x * 0.05, z * 0.05) * 0.5;
    const ironChance = perlinNoise.noise2D(x * 0.08, z * 0.08) + perlinNoise.noise2D(x * 0.04, z * 0.04) * 0.5;
    const goldChance = perlinNoise.noise2D(x * 0.06, z * 0.06) + perlinNoise.noise2D(x * 0.03, z * 0.03) * 0.5;
    const diamondChance = perlinNoise.noise2D(x * 0.04, z * 0.04) + perlinNoise.noise2D(x * 0.02, z * 0.02) * 0.5;

    if (y < 160 && coalChance > 0.4) ore = BLOCKS.COAL_ORE;
    if (y < 120 && y > 30 && ironChance > 0.5) ore = BLOCKS.IRON_ORE;
    if (y < 80 && y > 20 && goldChance > 0.65) ore = BLOCKS.GOLD_ORE;
    if (y < 40 && y > 5 && diamondChance > 0.7) ore = BLOCKS.DIAMOND_ORE;

    return ore;
}

function generateTree(chunk, x, z, height, terrainType) {
    if (!perlinNoise) return;

    const worldX = chunk.x * CHUNK_SIZE + x;
    const worldZ = chunk.z * CHUNK_SIZE + z;
    const treeChance = perlinNoise.noise2D(worldX * 0.02, worldZ * 0.02);
    const baseChance = terrainType === 'grass' ? 0.35 : 0.3;
    if (treeChance < baseChance) return;

    const treeType = perlinNoise.noise2D(worldX * 0.03, worldZ * 0.03);
    let isOak, isBirch, isSpruce;

    if (terrainType === 'grass') {
        isOak = treeType > 0.2;
        isBirch = treeType <= 0.2 && treeType > -0.2;
        isSpruce = treeType <= -0.2;
    } else {
        isOak = false;
        isBirch = false;
        isSpruce = true;
    }

    const trunkLog = isOak ? BLOCKS.OAK_LOG : (isBirch ? BLOCKS.BIRCH_LOG : BLOCKS.SPRUCE_LOG);
    const foliageBlock = isOak ? BLOCKS.OAK_LEAVES : (isBirch ? BLOCKS.BIRCH_LEAVES : BLOCKS.SPRUCE_LEAVES);

    const trunkHeight = isOak ?
        (4 + Math.floor(Math.random() * 4)) :
        (isBirch ? (5 + Math.floor(Math.random() * 3)) : (7 + Math.floor(Math.random() * 4)));
    const y = height;

    for (let i = 0; i < trunkHeight && y + i < WORLD_HEIGHT; i++) {
        if (x >= 0 && x < CHUNK_SIZE && z >= 0 && z < CHUNK_SIZE) {
            if (chunk.getBlock(x, y + i, z) === BLOCKS.AIR) {
                chunk.setBlock(x, y + i, z, trunkLog);
            }
        }
    }

    const foliageStart = y + trunkHeight - (isOak ? 3 : (isBirch ? 3 : 5));
    const foliageRadius = isOak ?
        (2 + Math.floor(Math.random() * 2)) :
        (isBirch ? (1 + Math.floor(Math.random() * 1)) : (2 + Math.floor(Math.random() * 1)));

    for (let dy = 0; dy < foliageRadius + (isSpruce ? 3 : 2); dy++) {
        const radiusAtLevel = isSpruce ?
            Math.max(0, foliageRadius - Math.floor(dy * 0.8)) :
            Math.max(1, foliageRadius - Math.floor(dy / 1.5));

        if (radiusAtLevel <= 0) continue;

        for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 8) {
            for (let dist = 0; dist <= radiusAtLevel; dist += 0.5) {
                const dx = Math.round(Math.cos(angle) * dist);
                const dz = Math.round(Math.sin(angle) * dist);
                const fx = x + dx;
                const fz = z + dz;
                const fy = foliageStart + dy;

                if (fx >= 0 && fx < CHUNK_SIZE && fz >= 0 && fz < CHUNK_SIZE && fy >= 0 && fy < WORLD_HEIGHT) {
                    if (chunk.getBlock(fx, fy, fz) === BLOCKS.AIR) {
                        chunk.setBlock(fx, fy, fz, foliageBlock);
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
