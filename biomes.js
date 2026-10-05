import { BLOCKS } from './blocks.js';

export class BiomeGenerator {
    constructor(perlinNoise) {
        this.perlinNoise = perlinNoise;
    }

    getBiome(x, z) {
        if (!this.perlinNoise) return 'grass';

        const temperature = this.getTemperature(x, z);
        const humidity = this.getHumidity(x, z);

        if (temperature < -0.2) return 'snow';
        if (humidity > 0.6) return 'forest';
        if (humidity < -0.3) return 'desert';
        if (temperature > 0.3 && humidity > 0.1) return 'jungle';
        return 'grass';
    }

    getTemperature(x, z) {
        return this.perlinNoise.noise2D(x * 0.001, z * 0.001);
    }

    getHumidity(x, z) {
        return this.perlinNoise.noise2D(x * 0.002 + 1000, z * 0.002 + 1000);
    }

    getTerrainHeight(x, z, biome) {
        if (!this.perlinNoise) return 60;

        let height = 65;
        height += this.perlinNoise.noise2D(x * 0.005, z * 0.005) * 30;
        height += this.perlinNoise.noise2D(x * 0.02, z * 0.02) * 15;
        height += this.perlinNoise.noise2D(x * 0.05, z * 0.05) * 8;
        height += this.perlinNoise.noise2D(x * 0.1, z * 0.1) * 4;

        if (biome === 'snow') height *= 1.1;
        if (biome === 'desert') height = Math.max(60, height * 0.8);
        if (biome === 'forest') height *= 0.95;
        if (biome === 'jungle') height *= 1.05;

        return Math.max(20, Math.min(160, Math.floor(height)));
    }

    getSurfaceBlock(biome) {
        switch (biome) {
            case 'sand':
            case 'desert':
                return BLOCKS.SAND;
            case 'snow':
                return BLOCKS.GRASS;
            case 'forest':
            case 'jungle':
                return BLOCKS.GRASS;
            default:
                return BLOCKS.GRASS;
        }
    }

    getSubsurfaceBlock(biome) {
        return biome === 'sand' || biome === 'desert' ? BLOCKS.SAND : BLOCKS.DIRT;
    }

    shouldGenerateTree(biome, x, z) {
        if (!this.perlinNoise) return false;

        const treeChance = this.perlinNoise.noise2D(x * 0.02, z * 0.02);

        switch (biome) {
            case 'forest':
                return treeChance > 0.3;
            case 'jungle':
                return treeChance > -0.1;
            case 'grass':
                return treeChance > 0.5;
            default:
                return false;
        }
    }
}
