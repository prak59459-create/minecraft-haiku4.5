import { BLOCK_TYPES } from './blocks.js';

export const BIOME_TYPES = {
    PLAINS: 'plains',
    DESERT: 'desert',
    FOREST: 'forest',
    MOUNTAIN: 'mountain',
    TUNDRA: 'tundra',
    SWAMP: 'swamp'
};

export class BiomeGenerator {
    constructor(noise) {
        this.noise = noise;
    }

    getBiomeAtPosition(worldX, worldZ) {
        const biomeNoise = this.noise.noise2D(worldX * 0.01, worldZ * 0.01);

        if (biomeNoise < -0.5) {
            return BIOME_TYPES.DESERT;
        } else if (biomeNoise < -0.2) {
            return BIOME_TYPES.PLAINS;
        } else if (biomeNoise < 0.1) {
            return BIOME_TYPES.FOREST;
        } else if (biomeNoise < 0.35) {
            return BIOME_TYPES.MOUNTAIN;
        } else if (biomeNoise < 0.6) {
            return BIOME_TYPES.TUNDRA;
        } else {
            return BIOME_TYPES.SWAMP;
        }
    }

    getHeightModifier(biome) {
        switch (biome) {
            case BIOME_TYPES.PLAINS:
                return { scale: 1.0, baseHeight: 64 };
            case BIOME_TYPES.DESERT:
                return { scale: 1.2, baseHeight: 68 };
            case BIOME_TYPES.FOREST:
                return { scale: 1.1, baseHeight: 65 };
            case BIOME_TYPES.MOUNTAIN:
                return { scale: 2.0, baseHeight: 70 };
            case BIOME_TYPES.TUNDRA:
                return { scale: 0.8, baseHeight: 62 };
            case BIOME_TYPES.SWAMP:
                return { scale: 0.6, baseHeight: 61 };
            default:
                return { scale: 1.0, baseHeight: 64 };
        }
    }

    getSurfaceBlock(biome, height) {
        switch (biome) {
            case BIOME_TYPES.DESERT:
                return BLOCK_TYPES.SAND;
            case BIOME_TYPES.FOREST:
                return BLOCK_TYPES.GRASS;
            case BIOME_TYPES.MOUNTAIN:
                return height > 85 ? BLOCK_TYPES.STONE : BLOCK_TYPES.GRASS;
            case BIOME_TYPES.TUNDRA:
                return BLOCK_TYPES.GRAVEL;
            case BIOME_TYPES.SWAMP:
                return BLOCK_TYPES.DIRT;
            case BIOME_TYPES.PLAINS:
            default:
                return BLOCK_TYPES.GRASS;
        }
    }

    getTreeChance(biome) {
        switch (biome) {
            case BIOME_TYPES.FOREST:
                return 0.1;
            case BIOME_TYPES.PLAINS:
                return 0.01;
            case BIOME_TYPES.SWAMP:
                return 0.03;
            case BIOME_TYPES.DESERT:
            case BIOME_TYPES.TUNDRA:
            case BIOME_TYPES.MOUNTAIN:
            default:
                return 0;
        }
    }

    getVegetation(biome, height) {
        switch (biome) {
            case BIOME_TYPES.FOREST:
                return BLOCK_TYPES.LEAVES;
            case BIOME_TYPES.SWAMP:
                return BLOCK_TYPES.WATER;
            default:
                return null;
        }
    }

    getTemperature(biome) {
        switch (biome) {
            case BIOME_TYPES.DESERT:
                return 2.0;
            case BIOME_TYPES.PLAINS:
                return 1.5;
            case BIOME_TYPES.FOREST:
                return 1.2;
            case BIOME_TYPES.MOUNTAIN:
                return 0.5;
            case BIOME_TYPES.TUNDRA:
                return -1.0;
            case BIOME_TYPES.SWAMP:
                return 0.8;
            default:
                return 1.0;
        }
    }

    getPrecipitation(biome) {
        switch (biome) {
            case BIOME_TYPES.FOREST:
                return 0.8;
            case BIOME_TYPES.SWAMP:
                return 0.9;
            case BIOME_TYPES.MOUNTAIN:
                return 0.7;
            case BIOME_TYPES.PLAINS:
                return 0.5;
            case BIOME_TYPES.TUNDRA:
                return 0.4;
            case BIOME_TYPES.DESERT:
                return 0.1;
            default:
                return 0.5;
        }
    }
}

export class BiomeConverter {
    static getBiomeName(biomeType) {
        const names = {
            [BIOME_TYPES.PLAINS]: 'Plains',
            [BIOME_TYPES.DESERT]: 'Desert',
            [BIOME_TYPES.FOREST]: 'Forest',
            [BIOME_TYPES.MOUNTAIN]: 'Mountain',
            [BIOME_TYPES.TUNDRA]: 'Tundra',
            [BIOME_TYPES.SWAMP]: 'Swamp'
        };
        return names[biomeType] || 'Unknown';
    }

    static getBiomeColor(biomeType) {
        const colors = {
            [BIOME_TYPES.PLAINS]: 0x90ee90,
            [BIOME_TYPES.DESERT]: 0xf4a460,
            [BIOME_TYPES.FOREST]: 0x228b22,
            [BIOME_TYPES.MOUNTAIN]: 0x808080,
            [BIOME_TYPES.TUNDRA]: 0xe0ffff,
            [BIOME_TYPES.SWAMP]: 0x6b8e23
        };
        return colors[biomeType] || 0xffffff;
    }
}
