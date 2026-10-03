import { SimplexNoise } from 'simplex-noise';

export class TerrainGenerator {
    constructor(seed) {
        // Use seed to initialize multiple noise generators for layered terrain
        const rand = this.seededRandom(seed);
        this.noise1 = new SimplexNoise(() => rand());
        this.noise2 = new SimplexNoise(() => rand());
        this.noise3 = new SimplexNoise(() => rand());
    }

    seededRandom(seed) {
        return function() {
            seed = (seed * 9301 + 49297) % 233280;
            return seed / 233280;
        };
    }

    getHeight(x, z) {
        const scale1 = 0.005;
        const scale2 = 0.05;
        const scale3 = 0.1;

        const n1 = this.noise1.noise2D(x * scale1, z * scale1) * 0.5 + 0.5;
        const n2 = this.noise2.noise2D(x * scale2, z * scale2) * 0.25 + 0.25;
        const n3 = this.noise3.noise2D(x * scale3, z * scale3) * 0.25 + 0.25;

        let height = n1 * 0.6 + n2 * 0.3 + n3 * 0.1;
        height = Math.pow(height, 0.8);

        return Math.max(0.1, Math.min(0.9, height));
    }

    isWater(x, z, height) {
        return height < 0.35;
    }

    isMountain(x, z, height) {
        return height > 0.7;
    }
}
