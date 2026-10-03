class BiomeSystem {
    constructor(perlin) {
        this.perlin = perlin;
        this.biomes = {
            PLAINS: 'plains',
            MOUNTAINS: 'mountains',
            DESERT: 'desert',
            FOREST: 'forest',
            OCEAN: 'ocean'
        };
    }

    getBiome(x, z) {
        const temperature = this.perlin.noise2D(x * 0.002, z * 0.002);
        const humidity = this.perlin.noise2D(x * 0.001, z * 0.001);

        if (temperature < -0.3) {
            return this.biomes.MOUNTAINS;
        } else if (temperature > 0.3 && humidity < -0.2) {
            return this.biomes.DESERT;
        } else if (humidity > 0.2) {
            return this.biomes.FOREST;
        } else if (temperature < -0.1) {
            return this.biomes.PLAINS;
        } else {
            return this.biomes.OCEAN;
        }
    }

    getHeightVariation(x, z, baseHeight, biome) {
        switch (biome) {
            case this.biomes.MOUNTAINS:
                return baseHeight + this.perlin.noise2D(x * 0.05, z * 0.05) * 8;
            case this.biomes.DESERT:
                return baseHeight - 2;
            case this.biomes.FOREST:
                return baseHeight + 1;
            case this.biomes.PLAINS:
                return baseHeight;
            case this.biomes.OCEAN:
                return 30;
            default:
                return baseHeight;
        }
    }

    getTopBlock(biome) {
        switch (biome) {
            case this.biomes.MOUNTAINS:
                return BLOCKS.STONE;
            case this.biomes.DESERT:
                return BLOCKS.SAND;
            case this.biomes.FOREST:
                return BLOCKS.GRASS;
            case this.biomes.PLAINS:
                return BLOCKS.GRASS;
            case this.biomes.OCEAN:
                return BLOCKS.SAND;
            default:
                return BLOCKS.GRASS;
        }
    }

    getTreeChance(biome) {
        switch (biome) {
            case this.biomes.MOUNTAINS:
                return 0.01;
            case this.biomes.DESERT:
                return 0.001;
            case this.biomes.FOREST:
                return 0.05;
            case this.biomes.PLAINS:
                return 0.02;
            case this.biomes.OCEAN:
                return 0;
            default:
                return 0.02;
        }
    }
}

function generateCaves(chunk, chunkX, chunkZ, perlin) {
    for (let x = 0; x < CHUNK_SIZE; x++) {
        for (let y = 5; y < 100; y++) {
            for (let z = 0; z < CHUNK_SIZE; z++) {
                const worldX = chunkX * CHUNK_SIZE + x;
                const worldZ = chunkZ * CHUNK_SIZE + z;

                const caveNoise1 = perlin.noise2D(worldX * 0.02, worldZ * 0.02);
                const caveNoise2 = perlin.noise2D(worldX * 0.05, y * 0.02 + worldZ * 0.02);
                const caveValue = caveNoise1 * caveNoise2;

                if (caveValue > 0.2) {
                    const blockId = chunk.getBlock(x, y, z);
                    if (blockId === BLOCKS.STONE || blockId === BLOCKS.DIRT) {
                        chunk.setBlock(x, y, z, BLOCKS.AIR);
                    }
                }
            }
        }
    }
}
