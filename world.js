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
                    } else if (isCaveBlock(wx, y, wz)) {
                        this.setBlock(x, y, z, BLOCKS.AIR);
                    } else if (y < height - 4) {
                        const block = getOreBlock(wx, y, wz);
                        this.setBlock(x, y, z, block);
                    } else if (y < height - 1) {
                        if (terrainType === 'sand') {
                            this.setBlock(x, y, z, BLOCKS.SAND);
                        } else if (terrainType === 'clay') {
                            this.setBlock(x, y, z, BLOCKS.CLAY);
                        } else if (terrainType === 'snow') {
                            this.setBlock(x, y, z, BLOCKS.DIRT);
                        } else {
                            this.setBlock(x, y, z, BLOCKS.DIRT);
                        }
                    } else if (y < height) {
                        if (terrainType === 'sand') {
                            this.setBlock(x, y, z, BLOCKS.SAND);
                        } else if (terrainType === 'grass') {
                            this.setBlock(x, y, z, BLOCKS.GRASS);
                        } else if (terrainType === 'clay') {
                            this.setBlock(x, y, z, BLOCKS.CLAY);
                        } else if (terrainType === 'snow') {
                            this.setBlock(x, y, z, BLOCKS.SNOW);
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
    height += perlinNoise.noise2D(x * 0.004, z * 0.004) * 35;
    height += perlinNoise.noise2D(x * 0.015, z * 0.015) * 20;
    height += perlinNoise.noise2D(x * 0.05, z * 0.05) * 12;
    height += perlinNoise.noise2D(x * 0.1, z * 0.1) * 6;
    height += perlinNoise.noise2D(x * 0.2, z * 0.2) * 3;

    return Math.max(20, Math.min(160, Math.floor(height)));
}

function getTerrainType(x, z) {
    if (!perlinNoise) return 'grass';

    const temp = perlinNoise.noise2D(x * 0.02, z * 0.02);
    const humidity = perlinNoise.noise2D(x * 0.015, z * 0.015);

    if (temp < -0.3) return 'sand';
    if (temp > 0.5 && humidity < -0.2) return 'snow';
    if (humidity > 0.4) return 'clay';
    return 'grass';
}

function getOreBlock(x, y, z) {
    if (!perlinNoise) return BLOCKS.STONE;

    let ore = BLOCKS.STONE;
    const coalChance = perlinNoise.noise2D(x * 0.12 + y * 0.08, z * 0.12 + y * 0.08);
    const ironChance = perlinNoise.noise2D(x * 0.1 + y * 0.06, z * 0.1 + y * 0.06);
    const goldChance = perlinNoise.noise2D(x * 0.08 + y * 0.04, z * 0.08 + y * 0.04);
    const diamondChance = perlinNoise.noise2D(x * 0.06 + y * 0.03, z * 0.06 + y * 0.03);
    const gravelChance = perlinNoise.noise2D(x * 0.15 + y * 0.05, z * 0.15 + y * 0.05);
    const obsidianChance = perlinNoise.noise2D(x * 0.05 + y * 0.02, z * 0.05 + y * 0.02);

    if (y < 160 && coalChance > 0.35) ore = BLOCKS.COAL_ORE;
    else if (y < 100 && ironChance > 0.45) ore = BLOCKS.IRON_ORE;
    else if (y < 60 && goldChance > 0.6) ore = BLOCKS.GOLD_ORE;
    else if (y < 32 && diamondChance > 0.65) ore = BLOCKS.DIAMOND_ORE;
    else if (y < 65 && gravelChance > 0.55) ore = BLOCKS.GRAVEL;
    else if (y < 10 && obsidianChance > 0.7) ore = BLOCKS.OBSIDIAN;

    return ore;
}

function isCaveBlock(x, y, z) {
    if (!perlinNoise) return false;

    const caveValue = Math.abs(perlinNoise.noise3D ? perlinNoise.noise3D(x * 0.05, y * 0.05, z * 0.05) :
                               perlinNoise.noise2D(x * 0.05, z * 0.05) * Math.sin(y * 0.05));

    if (y < 50 && caveValue > 0.6) return true;
    if (y < 30 && caveValue > 0.4) return true;

    return false;
}

function generateTree(chunk, x, z, height) {
    if (!perlinNoise) return;

    const worldX = chunk.x * CHUNK_SIZE + x;
    const worldZ = chunk.z * CHUNK_SIZE + z;
    const treeChance = perlinNoise.noise2D(worldX * 0.02, worldZ * 0.02);
    if (treeChance < 0.3) return;

    const trunkHeight = 5 + Math.floor(Math.random() * 6);
    const y = height;

    for (let i = 0; i < trunkHeight && y + i < WORLD_HEIGHT; i++) {
        if (x >= 0 && x < CHUNK_SIZE && z >= 0 && z < CHUNK_SIZE) {
            if (chunk.getBlock(x, y + i, z) === BLOCKS.AIR) {
                chunk.setBlock(x, y + i, z, BLOCKS.OAK_LOG);
            }
        }
    }

    const foliageStart = y + Math.max(3, trunkHeight - 4);
    const foliageRadius = 2 + Math.floor(Math.random() * 3);

    for (let dy = 0; dy < foliageRadius + 3; dy++) {
        const radiusAtLevel = Math.max(1, foliageRadius - Math.floor(dy / 1.2));
        const step = radiusAtLevel > 1 ? 0.3 : 0.5;

        for (let angle = 0; angle < Math.PI * 2; angle += step) {
            for (let dist = 0; dist <= radiusAtLevel; dist += 0.6) {
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

export class World {
    constructor(renderDistance = 10) {
        this.chunks = new Map();
        this.renderDistance = renderDistance;
        this.loadDistance = renderDistance + 3;
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
        const distLimit = this.loadDistance;

        for (let dx = -distLimit; dx <= distLimit; dx++) {
            for (let dz = -distLimit; dz <= distLimit; dz++) {
                const dist = Math.max(Math.abs(dx), Math.abs(dz));
                if (dist <= distLimit) {
                    const key = `${playerChunkX + dx},${playerChunkZ + dz}`;
                    chunksToKeep.add(key);
                    this.getChunk(playerChunkX + dx, playerChunkZ + dz);
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
    }
}

export const CHUNK_SIZE_EXPORT = CHUNK_SIZE;
export const WORLD_HEIGHT_EXPORT = WORLD_HEIGHT;
