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

        this.generated = true;
    }
}

const terrainHeightCache = new Map();

function getTerrainHeight(x, z) {
    if (!perlinNoise) return 60;

    const key = `${x},${z}`;
    if (terrainHeightCache.has(key)) {
        return terrainHeightCache.get(key);
    }

    let height = 65;
    height += perlinNoise.noise2D(x * 0.005, z * 0.005) * 35;
    height += perlinNoise.noise2D(x * 0.015, z * 0.015) * 20;
    height += perlinNoise.noise2D(x * 0.05, z * 0.05) * 10;
    height += perlinNoise.noise2D(x * 0.1, z * 0.1) * 5;
    height += perlinNoise.noise2D(x * 0.2, z * 0.2) * 2;

    height = Math.max(20, Math.min(160, Math.floor(height)));
    if (terrainHeightCache.size > 10000) {
        terrainHeightCache.clear();
    }
    terrainHeightCache.set(key, height);
    return height;
}

const terrainTypeCache = new Map();

function getTerrainType(x, z) {
    if (!perlinNoise) return 'grass';

    const key = `${x},${z}`;
    if (terrainTypeCache.has(key)) {
        return terrainTypeCache.get(key);
    }

    const temp = perlinNoise.noise2D(x * 0.02, z * 0.02);
    const humidity = perlinNoise.noise2D(x * 0.03, z * 0.03);

    let type = 'grass';
    if (temp < -0.4) {
        type = 'sand';
    } else if (temp < -0.2 && humidity < 0) {
        type = 'sand';
    } else if (humidity > 0.3) {
        type = 'grass';
    } else if (temp > 0.3) {
        type = 'sand';
    }

    if (terrainTypeCache.size > 5000) {
        terrainTypeCache.clear();
    }
    terrainTypeCache.set(key, type);
    return type;
}

function getOreBlock(x, y, z) {
    if (!perlinNoise) return BLOCKS.STONE;

    const noise = perlinNoise.noise2D(x * 0.1, z * 0.1);
    const yNorm = y / 160;

    if (y < 160 && noise > 0.5) return BLOCKS.COAL_ORE;
    if (y < 120 && noise > 0.6 - yNorm * 0.1) return BLOCKS.IRON_ORE;
    if (y < 80 && noise > 0.7 - yNorm * 0.2) return BLOCKS.GOLD_ORE;
    if (y < 40 && noise > 0.75 - yNorm * 0.25) return BLOCKS.DIAMOND_ORE;

    const gravelChance = perlinNoise.noise2D(x * 0.05 + y * 0.01, z * 0.05 + y * 0.01);
    if (y < 50 && gravelChance > 0.6) return BLOCKS.GRAVEL;

    return BLOCKS.STONE;
}

function generateTree(chunk, x, z, height) {
    if (!perlinNoise) return;

    const worldX = chunk.x * CHUNK_SIZE + x;
    const worldZ = chunk.z * CHUNK_SIZE + z;
    const treeChance = perlinNoise.noise2D(worldX * 0.02, worldZ * 0.02);
    if (treeChance < 0.5) return;

    const baseHeight = 4 + Math.floor(Math.random() * 4);
    const heightVar = Math.random() * 2;
    const trunkHeight = Math.floor(baseHeight + heightVar);
    const y = height;

    for (let i = 0; i < trunkHeight && y + i < WORLD_HEIGHT; i++) {
        if (x >= 0 && x < CHUNK_SIZE && z >= 0 && z < CHUNK_SIZE) {
            if (chunk.getBlock(x, y + i, z) === BLOCKS.AIR) {
                chunk.setBlock(x, y + i, z, BLOCKS.OAK_LOG);
            }
        }
    }

    const foliageStart = y + trunkHeight - 3;
    const foliageRadius = 2 + Math.floor(Math.random() * 3);
    const foliageHeight = foliageRadius + 2;

    for (let dy = 0; dy < foliageHeight; dy++) {
        const radiusAtLevel = Math.max(1, Math.round(foliageRadius * (1 - dy / foliageHeight) + 0.5));
        const angleStep = Math.PI / (radiusAtLevel + 1);

        for (let angle = 0; angle < Math.PI * 2; angle += angleStep) {
            for (let dist = 0; dist <= radiusAtLevel; dist++) {
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
        this.chunkQueue = [];
        this.generatingChunks = new Set();
        this.maxChunksPerFrame = 1;
        initPerlinNoise();
    }

    getChunk(cx, cz) {
        const key = `${cx},${cz}`;
        if (!this.chunks.has(key)) {
            const chunk = new Chunk(cx, cz);
            if (!this.generatingChunks.has(key)) {
                chunk.generate();
                this.chunks.set(key, chunk);
                this.generatingChunks.add(key);
            }
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
