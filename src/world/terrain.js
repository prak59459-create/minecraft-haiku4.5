export class TerrainGenerator {
    constructor() {
        this.scale = 50;
        this.baseHeight = 64;
        this.seed = Math.random() * 10000;
        this.heightCache = new Map();
        this.humidityCache = new Map();
        this.temperatureCache = new Map();
    }

    getHeightAt(x, z) {
        const cacheKey = `${x},${z}`;
        if (this.heightCache.has(cacheKey)) {
            return this.heightCache.get(cacheKey);
        }

        const noise1 = this.perlinNoise(x * 0.01, z * 0.01) * 0.5;
        const noise2 = this.perlinNoise(x * 0.005, z * 0.005) * 0.3;
        const noise3 = this.perlinNoise(x * 0.02, z * 0.02) * 0.2;

        const height = Math.floor(this.baseHeight + (noise1 + noise2 + noise3) * this.scale);
        this.heightCache.set(cacheKey, height);

        if (this.heightCache.size > 10000) {
            const firstKey = this.heightCache.keys().next().value;
            this.heightCache.delete(firstKey);
        }

        return height;
    }

    perlinNoise(x, y) {
        const xi = Math.floor(x);
        const yi = Math.floor(y);

        const xf = x - xi;
        const yf = y - yi;

        const n00 = this.dotGridGradient(xi, yi, x, y);
        const n10 = this.dotGridGradient(xi + 1, yi, x, y);
        const n01 = this.dotGridGradient(xi, yi + 1, x, y);
        const n11 = this.dotGridGradient(xi + 1, yi + 1, x, y);

        const u = this.fade(xf);
        const v = this.fade(yf);

        const nx0 = this.lerp(n00, n10, u);
        const nx1 = this.lerp(n01, n11, u);
        return this.lerp(nx0, nx1, v);
    }

    dotGridGradient(ix, iy, x, y) {
        const gradient = this.pseudoRandom(ix, iy);
        const dx = x - ix;
        const dy = y - iy;
        return dx * Math.cos(gradient) + dy * Math.sin(gradient);
    }

    pseudoRandom(x, y) {
        let n = Math.sin(x * 12.9898 + y * 78.233 + this.seed) * 43758.5453;
        return (n - Math.floor(n)) * Math.PI * 2;
    }

    fade(t) {
        return t * t * t * (t * (t * 6 - 15) + 10);
    }

    lerp(a, b, t) {
        return a + (b - a) * t;
    }

    getHumidityAt(x, z) {
        const cacheKey = `${x},${z}`;
        if (this.humidityCache.has(cacheKey)) {
            return this.humidityCache.get(cacheKey);
        }

        const humidity = this.perlinNoise(x * 0.01 + 1000, z * 0.01 + 1000);
        const normalized = (humidity + 1) / 2;
        this.humidityCache.set(cacheKey, normalized);

        if (this.humidityCache.size > 5000) {
            const firstKey = this.humidityCache.keys().next().value;
            this.humidityCache.delete(firstKey);
        }

        return normalized;
    }

    getTemperatureAt(x, z) {
        const cacheKey = `${x},${z}`;
        if (this.temperatureCache.has(cacheKey)) {
            return this.temperatureCache.get(cacheKey);
        }

        const temp = this.perlinNoise(x * 0.01 + 2000, z * 0.01 + 2000);
        const normalized = (temp + 1) / 2;
        this.temperatureCache.set(cacheKey, normalized);

        if (this.temperatureCache.size > 5000) {
            const firstKey = this.temperatureCache.keys().next().value;
            this.temperatureCache.delete(firstKey);
        }

        return normalized;
    }
}
