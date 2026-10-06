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

function getTerrainHeight(x, z) {
    if (!perlinNoise) return 60;

    let height = 64;

    const landMass = perlinNoise.noise2D(x * 0.003, z * 0.003);
    if (landMass < -0.2) return 25;

    height += perlinNoise.noise2D(x * 0.004, z * 0.004) * 40;
    height += perlinNoise.noise2D(x * 0.015, z * 0.015) * 20;
    height += perlinNoise.noise2D(x * 0.05, z * 0.05) * 12;
    height += perlinNoise.noise2D(x * 0.1, z * 0.1) * 6;

    const mountainFactor = Math.max(0, perlinNoise.noise2D(x * 0.008, z * 0.008));
    if (mountainFactor > 0.4) {
        height += mountainFactor * 50;
    }

    return Math.max(20, Math.min(180, Math.floor(height)));
}

function getTerrainType(x, z) {
    if (!perlinNoise) return 'grass';

    const temp = perlinNoise.noise2D(x * 0.02, z * 0.02);
    const humidity = perlinNoise.noise2D(x * 0.025, z * 0.025);

    if (temp < -0.2) return 'sand';
    if (temp > 0.5 && humidity < -0.3) return 'sand';
    if (humidity > 0.4) return 'grass';
    return 'grass';
}

function getOreBlock(x, y, z) {
    if (!perlinNoise) return BLOCKS.STONE;

    let ore = BLOCKS.STONE;

    const depthFactor = Math.max(0, (200 - y) / 200);
    const coalChance = perlinNoise.noise2D(x * 0.12 + y * 0.08, z * 0.12 + y * 0.08);
    const ironChance = perlinNoise.noise2D(x * 0.1 + y * 0.06, z * 0.1 + y * 0.06);
    const goldChance = perlinNoise.noise2D(x * 0.08 + y * 0.04, z * 0.08 + y * 0.04);
    const diamondChance = perlinNoise.noise2D(x * 0.06 + y * 0.03, z * 0.06 + y * 0.03);

    if (y < 160 && coalChance > 0.4) ore = BLOCKS.COAL_ORE;
    if (y < 120 && y > 10 && ironChance > 0.45 + depthFactor * 0.2) ore = BLOCKS.IRON_ORE;
    if (y < 80 && y > 5 && goldChance > 0.55 + depthFactor * 0.3) ore = BLOCKS.GOLD_ORE;
    if (y < 40 && y > 2 && diamondChance > 0.6 + depthFactor * 0.35) ore = BLOCKS.DIAMOND_ORE;

    return ore;
}

function generateTree(chunk, x, z, height) {
    if (!perlinNoise) return;

    const worldX = chunk.x * CHUNK_SIZE + x;
    const worldZ = chunk.z * CHUNK_SIZE + z;
    const treeChance = perlinNoise.noise2D(worldX * 0.025, worldZ * 0.025);
    if (treeChance < 0.55) return;

    if (height < 66 || height > 175) return;

    const treeType = perlinNoise.noise2D(worldX * 0.05, worldZ * 0.05);
    const trunkHeight = treeType > 0.3 ?
        (6 + Math.floor(Math.random() * 6)) :
        (4 + Math.floor(Math.random() * 3));
    const y = height;

    for (let i = 0; i < trunkHeight && y + i < WORLD_HEIGHT; i++) {
        if (x >= 0 && x < CHUNK_SIZE && z >= 0 && z < CHUNK_SIZE) {
            if (chunk.getBlock(x, y + i, z) === BLOCKS.AIR) {
                chunk.setBlock(x, y + i, z, BLOCKS.OAK_LOG);
            }
        }
    }

    const foliageStart = y + Math.max(3, trunkHeight - 4);
    const foliageRadius = treeType > 0.3 ? (3 + Math.floor(Math.random() * 2)) : (2 + Math.floor(Math.random() * 1));

    for (let dy = 0; dy < foliageRadius + 3; dy++) {
        const radiusAtLevel = Math.max(1, foliageRadius - Math.floor(dy / 1.3));
        for (let angle = 0; angle < Math.PI * 2; angle += 0.3) {
            for (let dist = 0.5; dist <= radiusAtLevel; dist += 0.6) {
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
        this.spawnPoint = null;
        initPerlinNoise();
        this.findSpawnPoint();
    }

    findSpawnPoint() {
        let x = 0, z = 0;
        let height = getTerrainHeight(x, z);
        let attempts = 0;

        while ((height < 65 || height > 140) && attempts < 20) {
            x += Math.random() * 100 - 50;
            z += Math.random() * 100 - 50;
            height = getTerrainHeight(Math.floor(x), Math.floor(z));
            attempts++;
        }

        this.spawnPoint = { x, y: height + 2, z };
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
