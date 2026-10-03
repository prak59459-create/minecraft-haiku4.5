import { BLOCK_TYPES } from './blocks.js';

class SimplexNoise {
    constructor(seed = Math.random()) {
        this.seed = seed;
        this.perm = this.buildPermutation();
    }

    buildPermutation() {
        const p = [];
        for (let i = 0; i < 256; i++) {
            p[i] = i;
        }

        for (let i = 255; i > 0; i--) {
            const r = Math.floor((this.seed * 16807 % 2147483647) / 10) % (i + 1);
            const temp = p[i];
            p[i] = p[r];
            p[r] = temp;
        }

        return p.concat(p);
    }

    fade(t) {
        return t * t * t * (t * (t * 6 - 15) + 10);
    }

    lerp(t, a, b) {
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

        const p = this.perm;
        const a = p[xi] + yi;
        const aa = p[a] + zi;
        const ab = p[a + 1] + zi;
        const b = p[xi + 1] + yi;
        const ba = p[b] + zi;
        const bb = p[b + 1] + zi;

        const grad000 = this.grad(p[aa], xf, yf, zf);
        const grad100 = this.grad(p[ba], xf - 1, yf, zf);
        const grad010 = this.grad(p[ab], xf, yf - 1, zf);
        const grad110 = this.grad(p[bb], xf - 1, yf - 1, zf);
        const grad001 = this.grad(p[aa + 1], xf, yf, zf - 1);
        const grad101 = this.grad(p[ba + 1], xf - 1, yf, zf - 1);
        const grad011 = this.grad(p[ab + 1], xf, yf - 1, zf - 1);
        const grad111 = this.grad(p[bb + 1], xf - 1, yf - 1, zf - 1);

        const x1 = this.lerp(u, grad000, grad100);
        const x2 = this.lerp(u, grad010, grad110);
        const y1 = this.lerp(v, x1, x2);

        const x3 = this.lerp(u, grad001, grad101);
        const x4 = this.lerp(u, grad011, grad111);
        const y2 = this.lerp(v, x3, x4);

        return this.lerp(w, y1, y2);
    }
}

export class TerrainGenerator {
    constructor(seed = 12345) {
        this.mainNoise = new SimplexNoise(seed);
        this.detailNoise = new SimplexNoise(seed + 1000);
        this.seed = seed;
    }

    getHeight(x, z) {
        const scale1 = 0.008;
        const scale2 = 0.04;
        const scale3 = 0.1;

        const noise1 = this.mainNoise.noise(x * scale1, z * scale1) * 60;
        const noise2 = this.detailNoise.noise(x * scale2, z * scale2) * 15;
        const noise3 = this.detailNoise.noise(x * scale3, z * scale3) * 5;

        const height = 64 + noise1 + noise2 + noise3;
        return Math.floor(height);
    }

    getBlock(x, y, z) {
        const height = this.getHeight(x, z);

        if (y > height) {
            return BLOCK_TYPES.AIR;
        }

        if (y === height) {
            if (height > 65) return BLOCK_TYPES.GRASS;
            if (height > 62) return BLOCK_TYPES.SAND;
            return BLOCK_TYPES.GRASS;
        }

        if (y > height - 4) {
            if (height > 62) return BLOCK_TYPES.DIRT;
            return BLOCK_TYPES.SAND;
        }

        if (y > 60) {
            return Math.random() > 0.7 ? BLOCK_TYPES.GRAVEL : BLOCK_TYPES.STONE;
        }

        return BLOCK_TYPES.STONE;
    }

    generateTree(x, z, y, blocks) {
        if (y < 20 || y > 100) return;

        const trunkHeight = 4 + Math.floor(Math.random() * 3);

        for (let i = 0; i < trunkHeight; i++) {
            if (y + i < 256) {
                const key = `${x},${y + i},${z}`;
                blocks.set(key, BLOCK_TYPES.LOG);
            }
        }

        const leavesStart = y + trunkHeight - 2;
        for (let dy = 0; dy < 4; dy++) {
            const radius = dy < 3 ? 2 : 1;
            for (let dx = -radius; dx <= radius; dx++) {
                for (let dz = -radius; dz <= radius; dz++) {
                    if (dx * dx + dz * dz <= radius * radius) {
                        const key = `${x + dx},${leavesStart + dy},${z + dz}`;
                        if (!blocks.has(key)) {
                            blocks.set(key, BLOCK_TYPES.LEAVES);
                        }
                    }
                }
            }
        }
    }

    generateChunk(chunkX, chunkZ, chunkSize = 16) {
        const blocks = new Map();
        const baseX = chunkX * chunkSize;
        const baseZ = chunkZ * chunkSize;

        for (let lx = 0; lx < chunkSize; lx++) {
            for (let lz = 0; lz < chunkSize; lz++) {
                const x = baseX + lx;
                const z = baseZ + lz;

                const height = this.getHeight(x, z);

                for (let y = 0; y < 256; y++) {
                    const block = this.getBlock(x, y, z);
                    if (block !== BLOCK_TYPES.AIR) {
                        const key = `${x},${y},${z}`;
                        blocks.set(key, block);
                    }
                }

                if (height > 65 && Math.random() > 0.95) {
                    this.generateTree(x, height + 1, z, blocks);
                }
            }
        }

        return blocks;
    }
}
