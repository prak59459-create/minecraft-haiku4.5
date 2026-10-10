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
                        } else if (terrainType === 'gravel') {
                            this.setBlock(x, y, z, BLOCKS.GRAVEL);
                        } else {
                            this.setBlock(x, y, z, BLOCKS.DIRT);
                        }
                    } else if (y < height) {
                        if (terrainType === 'sand') {
                            this.setBlock(x, y, z, BLOCKS.SAND);
                        } else if (terrainType === 'gravel') {
                            this.setBlock(x, y, z, BLOCKS.GRAVEL);
                        } else {
                            this.setBlock(x, y, z, BLOCKS.GRASS);
                        }
                    } else if (y < 62) {
                        this.setBlock(x, y, z, BLOCKS.WATER);
                    }
                }

                const treeChance = perlinNoise.noise2D(wx * 0.02, wz * 0.02);
                if (terrainType === 'forest' && height > 65 && treeChance > 0.3) {
                    generateTree(this, x, z, height);
                } else if ((terrainType === 'grass') && height > 70 && treeChance > 0.6) {
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

    const mountainNoise = perlinNoise.noise2D(x * 0.003, z * 0.003);
    if (mountainNoise > 0.6) {
        height += mountainNoise * 50;
    }

    return Math.max(20, Math.min(180, Math.floor(height)));
}

function getTerrainType(x, z) {
    if (!perlinNoise) return 'grass';

    const temp = perlinNoise.noise2D(x * 0.02, z * 0.02);
    const moisture = perlinNoise.noise2D(x * 0.015, z * 0.015);

    if (temp < -0.3) return 'sand';
    if (temp > 0.4 && moisture > 0.3) return 'forest';
    if (moisture < -0.4) return 'gravel';
    return 'grass';
}

function getOreBlock(x, y, z) {
    if (!perlinNoise) return BLOCKS.STONE;

    const caveNoise = getCaveNoise(x, y, z);
    if (caveNoise < 0.33) return BLOCKS.AIR;

    let ore = BLOCKS.STONE;
    const coalChance = perlinNoise.noise2D(x * 0.12 + y * 0.06, z * 0.12 + y * 0.06);
    const ironChance = perlinNoise.noise2D(x * 0.1 + y * 0.04, z * 0.1 + y * 0.04);
    const goldChance = perlinNoise.noise2D(x * 0.08 + y * 0.03, z * 0.08 + y * 0.03);
    const diamondChance = perlinNoise.noise2D(x * 0.05 + y * 0.02, z * 0.05 + y * 0.02);
    const clayChance = perlinNoise.noise2D(x * 0.07 + y * 0.02, z * 0.07 + y * 0.02);

    if (y < 180 && coalChance > 0.48) ore = BLOCKS.COAL_ORE;
    if (y < 128 && ironChance > 0.58) ore = BLOCKS.IRON_ORE;
    if (y < 96 && goldChance > 0.68) ore = BLOCKS.GOLD_ORE;
    if (y < 48 && diamondChance > 0.72) ore = BLOCKS.DIAMOND_ORE;
    if (y < 64 && y > 40 && clayChance > 0.65) ore = BLOCKS.CLAY;

    return ore;
}

function getCaveNoise(x, y, z) {
    if (!perlinNoise) return 1;

    const largeScale = perlinNoise.noise2D(x * 0.04, z * 0.04);
    const mediumScale = perlinNoise.noise2D(x * 0.08 + y * 0.02, z * 0.08 + y * 0.02);
    const smallScale = perlinNoise.noise2D(x * 0.15 + y * 0.05, z * 0.15 + y * 0.05);
    const verticalWave = Math.sin(y * 0.05) * 0.2 + Math.sin(x * 0.02) * 0.1 + Math.sin(z * 0.02) * 0.1;

    let caveSystem = (largeScale * 0.4 + mediumScale * 0.3 + smallScale * 0.2 + verticalWave * 0.1);

    if (y < 30) {
        caveSystem *= 0.7;
    }

    return caveSystem;
}

function generateTree(chunk, x, z, height) {
    if (!perlinNoise) return;

    const worldX = chunk.x * CHUNK_SIZE + x;
    const worldZ = chunk.z * CHUNK_SIZE + z;
    const treeChance = perlinNoise.noise2D(worldX * 0.02, worldZ * 0.02);
    if (treeChance < 0.5) return;

    const trunkHeight = 4 + Math.floor(Math.random() * 4);
    const y = height;

    for (let i = 0; i < trunkHeight && y + i < WORLD_HEIGHT; i++) {
        if (x >= 0 && x < CHUNK_SIZE && z >= 0 && z < CHUNK_SIZE) {
            if (chunk.getBlock(x, y + i, z) === BLOCKS.AIR) {
                chunk.setBlock(x, y + i, z, BLOCKS.OAK_LOG);
            }
        }
    }

    const foliageStart = y + trunkHeight - 3;
    const foliageRadius = 2 + Math.floor(Math.random() * 2);

    for (let dy = 0; dy < foliageRadius + 2; dy++) {
        const radiusAtLevel = Math.max(1, foliageRadius - Math.floor(dy / 1.5));
        for (let angle = 0; angle < Math.PI * 2; angle += 0.4) {
            for (let dist = 0; dist <= radiusAtLevel; dist += 0.7) {
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
        const loadDistance = Math.min(this.renderDistance + 2, 16);

        for (let dx = -loadDistance; dx <= loadDistance; dx++) {
            for (let dz = -loadDistance; dz <= loadDistance; dz++) {
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

        toDelete.forEach(key => {
            const chunk = this.chunks.get(key);
            if (chunk && chunk.blocks) {
                chunk.blocks = null;
            }
            this.chunks.delete(key);
        });
    }
}

export const CHUNK_SIZE_EXPORT = CHUNK_SIZE;
export const WORLD_HEIGHT_EXPORT = WORLD_HEIGHT;
