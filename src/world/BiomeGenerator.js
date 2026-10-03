import { BlockType } from './BlockType.js';

export class BiomeGenerator {
    constructor(terrainGenerator) {
        this.terrainGenerator = terrainGenerator;
    }

    getBiome(x, z) {
        const temp = this.terrainGenerator.noise2.noise2D(x * 0.01, z * 0.01) * 0.5 + 0.5;
        const humidity = this.terrainGenerator.noise3.noise2D(x * 0.005, z * 0.005) * 0.5 + 0.5;

        if (temp > 0.7) return 'desert';
        if (temp < 0.3) return 'snow';
        if (humidity > 0.6) return 'jungle';
        if (humidity < 0.3) return 'plains';
        return 'forest';
    }

    getSurfaceBlock(x, z, height) {
        const biome = this.getBiome(x, z);

        switch (biome) {
            case 'desert':
                return BlockType.SAND;
            case 'snow':
                return BlockType.GRAVEL;
            case 'jungle':
                return BlockType.GRASS;
            case 'forest':
                return BlockType.GRASS;
            default:
                return BlockType.GRASS;
        }
    }

    getSubsurfaceBlocks(x, z, height, terrainHeight) {
        const biome = this.getBiome(x, z);
        const blocks = [];

        const dirtDepth = biome === 'desert' ? 1 : biome === 'jungle' ? 4 : 3;

        for (let i = 0; i < dirtDepth && terrainHeight - i - 1 >= 0; i++) {
            blocks.push({
                y: terrainHeight - i - 1,
                type: biome === 'desert' ? BlockType.SAND : BlockType.DIRT
            });
        }

        return blocks;
    }

    shouldGenerateTree(x, z) {
        const biome = this.getBiome(x, z);
        const density = { desert: 0, snow: 0, jungle: 0.3, plains: 0.05, forest: 0.2 };
        const rand = Math.abs(Math.sin(x * 12.9898 + z * 78.233) * 43758.5453) % 1;
        return rand < (density[biome] || 0.1);
    }

    getOreDistribution(y, blockType) {
        if (blockType !== BlockType.STONE) return BlockType.STONE;

        const rand = Math.random();
        if (y > 50 && rand < 0.02) return BlockType.COAL_ORE;
        if (y > 30 && rand < 0.01) return BlockType.COAL_ORE;

        return BlockType.STONE;
    }
}
