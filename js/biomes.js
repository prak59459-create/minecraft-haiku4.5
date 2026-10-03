class BiomeGenerator {
    constructor(noise) {
        this.noise = noise;
        this.biomes = {
            desert: { name: 'Desert', heightOffset: 0, moisture: -1 },
            plains: { name: 'Plains', heightOffset: 5, moisture: 0 },
            forest: { name: 'Forest', heightOffset: 15, moisture: 0.5 },
            mountain: { name: 'Mountain', heightOffset: 40, moisture: -0.5 },
            ocean: { name: 'Ocean', heightOffset: -20, moisture: 1 }
        };
    }

    getBiomeAtPosition(x, z) {
        const temperatureNoise = this.noise.getValue(x * 0.002, z * 0.002);
        const moistureNoise = this.noise.getValue(x * 0.0015, z * 0.0015);
        const elevationNoise = this.noise.getFractal(x * 0.05, z * 0.05, 2);

        if (elevationNoise < -0.3) return 'ocean';
        if (elevationNoise > 0.5) return 'mountain';
        if (moistureNoise > 0.4) return 'forest';
        if (temperatureNoise > 0.3) return 'desert';
        return 'plains';
    }

    getBlockForBiome(x, y, z, height, biome) {
        const biomeData = this.biomes[biome];
        const biomeHeight = height + biomeData.heightOffset;

        if (y < 0) return BLOCK_TYPES.STONE;
        if (y > biomeHeight + 4) return BLOCK_TYPES.AIR;

        const stoneHeight = biomeHeight - 4;
        const dirtHeight = biomeHeight;

        if (y <= stoneHeight) {
            if (y < 4) return BLOCK_TYPES.STONE;
            if (this.noise.getValue(x * 0.1, y * 0.1, z * 0.1) > 0.6) {
                if (Math.random() > 0.8) return BLOCK_TYPES.COAL;
                return BLOCK_TYPES.STONE;
            }
            return BLOCK_TYPES.STONE;
        } else if (y <= dirtHeight) {
            return BLOCK_TYPES.DIRT;
        } else if (y === dirtHeight + 1) {
            if (biome === 'desert') return BLOCK_TYPES.SAND;
            if (biome === 'mountain') return BLOCK_TYPES.STONE;
            if (biome === 'ocean') return BLOCK_TYPES.SAND;
            return BLOCK_TYPES.GRASS;
        }

        return BLOCK_TYPES.AIR;
    }

    generateTreeAt(world, x, z, height) {
        const noise = this.noise.getValue(x * 0.1, z * 0.1);
        if (noise < 0.3) return;

        const treeHeight = 4 + Math.floor(this.noise.getValue(x * 0.05, z * 0.05) * 3);
        const baseY = Math.floor(height) + 2;

        for (let y = baseY; y < baseY + treeHeight; y++) {
            world.setBlock(x, y, z, BLOCK_TYPES.WOOD);
        }

        const leavesRadius = 2;
        for (let dx = -leavesRadius; dx <= leavesRadius; dx++) {
            for (let dz = -leavesRadius; dz <= leavesRadius; dz++) {
                if (dx * dx + dz * dz <= leavesRadius * leavesRadius) {
                    const leafY = baseY + treeHeight - 1;
                    if (world.getBlock(x + dx, leafY, z + dz) === BLOCK_TYPES.AIR) {
                        world.setBlock(x + dx, leafY, z + dz, BLOCK_TYPES.LEAVES);
                    }
                }
            }
        }
    }

    getTerrainColorAt(x, z) {
        const biome = this.getBiomeAtPosition(x, z);
        const colors = {
            desert: 0xFFA500,
            plains: 0x90EE90,
            forest: 0x228B22,
            mountain: 0x808080,
            ocean: 0x4488FF
        };
        return colors[biome] || 0x90EE90;
    }
}
