class TerrainGenerator {
    constructor(seed) {
        this.seed = seed;
        this.noiseGen = new SimplexNoise(() => Math.random());
    }

    getHeight(x, z) {
        let height = 64;

        const scale1 = this.noiseGen.noise(x * 0.01, z * 0.01) * 32;
        const scale2 = this.noiseGen.noise(x * 0.05, z * 0.05) * 16;
        const scale3 = this.noiseGen.noise(x * 0.1, z * 0.1) * 8;
        const scale4 = this.noiseGen.noise(x * 0.2, z * 0.2) * 4;

        height += scale1 + scale2 + scale3 + scale4;

        return Math.floor(Math.max(50, Math.min(120, height)));
    }

    getTerrainType(x, z, height) {
        const moisture = this.noiseGen.noise(x * 0.05, z * 0.05);
        const temperature = this.noiseGen.noise(x * 0.03, z * 0.03);

        if (height < 62) return 'water';
        if (height > 100) return 'mountain';
        if (moisture > 0.3) return 'forest';
        if (temperature < -0.2) return 'plains';
        return 'grass';
    }

    getCaveNoise(x, y, z) {
        const caveNoise = this.noiseGen.noise(x * 0.05, y * 0.05, z * 0.05);
        return caveNoise;
    }

    isCave(x, y, z) {
        const caveNoise = this.getCaveNoise(x, y, z);
        return y > 10 && y < 50 && caveNoise > 0.5;
    }

    getOreProbability(x, y, z, blockHeight) {
        const depth = blockHeight - y;
        if (depth < 0) return 0;

        if (depth > 50) return 0.02;
        if (depth > 30) return 0.01;
        if (depth > 15) return 0.005;
        return 0;
    }

    generateOre(x, y, z, blockHeight) {
        const probability = this.getOreProbability(x, y, z, blockHeight);
        const rand = Math.random();

        if (rand < probability * 0.8) return 10;
        if (rand < probability * 0.95) return 11;

        return 1;
    }
}

class StructureGenerator {
    constructor(seed) {
        this.seed = seed;
        this.random = new Math.seedrandom ? new Math.seedrandom(seed) : Math.random;
    }

    canPlaceTree(x, z, height, terrain) {
        return terrain === 'forest' && height > 65 && height < 110;
    }

    generateTree(chunkX, chunkZ, lx, lz, height) {
        const trees = [];

        const treeNoise = new SimplexNoise(() => Math.random()).noise(lx * 0.3, lz * 0.3);
        if (treeNoise > 0.6) {
            trees.push({
                x: lx,
                z: lz,
                height: height,
                trunkHeight: 4 + Math.floor(Math.random() * 3),
                foliageRadius: 3
            });
        }

        return trees;
    }

    generateFeatures(chunk, chunkX, chunkZ, terrain) {
        const features = [];

        for (let lx = 0; lx < CHUNK_SIZE; lx++) {
            for (let lz = 0; lz < CHUNK_SIZE; lz++) {
                const x = chunkX * CHUNK_SIZE + lx;
                const z = chunkZ * CHUNK_SIZE + lz;

                const height = chunk.getTerrainHeight(x, z, new SimplexNoise(() => Math.random()));

                if (terrain === 'forest' && Math.random() < 0.05) {
                    features.push({
                        type: 'tree',
                        x: lx,
                        z: lz,
                        height: height
                    });
                }
            }
        }

        return features;
    }
}
