import { BLOCKS } from './blocks.js';

let perlinNoise;

if (typeof SimplexNoise !== 'undefined') {
    perlinNoise = new SimplexNoise();
}

function getTerrainHeight(x, z) {
    if (!perlinNoise) return 60;

    let height = 65;
    height += perlinNoise.noise2D(x * 0.003, z * 0.003) * 50;
    height += perlinNoise.noise2D(x * 0.01, z * 0.01) * 25;
    height += perlinNoise.noise2D(x * 0.03, z * 0.03) * 12;
    height += perlinNoise.noise2D(x * 0.08, z * 0.08) * 6;
    height += perlinNoise.noise2D(x * 0.15, z * 0.15) * 3;

    return Math.max(20, Math.min(200, Math.floor(height)));
}

function getTerrainType(x, z) {
    if (!perlinNoise) return 'grass';

    const temp = perlinNoise.noise2D(x * 0.01, z * 0.01);
    const moisture = perlinNoise.noise2D(x * 0.015, z * 0.015);

    if (temp < -0.4) return 'sand';
    if (moisture > 0.4) return 'forest';
    return 'grass';
}

function getOreBlock(x, y, z) {
    if (!perlinNoise) return BLOCKS.STONE;

    let ore = BLOCKS.STONE;
    const coalChance = perlinNoise.noise2D(x * 0.15 + y * 0.08, z * 0.15 + y * 0.08);
    const ironChance = perlinNoise.noise2D(x * 0.12 + y * 0.06, z * 0.12 + y * 0.06);
    const goldChance = perlinNoise.noise2D(x * 0.1 + y * 0.04, z * 0.1 + y * 0.04);
    const diamondChance = perlinNoise.noise2D(x * 0.08 + y * 0.02, z * 0.08 + y * 0.02);
    const gravelChance = perlinNoise.noise2D(x * 0.2, z * 0.2);

    if (gravelChance > 0.7 && y < 120) ore = BLOCKS.GRAVEL;
    else if (y < 160 && coalChance > 0.55) ore = BLOCKS.COAL_ORE;
    else if (y < 120 && ironChance > 0.65) ore = BLOCKS.IRON_ORE;
    else if (y < 80 && goldChance > 0.75) ore = BLOCKS.GOLD_ORE;
    else if (y < 40 && diamondChance > 0.8) ore = BLOCKS.DIAMOND_ORE;

    return ore;
}

function generateTree(blocks, x, z, height, chunkX, chunkZ) {
    if (!perlinNoise) return;

    const worldX = chunkX * 16 + x;
    const worldZ = chunkZ * 16 + z;
    const treeChance = perlinNoise.noise2D(worldX * 0.025, worldZ * 0.025);
    if (treeChance < 0.4) return;

    const trunkHeight = 5 + Math.floor(Math.random() * 5);
    const foliageRadius = 3 + Math.floor(Math.random() * 2);

    for (let i = 0; i < trunkHeight && height + i < 256; i++) {
        if (x >= 0 && x < 16 && z >= 0 && z < 16 && height + i < 256) {
            const idx = x + (height + i) * 16 + z * 16 * 256;
            if (blocks[idx] === BLOCKS.AIR) {
                blocks[idx] = BLOCKS.OAK_LOG;
            }
        }
    }

    const foliageStart = height + trunkHeight - 4;

    for (let dy = 0; dy < foliageRadius + 2; dy++) {
        const radiusAtLevel = Math.max(1, foliageRadius - Math.floor(dy / 2));
        for (let angle = 0; angle < Math.PI * 2; angle += 0.35) {
            for (let dist = 0.5; dist <= radiusAtLevel; dist += 1) {
                const dx = Math.round(Math.cos(angle) * dist);
                const dz = Math.round(Math.sin(angle) * dist);
                const fx = x + dx;
                const fz = z + dz;
                const fy = foliageStart + dy;

                if (fx >= 0 && fx < 16 && fz >= 0 && fz < 16 && fy >= 0 && fy < 256) {
                    const idx = fx + fy * 16 + fz * 16 * 256;
                    if (blocks[idx] === BLOCKS.AIR || blocks[idx] === BLOCKS.OAK_LEAVES) {
                        blocks[idx] = BLOCKS.OAK_LEAVES;
                    }
                }
            }
        }
    }
}

self.onmessage = function(e) {
    const { chunkX, chunkZ } = e.data;

    const blocks = new Uint8Array(16 * 256 * 16);

    for (let x = 0; x < 16; x++) {
        for (let z = 0; z < 16; z++) {
            const wx = chunkX * 16 + x;
            const wz = chunkZ * 16 + z;

            let height = getTerrainHeight(wx, wz);
            let terrainType = getTerrainType(wx, wz);

            for (let y = 0; y < 256; y++) {
                const idx = x + y * 16 + z * 16 * 256;

                if (y === 0) {
                    blocks[idx] = BLOCKS.BEDROCK;
                } else if (y < height - 5) {
                    blocks[idx] = getOreBlock(wx, y, wz);
                } else if (y < height - 1) {
                    blocks[idx] = terrainType === 'sand' ? BLOCKS.SAND : BLOCKS.DIRT;
                } else if (y < height) {
                    if (terrainType === 'sand') {
                        blocks[idx] = BLOCKS.SAND;
                    } else if (terrainType === 'forest') {
                        blocks[idx] = BLOCKS.GRASS;
                    } else {
                        blocks[idx] = BLOCKS.GRASS;
                    }
                } else if (y < 62) {
                    blocks[idx] = BLOCKS.WATER;
                } else {
                    blocks[idx] = BLOCKS.AIR;
                }
            }

            if (height > 65 && terrainType === 'forest') {
                generateTree(blocks, x, z, height, chunkX, chunkZ);
            }
        }
    }

    self.postMessage({ chunkX, chunkZ, blocks: Array.from(blocks) });
};
