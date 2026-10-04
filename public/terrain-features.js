import { PerlinNoise } from './noise.js';
import { BLOCK_TYPES } from './terrain.js';

export class TerrainFeatures {
  constructor(seed = 42) {
    this.caveNoise = new PerlinNoise(seed + 10);
    this.oreNoise = new PerlinNoise(seed + 11);
    this.structureNoise = new PerlinNoise(seed + 12);
  }

  generateCaves(chunk, biomeGen) {
    for (let x = 0; x < 16; x++) {
      for (let z = 0; z < 16; z++) {
        const wx = chunk.x * 16 + x;
        const wz = chunk.z * 16 + z;

        for (let y = 10; y < 60; y++) {
          const caveValue = this.caveNoise.turbulence(wx / 50, y / 50, wz / 50, 3);
          if (caveValue > 0.5) {
            chunk.setBlock(x, y, z, BLOCK_TYPES.AIR);
          }
        }
      }
    }
  }

  generateOres(chunk) {
    const orePatterns = [
      { type: BLOCK_TYPES.COBBLESTONE, density: 0.3, minY: 20, maxY: 100 },
      { type: BLOCK_TYPES.GRAVEL, density: 0.15, minY: 10, maxY: 80 }
    ];

    for (let x = 0; x < 16; x++) {
      for (let z = 0; z < 16; z++) {
        const wx = chunk.x * 16 + x;
        const wz = chunk.z * 16 + z;

        for (const ore of orePatterns) {
          for (let y = ore.minY; y < ore.maxY; y++) {
            const oreValue = this.oreNoise.turbulence(wx / 100, y / 100, wz / 100, 2);
            if (oreValue > 1 - ore.density) {
              const currentBlock = chunk.getBlock(x, y, z);
              if (currentBlock === BLOCK_TYPES.STONE) {
                chunk.setBlock(x, y, z, ore.type);
              }
            }
          }
        }
      }
    }
  }

  generateStructures(chunk, biomeGen) {
    const chunkCenterX = chunk.x * 16 + 8;
    const chunkCenterZ = chunk.z * 16 + 8;

    const structureValue = this.structureNoise.turbulence(chunkCenterX / 200, chunkCenterZ / 200, 0, 2);

    if (structureValue > 0.7 && structureValue < 0.75) {
      this.generateSmallRuin(chunk, biomeGen);
    }
  }

  generateSmallRuin(chunk, biomeGen) {
    const height = biomeGen.getHeight(chunk.x * 16 + 8, chunk.z * 16 + 8);

    for (let x = 2; x < 14; x++) {
      for (let z = 2; z < 14; z++) {
        chunk.setBlock(x, height + 1, z, BLOCK_TYPES.STONE);

        if ((x === 2 || x === 13) || (z === 2 || z === 13)) {
          for (let y = height + 2; y < height + 4; y++) {
            chunk.setBlock(x, y, z, BLOCK_TYPES.COBBLESTONE);
          }
        }
      }
    }
  }

  addDecoration(chunk, biomeGen) {
    const biome = biomeGen.getBiome(chunk.x * 16 + 8, chunk.z * 16 + 8);

    if (biome === 'desert') {
      this.addDesertDecoration(chunk, biomeGen);
    } else if (biome === 'jungle') {
      this.addJungleDecoration(chunk, biomeGen);
    }
  }

  addDesertDecoration(chunk, biomeGen) {
    for (let x = 0; x < 16; x += 3) {
      for (let z = 0; z < 16; z += 3) {
        const wx = chunk.x * 16 + x;
        const wz = chunk.z * 16 + z;
        const height = biomeGen.getHeight(wx, wz);

        if (Math.random() > 0.7) {
          chunk.setBlock(x, height + 1, z, BLOCK_TYPES.SAND);
        }
      }
    }
  }

  addJungleDecoration(chunk, biomeGen) {
    for (let x = 1; x < 16; x += 4) {
      for (let z = 1; z < 16; z += 4) {
        const wx = chunk.x * 16 + x;
        const wz = chunk.z * 16 + z;
        const height = biomeGen.getHeight(wx, wz);

        if (Math.random() > 0.6) {
          for (let y = height + 1; y < height + 3; y++) {
            chunk.setBlock(x, y, z, BLOCK_TYPES.LEAVES);
          }
        }
      }
    }
  }
}
