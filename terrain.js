class SimplexNoise {
    constructor(seed = Math.random()) {
        this.seed = seed;
        this.p = this.buildPermutationTable(seed);
    }

    buildPermutationTable(seed) {
        const p = [];
        for (let i = 0; i < 256; i++) {
            p[i] = i;
        }
        for (let i = 255; i > 0; i--) {
            const j = Math.floor((seed * 73856093 ^ (i * 19349663)) * 1000000) % (i + 1);
            [p[i], p[j]] = [p[j], p[i]];
        }
        return p.concat(p);
    }

    fade(t) {
        return t * t * t * (t * (t * 6 - 15) + 10);
    }

    lerp(a, b, t) {
        return a + t * (b - a);
    }

    grad(hash, x, y, z) {
        const h = hash & 15;
        const u = h < 8 ? x : y;
        const v = h < 8 ? y : z;
        return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
    }

    noise(x, y, z = 0) {
        const xi = Math.floor(x) & 255;
        const yi = Math.floor(y) & 255;
        const zi = Math.floor(z) & 255;

        const xf = x - Math.floor(x);
        const yf = y - Math.floor(y);
        const zf = z - Math.floor(z);

        const u = this.fade(xf);
        const v = this.fade(yf);
        const w = this.fade(zf);

        const aa = this.p[this.p[xi] + yi];
        const ab = this.p[this.p[xi] + yi + 1];
        const ba = this.p[this.p[xi + 1] + yi];
        const bb = this.p[this.p[xi + 1] + yi + 1];

        const p0 = this.grad(this.p[aa + zi], xf, yf, zf);
        const p1 = this.grad(this.p[ba + zi], xf - 1, yf, zf);
        const p2 = this.grad(this.p[ab + zi], xf, yf - 1, zf);
        const p3 = this.grad(this.p[bb + zi], xf - 1, yf - 1, zf);

        const x1 = this.lerp(p0, p1, u);
        const x2 = this.lerp(p2, p3, u);
        return this.lerp(x1, x2, v);
    }
}

class TerrainGenerator {
    constructor(seed = 12345) {
        this.seed = seed;
        this.noise = new SimplexNoise(seed);
        this.chunkSize = 16;
        this.chunkHeight = 256;
    }

    getHeight(x, z) {
        let height = 0;
        let amplitude = 1;
        let frequency = 1;
        let maxValue = 0;

        for (let i = 0; i < 6; i++) {
            height += this.noise.noise(x * frequency * 0.01, z * frequency * 0.01, i) * amplitude;
            maxValue += amplitude;
            amplitude *= 0.5;
            frequency *= 2;
        }

        height = height / maxValue;
        let finalHeight = 64;

        if (height < -0.3) {
            finalHeight = 55;
        } else if (height < 0) {
            finalHeight = 60 + (height + 0.3) / 0.3 * 4;
        } else if (height < 0.3) {
            finalHeight = 64 + height / 0.3 * 16;
        } else if (height < 0.6) {
            finalHeight = 80 + (height - 0.3) / 0.3 * 20;
        } else {
            finalHeight = 100 + (height - 0.6) / 0.4 * 60;
        }

        return Math.floor(Math.max(0, Math.min(this.chunkHeight, finalHeight)));
    }

    getTerrainType(x, z, height) {
        let type = 'plains';
        if (height > 120) type = 'mountain';
        else if (height > 80) type = 'hill';
        else if (height < 62) type = 'beach';
        return type;
    }

    generateChunk(chunkX, chunkZ) {
        const data = new Uint16Array(this.chunkSize * this.chunkHeight * this.chunkSize);
        const worldX = chunkX * this.chunkSize;
        const worldZ = chunkZ * this.chunkSize;

        for (let x = 0; x < this.chunkSize; x++) {
            for (let z = 0; z < this.chunkSize; z++) {
                const height = this.getHeight(worldX + x, worldZ + z);
                const terrainType = this.getTerrainType(worldX + x, worldZ + z, height);

                for (let y = 0; y < this.chunkHeight; y++) {
                    const idx = x + y * this.chunkSize + z * this.chunkSize * this.chunkHeight;

                    const caveNoise = this.noise.noise(
                        (worldX + x) * 0.05,
                        y * 0.05,
                        (worldZ + z) * 0.05
                    );

                    if (y < 10) {
                        data[idx] = BLOCKS.STONE.id;
                    } else if (caveNoise > 0.5 && y < height - 10) {
                        data[idx] = BLOCKS.AIR.id;
                    } else if (y < height - 4) {
                        data[idx] = BLOCKS.STONE.id;
                    } else if (y < height - 1) {
                        if (terrainType === 'beach') {
                            data[idx] = BLOCKS.SAND.id;
                        } else if (terrainType === 'mountain' && y < height - 2) {
                            data[idx] = BLOCKS.STONE.id;
                        } else {
                            data[idx] = BLOCKS.DIRT.id;
                        }
                    } else if (y === height - 1) {
                        if (terrainType === 'beach') {
                            data[idx] = BLOCKS.SAND.id;
                        } else if (terrainType === 'mountain') {
                            data[idx] = BLOCKS.STONE.id;
                        } else {
                            data[idx] = BLOCKS.GRASS.id;
                        }
                    } else if (y < 62) {
                        data[idx] = BLOCKS.WATER.id;
                    } else {
                        data[idx] = BLOCKS.AIR.id;
                    }
                }

                if (height > 65 && height < 100 && Math.random() < 0.04) {
                    this.generateTree(data, x, Math.floor(height), z, worldX, worldZ);
                }
            }
        }

        return data;
    }

    generateTree(data, localX, baseY, localZ, chunkX, chunkZ) {
        const height = 4 + Math.floor(Math.random() * 3);
        for (let y = baseY + 1; y < baseY + height; y++) {
            if (y < 256) {
                const idx = localX + y * this.chunkSize + localZ * this.chunkSize * this.chunkHeight;
                data[idx] = BLOCKS.WOOD.id;
            }
        }
        for (let dx = -2; dx <= 2; dx++) {
            for (let dz = -2; dz <= 2; dz++) {
                for (let dy = baseY + height - 3; dy < baseY + height; dy++) {
                    if (dy < 256 && Math.abs(dx) + Math.abs(dz) <= 3) {
                        const localX2 = (localX + dx + this.chunkSize) % this.chunkSize;
                        const localZ2 = (localZ + dz + this.chunkSize) % this.chunkSize;
                        const idx = localX2 + dy * this.chunkSize + localZ2 * this.chunkSize * this.chunkHeight;
                        if (data[idx] === BLOCKS.AIR.id) {
                            data[idx] = BLOCKS.LEAVES.id;
                        }
                    }
                }
            }
        }
    }
}

class World {
    constructor() {
        this.chunks = new Map();
        this.modifiedBlocks = new Map();
        this.generator = new TerrainGenerator();
        this.chunkSize = 16;
        this.viewDistance = 6;
    }

    getChunk(chunkX, chunkZ) {
        const key = `${chunkX},${chunkZ}`;
        if (!this.chunks.has(key)) {
            this.chunks.set(key, this.generator.generateChunk(chunkX, chunkZ));
        }
        return this.chunks.get(key);
    }

    getBlock(x, y, z) {
        if (y < 0 || y >= 256) return BLOCKS.AIR.id;
        const chunkX = Math.floor(x / this.chunkSize);
        const chunkZ = Math.floor(z / this.chunkSize);
        const localX = ((x % this.chunkSize) + this.chunkSize) % this.chunkSize;
        const localZ = ((z % this.chunkSize) + this.chunkSize) % this.chunkSize;

        const chunk = this.getChunk(chunkX, chunkZ);
        const idx = localX + y * this.chunkSize + localZ * this.chunkSize * 256;
        return chunk[idx] || BLOCKS.AIR.id;
    }

    setBlock(x, y, z, blockId) {
        if (y < 0 || y >= 256) return;
        const chunkX = Math.floor(x / this.chunkSize);
        const chunkZ = Math.floor(z / this.chunkSize);
        const localX = ((x % this.chunkSize) + this.chunkSize) % this.chunkSize;
        const localZ = ((z % this.chunkSize) + this.chunkSize) % this.chunkSize;

        const chunk = this.getChunk(chunkX, chunkZ);
        const idx = localX + y * this.chunkSize + localZ * this.chunkSize * 256;
        chunk[idx] = blockId;

        const key = `${chunkX},${chunkZ}`;
        this.modifiedBlocks.set(key, true);
    }

    isChunkModified(chunkX, chunkZ) {
        const key = `${chunkX},${chunkZ}`;
        return this.modifiedBlocks.has(key);
    }

    clearChunkModified(chunkX, chunkZ) {
        const key = `${chunkX},${chunkZ}`;
        this.modifiedBlocks.delete(key);
    }

    getChunksInView(playerX, playerZ) {
        const chunks = [];
        const chunkX = Math.floor(playerX / this.chunkSize);
        const chunkZ = Math.floor(playerZ / this.chunkSize);

        for (let x = -this.viewDistance; x <= this.viewDistance; x++) {
            for (let z = -this.viewDistance; z <= this.viewDistance; z++) {
                chunks.push({ x: chunkX + x, z: chunkZ + z });
            }
        }
        return chunks;
    }
}
