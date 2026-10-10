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

function shouldGenerateCave(x, y, z) {
    if (!perlinNoise || y < 10 || y > 120) return false;

    const caveScale = 0.08;
    const cave1 = Math.abs(perlinNoise.noise3D(x * caveScale, y * caveScale, z * caveScale));
    const cave2 = Math.abs(perlinNoise.noise3D(x * caveScale * 0.5, y * caveScale * 0.5, z * caveScale * 0.5));

    const threshold = 0.3 + (y / 120) * 0.2;
    return cave1 < threshold && cave2 < threshold * 1.5;
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
                        const isCave = shouldGenerateCave(wx, y, wz);
                        if (isCave) {
                            this.setBlock(x, y, z, BLOCKS.AIR);
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
    height += perlinNoise.noise2D(x * 0.004, z * 0.004) * 40;
    height += perlinNoise.noise2D(x * 0.015, z * 0.015) * 20;
    height += perlinNoise.noise2D(x * 0.04, z * 0.04) * 10;
    height += perlinNoise.noise2D(x * 0.08, z * 0.08) * 5;
    height += perlinNoise.noise2D(x * 0.15, z * 0.15) * 2;

    return Math.max(25, Math.min(180, Math.floor(height)));
}

function getTerrainType(x, z) {
    if (!perlinNoise) return 'grass';

    const temp = perlinNoise.noise2D(x * 0.02, z * 0.02);
    const humidity = perlinNoise.noise2D(x * 0.03, z * 0.03);

    if (temp < -0.2) return 'sand';
    if (humidity > 0.5 && temp > 0.1) return 'grass';
    if (temp > 0.3) return 'grass';
    return 'grass';
}

function getOreBlock(x, y, z) {
    if (!perlinNoise) return BLOCKS.STONE;

    let ore = BLOCKS.STONE;
    const depthFactor = y / 120;

    const coalChance = perlinNoise.noise2D(x * 0.12 + y * 0.06, z * 0.12 + y * 0.06);
    const ironChance = perlinNoise.noise2D(x * 0.10 + y * 0.04, z * 0.10 + y * 0.04);
    const goldChance = perlinNoise.noise2D(x * 0.08 + y * 0.03, z * 0.08 + y * 0.03);
    const diamondChance = perlinNoise.noise2D(x * 0.06 + y * 0.02, z * 0.06 + y * 0.02);

    if (y < 160 && coalChance > 0.45) ore = BLOCKS.COAL_ORE;
    else if (y < 100 && ironChance > 0.55) ore = BLOCKS.IRON_ORE;
    else if (y < 60 && goldChance > 0.65) ore = BLOCKS.GOLD_ORE;
    else if (y < 35 && diamondChance > 0.70) ore = BLOCKS.DIAMOND_ORE;
    else if (y < 80 && y > 30 && perlinNoise.noise2D(x * 0.15, z * 0.15) > 0.6) ore = BLOCKS.GRAVEL;

    return ore;
}

function generateTree(chunk, x, z, height) {
    if (!perlinNoise) return;

    const worldX = chunk.x * CHUNK_SIZE + x;
    const worldZ = chunk.z * CHUNK_SIZE + z;
    const treeChance = perlinNoise.noise2D(worldX * 0.03, worldZ * 0.03);
    if (treeChance < 0.4) return;

    const trunkHeight = 5 + Math.floor(Math.random() * 5);
    const y = height;

    for (let i = 0; i < trunkHeight && y + i < WORLD_HEIGHT; i++) {
        if (x >= 0 && x < CHUNK_SIZE && z >= 0 && z < CHUNK_SIZE) {
            const block = chunk.getBlock(x, y + i, z);
            if (block === BLOCKS.AIR || block === BLOCKS.OAK_LEAVES) {
                chunk.setBlock(x, y + i, z, BLOCKS.OAK_LOG);
            }
        }
    }

    const foliageStart = Math.max(y + trunkHeight - 4, y + 2);
    const foliageRadius = 3;

    for (let dy = 0; dy < foliageRadius + 1; dy++) {
        const radiusAtLevel = Math.max(1.5, foliageRadius - dy * 0.8);
        for (let dx = -Math.ceil(radiusAtLevel); dx <= Math.ceil(radiusAtLevel); dx++) {
            for (let dz = -Math.ceil(radiusAtLevel); dz <= Math.ceil(radiusAtLevel); dz++) {
                const dist = Math.sqrt(dx * dx + dz * dz);
                if (dist > radiusAtLevel) continue;

                const fx = x + dx;
                const fz = z + dz;
                const fy = foliageStart + dy;

                if (fx >= 0 && fx < CHUNK_SIZE && fz >= 0 && fz < CHUNK_SIZE && fy >= 0 && fy < WORLD_HEIGHT) {
                    const block = chunk.getBlock(fx, fy, fz);
                    if (block === BLOCKS.AIR) {
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
