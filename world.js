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
        this.heightCache = null;
    }

    getBlock(x, y, z) {
        if (x < 0 || x >= CHUNK_SIZE || z < 0 || z >= CHUNK_SIZE || y < 0 || y >= WORLD_HEIGHT) return 0;
        const idx = x + y * CHUNK_SIZE + z * CHUNK_SIZE * WORLD_HEIGHT;
        return this.blocks[idx];
    }

    setBlock(x, y, z, blockId) {
        if (x < 0 || x >= CHUNK_SIZE || z < 0 || z >= CHUNK_SIZE || y < 0 || y >= WORLD_HEIGHT) return;
        const idx = x + y * CHUNK_SIZE + z * CHUNK_SIZE * WORLD_HEIGHT;
        this.blocks[idx] = blockId;
    }

    generate() {
        if (this.generated) return;

        const worldX = this.x * CHUNK_SIZE;
        const worldZ = this.z * CHUNK_SIZE;
        const WATER_LEVEL = 62;

        for (let x = 0; x < CHUNK_SIZE; x++) {
            for (let z = 0; z < CHUNK_SIZE; z++) {
                const wx = worldX + x;
                const wz = worldZ + z;

                const height = getTerrainHeight(wx, wz);
                const terrainType = getTerrainType(wx, wz);

                for (let y = 0; y < WORLD_HEIGHT; y++) {
                    let blockId = BLOCKS.AIR;

                    if (y === 0) {
                        blockId = BLOCKS.BEDROCK;
                    } else if (y < height - 4) {
                        blockId = getOreBlock(wx, y, wz);
                    } else if (y < height - 1) {
                        blockId = terrainType === 'sand' ? BLOCKS.SAND : BLOCKS.DIRT;
                    } else if (y < height) {
                        blockId = terrainType === 'sand' ? BLOCKS.SAND : BLOCKS.GRASS;
                    } else if (y < WATER_LEVEL) {
                        blockId = BLOCKS.WATER;
                    }

                    this.blocks[x + y * CHUNK_SIZE + z * CHUNK_SIZE * WORLD_HEIGHT] = blockId;
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
    const moisture = perlinNoise.noise2D(x * 0.015, z * 0.015);

    if (temp < -0.2) return 'sand';
    if (temp < -0.5 && moisture > 0.3) return 'gravel';
    return 'grass';
}

function getBiomeType(x, z) {
    if (!perlinNoise) return 'plains';

    const temp = perlinNoise.noise2D(x * 0.01, z * 0.01);
    const moisture = perlinNoise.noise2D(x * 0.008, z * 0.008);

    if (temp > 0.3) return 'mountain';
    if (temp < -0.3) return 'desert';
    if (moisture > 0.2 && temp < 0) return 'forest';
    return 'plains';
}

function getOreBlock(x, y, z) {
    if (!perlinNoise) return BLOCKS.STONE;

    const caveNoise = perlinNoise.noise3D(x * 0.05, y * 0.05, z * 0.05);
    if (caveNoise > 0.4) return BLOCKS.AIR;

    let ore = BLOCKS.STONE;
    const coalChance = perlinNoise.noise2D(x * 0.1 + y * 0.05, z * 0.1 + y * 0.05);
    const ironChance = perlinNoise.noise2D(x * 0.08 + y * 0.03, z * 0.08 + y * 0.03);
    const goldChance = perlinNoise.noise2D(x * 0.06 + y * 0.02, z * 0.06 + y * 0.02);
    const diamondChance = perlinNoise.noise2D(x * 0.04 + y * 0.01, z * 0.04 + y * 0.01);
    const gravelChance = perlinNoise.noise2D(x * 0.12, z * 0.12);

    if (y < 15 && gravelChance > 0.6) ore = BLOCKS.GRAVEL;
    else if (y < 160 && coalChance > 0.5) ore = BLOCKS.COAL_ORE;
    else if (y < 120 && ironChance > 0.6) ore = BLOCKS.IRON_ORE;
    else if (y < 80 && goldChance > 0.7) ore = BLOCKS.GOLD_ORE;
    else if (y < 40 && diamondChance > 0.75) ore = BLOCKS.DIAMOND_ORE;

    return ore;
}

function generateTree(chunk, x, z, height) {
    if (!perlinNoise) return;

    const worldX = chunk.x * CHUNK_SIZE + x;
    const worldZ = chunk.z * CHUNK_SIZE + z;
    const treeChance = perlinNoise.noise2D(worldX * 0.02, worldZ * 0.02);
    if (treeChance < 0.5) return;

    const biome = getBiomeType(worldX, worldZ);
    let trunkHeight, foliageRadius;

    if (biome === 'mountain') {
        trunkHeight = 3 + Math.floor(Math.random() * 2);
        foliageRadius = 1;
    } else if (biome === 'forest') {
        trunkHeight = 6 + Math.floor(Math.random() * 4);
        foliageRadius = 3 + Math.floor(Math.random() * 2);
    } else {
        trunkHeight = 4 + Math.floor(Math.random() * 4);
        foliageRadius = 2 + Math.floor(Math.random() * 2);
    }

    const y = height;

    for (let i = 0; i < trunkHeight && y + i < WORLD_HEIGHT; i++) {
        if (x >= 0 && x < CHUNK_SIZE && z >= 0 && z < CHUNK_SIZE) {
            const idx = x + (y + i) * CHUNK_SIZE + z * CHUNK_SIZE * WORLD_HEIGHT;
            if (idx >= 0 && idx < chunk.blocks.length && chunk.blocks[idx] === BLOCKS.AIR) {
                chunk.blocks[idx] = BLOCKS.OAK_LOG;
            }
        }
    }

    const foliageStart = y + trunkHeight - 3;

    for (let dy = 0; dy < foliageRadius + 2; dy++) {
        const radiusAtLevel = Math.max(1, foliageRadius - Math.floor(dy / 1.5));
        const radiusSquared = radiusAtLevel * radiusAtLevel;

        for (let dx = -radiusAtLevel; dx <= radiusAtLevel; dx++) {
            for (let dz = -radiusAtLevel; dz <= radiusAtLevel; dz++) {
                if (dx * dx + dz * dz > radiusSquared) continue;

                const fx = x + dx;
                const fz = z + dz;
                const fy = foliageStart + dy;

                if (fx >= 0 && fx < CHUNK_SIZE && fz >= 0 && fz < CHUNK_SIZE && fy >= 0 && fy < WORLD_HEIGHT) {
                    const idx = fx + fy * CHUNK_SIZE + fz * CHUNK_SIZE * WORLD_HEIGHT;
                    if (idx >= 0 && idx < chunk.blocks.length && chunk.blocks[idx] === BLOCKS.AIR) {
                        chunk.blocks[idx] = BLOCKS.OAK_LEAVES;
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
