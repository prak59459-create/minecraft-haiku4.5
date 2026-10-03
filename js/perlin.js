class NoiseGenerator {
    constructor(seed = Math.random() * 65536) {
        this.simplex = new SimplexNoise(seed);
    }

    getValue(x, y, z = 0) {
        return this.simplex.noise3d(x, y, z);
    }

    getFractal(x, y, octaves = 4, persistence = 0.5, lacunarity = 2.0) {
        let value = 0;
        let amplitude = 1;
        let maxValue = 0;
        let freq = 1;

        for (let i = 0; i < octaves; i++) {
            value += this.getValue(x * freq, y * freq) * amplitude;
            maxValue += amplitude;
            amplitude *= persistence;
            freq *= lacunarity;
        }

        return value / maxValue;
    }

    getTerrainHeight(x, z, scale = 0.05, octaves = 4) {
        const noise = this.getFractal(x * scale, z * scale, octaves);
        const height = (noise + 1) * 0.5;
        return Math.floor(height * 64) + 32;
    }

    getBlockType(x, y, z, height) {
        if (y < 0) return BLOCK_TYPES.STONE;
        if (y === 0) return BLOCK_TYPES.BEDROCK;
        if (y > height + 4) return BLOCK_TYPES.AIR;

        const stoneHeight = height - 4;
        const dirtHeight = height;

        if (y <= stoneHeight) {
            if (y < 4) return BLOCK_TYPES.STONE;
            if (this.getValue(x * 0.1, y * 0.1, z * 0.1) > 0.6) {
                if (Math.random() > 0.8) return BLOCK_TYPES.COAL;
                return BLOCK_TYPES.STONE;
            }
            return BLOCK_TYPES.STONE;
        } else if (y <= dirtHeight) {
            return BLOCK_TYPES.DIRT;
        } else if (y === dirtHeight + 1) {
            const moistureNoise = this.getValue(x * 0.05, z * 0.05);
            if (moistureNoise > 0.3) return BLOCK_TYPES.GRASS;
            if (moistureNoise > -0.2) return BLOCK_TYPES.SAND;
            return BLOCK_TYPES.GRAVEL;
        }

        return BLOCK_TYPES.AIR;
    }
}
