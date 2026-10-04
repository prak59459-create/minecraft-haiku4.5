import { PerlinNoise } from './noise.js';
import { BLOCK_TYPES, TERRAIN_SCALE, WATER_LEVEL } from './terrain.js';

export class BiomeGenerator {
  constructor(seed = 42) {
    this.seed = seed;
    this.temperatureNoise = new PerlinNoise(seed + 1);
    this.humidityNoise = new PerlinNoise(seed + 2);
    this.heightNoise = new PerlinNoise(seed);
  }

  getBiome(x, z) {
    const temp = this.temperatureNoise.turbulence(x / 300, z / 300, 0, 3);
    const humidity = this.humidityNoise.turbulence(x / 300, z / 300, 0, 3);

    if (temp < 0.3) return 'snow';
    if (temp < 0.5 && humidity < 0.3) return 'desert';
    if (temp < 0.5) return 'forest';
    if (temp < 0.7 && humidity > 0.6) return 'jungle';
    if (humidity < 0.3) return 'plains';
    return 'forest';
  }

  getHeight(x, z) {
    const baseHeight = this.heightNoise.turbulence(x / TERRAIN_SCALE, z / TERRAIN_SCALE, 0, 4);
    const biome = this.getBiome(x, z);

    let height = baseHeight * 60 + 32;

    if (biome === 'desert') {
      height = baseHeight * 40 + 35;
    } else if (biome === 'jungle') {
      height = baseHeight * 80 + 40;
    } else if (biome === 'snow') {
      height = baseHeight * 50 + 50;
    }

    return Math.floor(height);
  }

  getSurfaceBlock(x, y, z, height, biome) {
    if (y === height) {
      if (biome === 'desert') return BLOCK_TYPES.SAND;
      if (biome === 'snow') return BLOCK_TYPES.GRAVEL;
      return BLOCK_TYPES.GRASS;
    }
    if (y > height - 4) return BLOCK_TYPES.DIRT;
    return BLOCK_TYPES.STONE;
  }

  generateTrees(chunk, biome) {
    if (biome === 'desert' || biome === 'snow') return;

    for (let lx = 0; lx < 16; lx += 4) {
      for (let lz = 0; lz < 16; lz += 4) {
        const wx = chunk.x * 16 + lx;
        const wz = chunk.z * 16 + lz;
        const height = this.getHeight(wx, wz);

        if (Math.random() > 0.7) {
          this.placeTree(chunk, lx, height + 1, lz, biome);
        }
      }
    }
  }

  placeTree(chunk, x, y, z, biome) {
    const trunkHeight = 4 + Math.floor(Math.random() * 3);

    for (let i = 0; i < trunkHeight; i++) {
      chunk.setBlock(x, y + i, z, BLOCK_TYPES.WOOD);
    }

    const foliageHeight = 3 + Math.floor(Math.random() * 2);
    const foliageStart = y + trunkHeight - 2;

    for (let fy = 0; fy < foliageHeight; fy++) {
      const radius = 2 - Math.floor(fy / 2);
      for (let fx = -radius; fx <= radius; fx++) {
        for (let fz = -radius; fz <= radius; fz++) {
          if (fx * fx + fz * fz <= radius * radius && Math.random() > 0.1) {
            chunk.setBlock(x + fx, foliageStart + fy, z + fz, BLOCK_TYPES.LEAVES);
          }
        }
      }
    }
  }
}
