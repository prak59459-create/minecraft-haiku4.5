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
                        } else if (terrainType === 'snow') {
                            this.setBlock(x, y, z, BLOCKS.DIRT);
                        } else {
                            this.setBlock(x, y, z, BLOCKS.DIRT);
                        }
                    } else if (y < height) {
                        if (terrainType === 'sand') {
                            this.setBlock(x, y, z, BLOCKS.SAND);
                        } else if (terrainType === 'snow') {
                            this.setBlock(x, y, z, BLOCKS.SNOW);
                        } else if (terrainType === 'grass') {
                            this.setBlock(x, y, z, BLOCKS.GRASS);
                        } else {
                            this.setBlock(x, y, z, BLOCKS.GRASS);
                        }
                    } else if (y < 62) {
                        if (terrainType === 'snow') {
                            this.setBlock(x, y, z, BLOCKS.ICE);
                        } else {
                            this.setBlock(x, y, z, BLOCKS.WATER);
                        }
                    }
                }

                if (height > 65) {
                    generateTree(this, x, z, height);
                }
            }
        }

        // Generate caves
        generateCaves(this, worldX, worldZ);
        this.generated = true;
    }
}

function getTerrainHeight(x, z) {
    if (!perlinNoise) return 60;

    let height = 64;
    height += perlinNoise.noise2D(x * 0.003, z * 0.003) * 40;
    height += perlinNoise.noise2D(x * 0.01, z * 0.01) * 20;
    height += perlinNoise.noise2D(x * 0.03, z * 0.03) * 12;
    height += perlinNoise.noise2D(x * 0.08, z * 0.08) * 6;
    height += perlinNoise.noise2D(x * 0.15, z * 0.15) * 3;

    return Math.max(20, Math.min(160, Math.floor(height)));
}

function getTerrainType(x, z) {
    if (!perlinNoise) return 'grass';

    const temp = perlinNoise.noise2D(x * 0.02, z * 0.02);
    const humidity = perlinNoise.noise2D(x * 0.015, z * 0.015);

    if (temp < -0.4) return 'snow';
    if (temp < -0.2 && humidity > 0.3) return 'sand';
    if (humidity > 0.4) return 'grass';
    return 'grass';
}

function getOreBlock(x, y, z) {
    if (!perlinNoise) return BLOCKS.STONE;

    let ore = BLOCKS.STONE;

    const coalNoise = Math.abs(perlinNoise.noise3D(x * 0.1, y * 0.1, z * 0.1));
    const ironNoise = Math.abs(perlinNoise.noise3D(x * 0.08, y * 0.08, z * 0.08));
    const goldNoise = Math.abs(perlinNoise.noise3D(x * 0.06, y * 0.06, z * 0.06));
    const diamondNoise = Math.abs(perlinNoise.noise3D(x * 0.05, y * 0.05, z * 0.05));
    const lapisNoise = Math.abs(perlinNoise.noise3D(x * 0.07, y * 0.07, z * 0.07));
    const redstoneNoise = Math.abs(perlinNoise.noise3D(x * 0.09, y * 0.09, z * 0.09));

    if (y < 160 && coalNoise > 0.55) ore = BLOCKS.COAL_ORE;
    else if (y < 120 && ironNoise > 0.62) ore = BLOCKS.IRON_ORE;
    else if (y < 80 && goldNoise > 0.68) ore = BLOCKS.GOLD_ORE;
    else if (y < 40 && diamondNoise > 0.70) ore = BLOCKS.DIAMOND_ORE;
    else if (y < 64 && lapisNoise > 0.64) ore = BLOCKS.LAPIS_ORE;
    else if (y < 20 && redstoneNoise > 0.65) ore = BLOCKS.REDSTONE_ORE;

    return ore;
}

function generateTree(chunk, x, z, height) {
    if (!perlinNoise) return;

    const worldX = chunk.x * CHUNK_SIZE + x;
    const worldZ = chunk.z * CHUNK_SIZE + z;
    const treeChance = perlinNoise.noise2D(worldX * 0.02, worldZ * 0.02);
    if (treeChance < 0.4) return;

    const trunkHeight = 5 + Math.floor(Math.random() * 5);
    const y = height;

    // Generate trunk
    for (let i = 0; i < trunkHeight && y + i < WORLD_HEIGHT; i++) {
        if (x >= 0 && x < CHUNK_SIZE && z >= 0 && z < CHUNK_SIZE) {
            if (chunk.getBlock(x, y + i, z) === BLOCKS.AIR) {
                chunk.setBlock(x, y + i, z, BLOCKS.OAK_LOG);
            }
        }
    }

    // Generate foliage with improved shape
    const foliageStart = y + trunkHeight - 4;
    const foliageRadius = 3 + Math.floor(Math.random() * 2);

    for (let dy = 0; dy < foliageRadius + 3; dy++) {
        const progress = dy / (foliageRadius + 2);
        const radiusAtLevel = Math.max(1, Math.round(foliageRadius * (1 - progress * progress)));

        for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 8) {
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
        const chunksToGenerate = [];

        for (let dx = -this.renderDistance; dx <= this.renderDistance; dx++) {
            for (let dz = -this.renderDistance; dz <= this.renderDistance; dz++) {
                const cx = playerChunkX + dx;
                const cz = playerChunkZ + dz;
                const key = `${cx},${cz}`;
                chunksToKeep.add(key);

                if (!this.chunks.has(key)) {
                    chunksToGenerate.push({ cx, cz });
                }
            }
        }

        const toDelete = [];
        for (const [key] of this.chunks) {
            if (!chunksToKeep.has(key)) {
                toDelete.push(key);
            }
        }

        // Generate new chunks
        for (const { cx, cz } of chunksToGenerate) {
            const chunk = new Chunk(cx, cz);
            chunk.generate();
            this.chunks.set(`${cx},${cz}`, chunk);
        }

        // Delete far chunks
        toDelete.forEach(key => this.chunks.delete(key));
    }
}

function generateCaves(chunk, worldX, worldZ) {
    if (!perlinNoise) return;

    for (let x = 0; x < CHUNK_SIZE; x++) {
        for (let z = 0; z < CHUNK_SIZE; z++) {
            for (let y = 10; y < 120; y++) {
                const wx = worldX + x;
                const wz = worldZ + z;

                const caveNoise1 = perlinNoise.noise3D(wx * 0.03, y * 0.03, wz * 0.03);
                const caveNoise2 = perlinNoise.noise3D(wx * 0.07, y * 0.05, wz * 0.07);

                const combinedNoise = (caveNoise1 + caveNoise2) / 2;

                if (combinedNoise > 0.35 && chunk.getBlock(x, y, z) !== BLOCKS.BEDROCK) {
                    const block = chunk.getBlock(x, y, z);
                    if (block !== BLOCKS.WATER) {
                        chunk.setBlock(x, y, z, BLOCKS.AIR);
                    }
                }
            }
        }
    }
}

export const CHUNK_SIZE_EXPORT = CHUNK_SIZE;
export const WORLD_HEIGHT_EXPORT = WORLD_HEIGHT;
