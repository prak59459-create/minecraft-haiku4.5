import { SimplexNoise } from 'simplex-noise';

export class TerrainGenerator {
    constructor() {
        this.noise = new SimplexNoise(() => Math.random());
        this.seed = Math.random();
    }

    getTerrainHeight(x, z) {
        const scale1 = 0.02;
        const height1 = this.noise.noise2D(x * scale1, z * scale1) * 30;

        const scale2 = 0.08;
        const height2 = this.noise.noise2D(x * scale2, z * scale2) * 15;

        const scale3 = 0.15;
        const height3 = this.noise.noise2D(x * scale3, z * scale3) * 8;

        const totalHeight = 64 + height1 + height2 + height3;
        return Math.floor(Math.max(20, Math.min(100, totalHeight)));
    }

    getBiome(x, z) {
        const moistureScale = 0.03;
        const temperatureScale = 0.02;

        const moisture = this.noise.noise2D(x * moistureScale, z * moistureScale);
        const temperature = this.noise.noise2D(x * temperatureScale + 1000, z * temperatureScale + 1000);

        if (moisture > 0.5) return 'forest';
        if (temperature < -0.3) return 'cold';
        if (temperature > 0.3) return 'desert';
        return 'plains';
    }

    getOreForHeight(y, height) {
        const heightFraction = y / height;

        if (y < 10) return 3;

        if (Math.random() < 0.02 && y < height - 2) {
            return 3;
        }

        return 3;
    }

    hasTree(x, z, height) {
        const treeScale = 0.02;
        const treeNoise = this.noise.noise2D(x * treeScale, z * treeScale);

        const biome = this.getBiome(x, z);

        let treeChance = 0;
        if (biome === 'forest') treeChance = 0.15;
        else if (biome === 'plains') treeChance = 0.03;

        return treeNoise > 0.5 - treeChance;
    }

    getBlockAtPosition(x, y, z, height) {
        if (y === 0) return 3;

        if (y < height) {
            const depthFromSurface = height - y;

            if (depthFromSurface === 0) {
                return 2;
            } else if (depthFromSurface <= 3) {
                return 1;
            } else {
                return 3;
            }
        } else if (y === height && this.hasTree(x, z, height)) {
            return 4;
        } else if (y > height && y < height + 4 && this.hasTree(x, z, height)) {
            return 5;
        } else if (y === 40 && height <= 40) {
            return 6;
        }

        return 0;
    }
}
