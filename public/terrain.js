import * as THREE from 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.module.js';
import { PerlinNoise } from './noise.js';
import { BiomeGenerator } from './biomes.js';

export const BLOCK_TYPES = {
  AIR: 0,
  GRASS: 1,
  DIRT: 2,
  STONE: 3,
  WOOD: 4,
  LEAVES: 5,
  WATER: 6,
  SAND: 7,
  GRAVEL: 8,
  COBBLESTONE: 9
};

export const CHUNK_SIZE = 16;
export const CHUNK_HEIGHT = 128;
export const TERRAIN_SCALE = 80;
export const WATER_LEVEL = 32;

const BLOCK_COLORS = {
  [BLOCK_TYPES.GRASS]: 0x2d5016,
  [BLOCK_TYPES.DIRT]: 0x8b6f47,
  [BLOCK_TYPES.STONE]: 0x808080,
  [BLOCK_TYPES.WOOD]: 0x6b4423,
  [BLOCK_TYPES.LEAVES]: 0x2d7a1f,
  [BLOCK_TYPES.WATER]: 0x3366cc,
  [BLOCK_TYPES.SAND]: 0xdbbc7a,
  [BLOCK_TYPES.GRAVEL]: 0x999999,
  [BLOCK_TYPES.COBBLESTONE]: 0x707070
};

export class Chunk {
  constructor(x, z, biomeGen) {
    this.x = x;
    this.z = z;
    this.blocks = new Uint8Array(CHUNK_SIZE * CHUNK_HEIGHT * CHUNK_SIZE);
    this.mesh = null;
    this.biomeGen = biomeGen;
    this.generate();
  }

  generate() {
    for (let lx = 0; lx < CHUNK_SIZE; lx++) {
      for (let lz = 0; lz < CHUNK_SIZE; lz++) {
        const wx = this.x * CHUNK_SIZE + lx;
        const wz = this.z * CHUNK_SIZE + lz;
        const height = this.biomeGen.getHeight(wx, wz);
        const biome = this.biomeGen.getBiome(wx, wz);

        for (let y = 0; y < CHUNK_HEIGHT; y++) {
          if (y <= height) {
            const block = this.biomeGen.getSurfaceBlock(wx, y, wz, height, biome);
            this.setBlock(lx, y, lz, block);
          } else if (y < WATER_LEVEL) {
            this.setBlock(lx, y, lz, BLOCK_TYPES.WATER);
          }
        }
      }
    }

    this.biomeGen.generateTrees(this, this.biomeGen.getBiome(this.x * CHUNK_SIZE + 8, this.z * CHUNK_SIZE + 8));
  }

  setBlock(x, y, z, type) {
    if (x >= 0 && x < CHUNK_SIZE && y >= 0 && y < CHUNK_HEIGHT && z >= 0 && z < CHUNK_SIZE) {
      this.blocks[x + y * CHUNK_SIZE + z * CHUNK_SIZE * CHUNK_HEIGHT] = type;
    }
  }

  getBlock(x, y, z) {
    if (x >= 0 && x < CHUNK_SIZE && y >= 0 && y < CHUNK_HEIGHT && z >= 0 && z < CHUNK_SIZE) {
      return this.blocks[x + y * CHUNK_SIZE + z * CHUNK_SIZE * CHUNK_HEIGHT];
    }
    return BLOCK_TYPES.AIR;
  }

  buildMesh() {
    const geometry = new THREE.BufferGeometry();
    const vertices = [];
    const colors = [];
    const indices = [];

    let vertexIndex = 0;

    for (let x = 0; x < CHUNK_SIZE; x++) {
      for (let y = 0; y < CHUNK_HEIGHT; y++) {
        for (let z = 0; z < CHUNK_SIZE; z++) {
          const block = this.getBlock(x, y, z);
          if (block === BLOCK_TYPES.AIR) continue;

          const color = new THREE.Color(BLOCK_COLORS[block] || 0x888888);

          const faces = [
            { normal: [1, 0, 0], vertices: [[1, 0, 0], [1, 1, 0], [1, 1, 1], [1, 0, 1]], check: () => !this.getBlock(x + 1, y, z) },
            { normal: [-1, 0, 0], vertices: [[0, 0, 0], [0, 0, 1], [0, 1, 1], [0, 1, 0]], check: () => !this.getBlock(x - 1, y, z) },
            { normal: [0, 1, 0], vertices: [[0, 1, 0], [0, 1, 1], [1, 1, 1], [1, 1, 0]], check: () => !this.getBlock(x, y + 1, z) },
            { normal: [0, -1, 0], vertices: [[0, 0, 0], [1, 0, 0], [1, 0, 1], [0, 0, 1]], check: () => !this.getBlock(x, y - 1, z) },
            { normal: [0, 0, 1], vertices: [[0, 0, 1], [1, 0, 1], [1, 1, 1], [0, 1, 1]], check: () => !this.getBlock(x, y, z + 1) },
            { normal: [0, 0, -1], vertices: [[0, 0, 0], [0, 1, 0], [1, 1, 0], [1, 0, 0]], check: () => !this.getBlock(x, y, z - 1) }
          ];

          for (const face of faces) {
            if (face.check()) {
              for (const [vx, vy, vz] of face.vertices) {
                vertices.push(x + vx, y + vy, z + vz);
                colors.push(color.r, color.g, color.b);
              }
              indices.push(vertexIndex, vertexIndex + 1, vertexIndex + 2);
              indices.push(vertexIndex, vertexIndex + 2, vertexIndex + 3);
              vertexIndex += 4;
            }
          }
        }
      }
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(vertices), 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array(colors), 3));
    geometry.setIndex(new THREE.BufferAttribute(new Uint32Array(indices), 1));

    const material = new THREE.MeshPhongMaterial({
      vertexColors: true,
      flatShading: true,
      side: THREE.DoubleSide
    });

    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.position.set(this.x * CHUNK_SIZE, 0, this.z * CHUNK_SIZE);
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;
  }

  dispose() {
    if (this.mesh) {
      this.mesh.geometry.dispose();
      this.mesh.material.dispose();
      this.mesh = null;
    }
  }
}

export class World {
  constructor() {
    this.chunks = new Map();
    this.biomeGen = new BiomeGenerator(42);
    this.loadRadius = 3;
  }

  getChunk(x, z) {
    const key = `${x},${z}`;
    return this.chunks.get(key);
  }

  loadChunk(x, z) {
    const key = `${x},${z}`;
    if (!this.chunks.has(key)) {
      const chunk = new Chunk(x, z, this.biomeGen);
      chunk.buildMesh();
      this.chunks.set(key, chunk);
      return chunk;
    }
    return this.chunks.get(key);
  }

  unloadChunk(x, z) {
    const key = `${x},${z}`;
    const chunk = this.chunks.get(key);
    if (chunk) {
      chunk.dispose();
      this.chunks.delete(key);
    }
  }

  updateChunksAround(playerPos) {
    const chunkX = Math.floor(playerPos.x / CHUNK_SIZE);
    const chunkZ = Math.floor(playerPos.z / CHUNK_SIZE);

    const toLoad = [];
    const toUnload = [];

    for (const [key, chunk] of this.chunks) {
      const [cx, cz] = key.split(',').map(Number);
      if (Math.abs(cx - chunkX) > this.loadRadius || Math.abs(cz - chunkZ) > this.loadRadius) {
        toUnload.push(chunk);
      }
    }

    for (let x = chunkX - this.loadRadius; x <= chunkX + this.loadRadius; x++) {
      for (let z = chunkZ - this.loadRadius; z <= chunkZ + this.loadRadius; z++) {
        if (!this.getChunk(x, z)) {
          toLoad.push({ x, z });
        }
      }
    }

    toUnload.forEach(chunk => this.unloadChunk(chunk.x, chunk.z));
    toLoad.forEach(({ x, z }) => this.loadChunk(x, z));
  }

  getBlock(x, y, z) {
    const chunkX = Math.floor(x / CHUNK_SIZE);
    const chunkZ = Math.floor(z / CHUNK_SIZE);
    const localX = ((x % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
    const localZ = ((z % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;

    const chunk = this.getChunk(chunkX, chunkZ);
    return chunk ? chunk.getBlock(localX, y, localZ) : BLOCK_TYPES.AIR;
  }

  setBlock(x, y, z, type) {
    const chunkX = Math.floor(x / CHUNK_SIZE);
    const chunkZ = Math.floor(z / CHUNK_SIZE);
    const localX = ((x % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
    const localZ = ((z % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;

    const chunk = this.getChunk(chunkX, chunkZ);
    if (chunk) {
      chunk.setBlock(localX, y, localZ, type);
      chunk.buildMesh();
    }
  }

  getMeshes() {
    const meshes = [];
    for (const chunk of this.chunks.values()) {
      if (chunk.mesh) meshes.push(chunk.mesh);
    }
    return meshes;
  }
}
