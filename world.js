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
                        if (isCave(wx, y, wz)) {
                            if (y > 0) this.setBlock(x, y, z, BLOCKS.AIR);
                        } else {
                            const block = getOreBlock(wx, y, wz);
                            this.setBlock(x, y, z, block);
                        }
                    } else if (y < height - 1) {
                        if (terrainType === 'sand') {
                            this.setBlock(x, y, z, BLOCKS.SAND);
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

                if (height > 65 && height < 120) {
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
    height += perlinNoise.noise2D(x * 0.003, z * 0.003) * 40;
    height += perlinNoise.noise2D(x * 0.015, z * 0.015) * 20;
    height += perlinNoise.noise2D(x * 0.04, z * 0.04) * 10;
    height += perlinNoise.noise2D(x * 0.1, z * 0.1) * 5;
    height += perlinNoise.noise2D(x * 0.2, z * 0.2) * 2;

    return Math.max(25, Math.min(170, Math.floor(height)));
}

function getTerrainType(x, z) {
    if (!perlinNoise) return 'grass';

    const moisture = perlinNoise.noise2D(x * 0.015, z * 0.015);
    const temp = perlinNoise.noise2D(x * 0.025, z * 0.025);

    if (temp < -0.25) return 'sand';
    if (temp < -0.1 && moisture < -0.2) return 'sand';
    if (moisture > 0.4) return 'grass';

    return 'grass';
}

function isCave(x, y, z) {
    if (!perlinNoise || y < 8 || y > 130) return false;

    const caveNoise1 = perlinNoise.noise2D(x * 0.06 + y * 0.03, z * 0.06 + y * 0.03);
    const caveNoise2 = perlinNoise.noise2D(x * 0.15, z * 0.15 + y * 0.05);
    const combined = caveNoise1 * 0.6 + caveNoise2 * 0.4;

    const depthFactor = Math.max(0, (y - 8) / 122);
    const caveThreshold = -0.3 - depthFactor * 0.15;

    return combined < caveThreshold;
}

function getOreBlock(x, y, z) {
    if (!perlinNoise) return BLOCKS.STONE;

    let ore = BLOCKS.STONE;
    const coalChance = perlinNoise.noise2D(x * 0.12 + y * 0.06, z * 0.12 + y * 0.06);
    const ironChance = perlinNoise.noise2D(x * 0.1 + y * 0.04, z * 0.1 + y * 0.04);
    const goldChance = perlinNoise.noise2D(x * 0.07 + y * 0.025, z * 0.07 + y * 0.025);
    const diamondChance = perlinNoise.noise2D(x * 0.05 + y * 0.015, z * 0.05 + y * 0.015);
    const gravelChance = perlinNoise.noise2D(x * 0.11, z * 0.11);

    if (y < 50 && gravelChance > 0.55) ore = BLOCKS.GRAVEL;
    else if (y < 170 && coalChance > 0.45) ore = BLOCKS.COAL_ORE;
    else if (y < 130 && ironChance > 0.55) ore = BLOCKS.IRON_ORE;
    else if (y < 85 && goldChance > 0.65) ore = BLOCKS.GOLD_ORE;
    else if (y < 45 && diamondChance > 0.72) ore = BLOCKS.DIAMOND_ORE;

    return ore;
}

function generateTree(chunk, x, z, height) {
    if (!perlinNoise) return;

    const worldX = chunk.x * CHUNK_SIZE + x;
    const worldZ = chunk.z * CHUNK_SIZE + z;
    const treeChance = perlinNoise.noise2D(worldX * 0.025, worldZ * 0.025);
    if (treeChance < 0.4) return;

    const trunkHeight = 5 + Math.floor(perlinNoise.noise2D(worldX * 0.1, worldZ * 0.1) * 4);
    const y = height;

    for (let i = 0; i < trunkHeight && y + i < WORLD_HEIGHT; i++) {
        if (x >= 0 && x < CHUNK_SIZE && z >= 0 && z < CHUNK_SIZE) {
            const block = chunk.getBlock(x, y + i, z);
            if (block === BLOCKS.AIR || block === BLOCKS.WATER) {
                chunk.setBlock(x, y + i, z, BLOCKS.OAK_LOG);
            }
        }
    }

    const foliageStart = y + Math.max(trunkHeight - 4, trunkHeight - 2);
    const maxRadius = 3;
    const foliageHeight = 4;

    for (let dy = 0; dy < foliageHeight; dy++) {
        const radiusAtLevel = Math.max(1, maxRadius - Math.floor(dy / 1.3));
        for (let dx = -radiusAtLevel; dx <= radiusAtLevel; dx++) {
            for (let dz = -radiusAtLevel; dz <= radiusAtLevel; dz++) {
                const distSq = dx * dx + dz * dz;
                const radiusSq = radiusAtLevel * radiusAtLevel;
                if (distSq > radiusSq + 0.5) continue;

                const fx = x + dx;
                const fz = z + dz;
                const fy = foliageStart + dy;

                if (fx >= 0 && fx < CHUNK_SIZE && fz >= 0 && fz < CHUNK_SIZE && fy >= 0 && fy < WORLD_HEIGHT) {
                    const block = chunk.getBlock(fx, fy, fz);
                    if (block === BLOCKS.AIR || block === BLOCKS.WATER) {
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
