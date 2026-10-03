export class Biome {
    static PLAINS = 'plains';
    static MOUNTAINS = 'mountains';
    static DESERT = 'desert';
    static FOREST = 'forest';
    static OCEAN = 'ocean';

    static getBiomeAt(x, z, terrainGenerator) {
        const height = terrainGenerator.getHeightAt(x, z);
        const humidity = terrainGenerator.getHumidityAt(x, z);
        const temperature = terrainGenerator.getTemperatureAt(x, z);

        if (height < 50) {
            return Biome.OCEAN;
        } else if (height > 90) {
            return Biome.MOUNTAINS;
        } else if (humidity < 0.3) {
            return Biome.DESERT;
        } else if (humidity > 0.6) {
            return Biome.FOREST;
        } else {
            return Biome.PLAINS;
        }
    }

    static getBlockType(biome, height, baseHeight) {
        if (height < baseHeight - 2) {
            return 'stone';
        } else if (height < baseHeight - 1) {
            return 'dirt';
        } else if (height < baseHeight) {
            switch (biome) {
                case Biome.DESERT:
                    return 'sand';
                case Biome.OCEAN:
                    return 'sand';
                case Biome.MOUNTAINS:
                    return 'stone';
                default:
                    return 'grass';
            }
        }
        return 'air';
    }

    static getTreeChance(biome) {
        switch (biome) {
            case Biome.FOREST:
                return 0.1;
            case Biome.PLAINS:
                return 0.02;
            case Biome.MOUNTAINS:
                return 0.03;
            default:
                return 0;
        }
    }

    static shouldPlaceTreeAt(x, z, biome) {
        const hash = Math.abs(Math.sin(x * 73.1 + z * 97.3) * 10000) % 1000;
        const threshold = Biome.getTreeChance(biome) * 1000;
        return hash < threshold;
    }
}
