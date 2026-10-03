import * as THREE from 'three';

const CHUNK_SIZE = 16;
const CHUNK_HEIGHT = 256;
const SEA_LEVEL = 64;

const BLOCKS = {
  AIR: 0,
  STONE: 1,
  DIRT: 2,
  GRASS: 3,
  WOOD: 4,
  LEAVES: 5,
  WATER: 6,
  SAND: 7
};

const BLOCK_COLORS = {
  1: 0x808080, // stone
  2: 0x8B4513, // dirt
  3: 0x228B22, // grass (darker green)
  4: 0x8B6914, // wood (darker brown)
  5: 0x3CB371, // leaves (lighter green)
  6: 0x4682B4, // water (steel blue)
  7: 0xEDD5B1  // sand (light tan)
};

export class World {
  constructor(noiseGenerator) {
    this.noise = noiseGenerator;
    this.chunks = new Map();
    this.scene = window.gameState?.scene || new THREE.Scene();
  }

  init() {
    this.scene = window.gameState.scene;
  }

  getChunkKey(x, z) {
    return `${x},${z}`;
  }

  getTerrainHeight(x, z) {
    const scale1 = 0.04;
    const scale2 = 0.12;
    const scale3 = 0.25;

    const baseHeight = this.noise.noise2D(x * scale1, z * scale1) * 40;
    const detailHeight = this.noise.noise2D(x * scale2, z * scale2) * 15;
    const fineHeight = this.noise.noise2D(x * scale3, z * scale3) * 5;

    return Math.floor(baseHeight + detailHeight + fineHeight + 64);
  }

  getBlockAt(x, y, z) {
    if (y < 0 || y >= CHUNK_HEIGHT) return BLOCKS.AIR;

    const chunkX = Math.floor(x / CHUNK_SIZE);
    const chunkZ = Math.floor(z / CHUNK_SIZE);
    const key = this.getChunkKey(chunkX, chunkZ);

    const chunk = this.chunks.get(key);
    if (!chunk) return BLOCKS.AIR;

    const localX = x - chunkX * CHUNK_SIZE;
    const localZ = z - chunkZ * CHUNK_SIZE;

    return chunk.getBlock(localX, y, localZ);
  }

  setBlockAt(x, y, z, block) {
    if (y < 0 || y >= CHUNK_HEIGHT) return;

    const chunkX = Math.floor(x / CHUNK_SIZE);
    const chunkZ = Math.floor(z / CHUNK_SIZE);
    const key = this.getChunkKey(chunkX, chunkZ);

    let chunk = this.chunks.get(key);
    if (!chunk) {
      chunk = new Chunk(chunkX, chunkZ, this);
      this.chunks.set(key, chunk);
    }

    const localX = x - chunkX * CHUNK_SIZE;
    const localZ = z - chunkZ * CHUNK_SIZE;

    chunk.setBlock(localX, y, localZ, block);
    chunk.mesh.geometry.dispose();
    chunk.mesh.geometry = this.buildChunkGeometry(chunk);

    // Update adjacent chunks
    this.updateAdjacentChunks(chunkX, chunkZ);
  }

  updateAdjacentChunks(chunkX, chunkZ) {
    for (let dx = -1; dx <= 1; dx++) {
      for (let dz = -1; dz <= 1; dz++) {
        const key = this.getChunkKey(chunkX + dx, chunkZ + dz);
        const chunk = this.chunks.get(key);
        if (chunk) {
          chunk.mesh.geometry.dispose();
          chunk.mesh.geometry = this.buildChunkGeometry(chunk);
        }
      }
    }
  }

  generateChunk(chunkX, chunkZ) {
    const chunk = new Chunk(chunkX, chunkZ, this);

    for (let x = 0; x < CHUNK_SIZE; x++) {
      for (let z = 0; z < CHUNK_SIZE; z++) {
        const worldX = chunkX * CHUNK_SIZE + x;
        const worldZ = chunkZ * CHUNK_SIZE + z;
        const terrainHeight = this.getTerrainHeight(worldX, worldZ);

        for (let y = 0; y < CHUNK_HEIGHT; y++) {
          if (y > terrainHeight) {
            if (y <= SEA_LEVEL) {
              chunk.setBlock(x, y, z, BLOCKS.WATER);
            }
          } else if (y === terrainHeight) {
            chunk.setBlock(x, y, z, BLOCKS.GRASS);
          } else if (y > terrainHeight - 4) {
            chunk.setBlock(x, y, z, BLOCKS.DIRT);
          } else {
            chunk.setBlock(x, y, z, BLOCKS.STONE);
          }
        }

        // Trees - use noise for natural distribution
        const treeNoise = this.noise.noise2D(worldX * 0.08, worldZ * 0.08);
        if (treeNoise > 0.4 && terrainHeight > 50 && terrainHeight < 130) {
          const trunkHeight = 4 + Math.floor(treeNoise * 4);
          const foliageSize = 2 + Math.floor(Math.abs(treeNoise) * 2);

          for (let ty = 0; ty < trunkHeight; ty++) {
            const blockY = terrainHeight + 1 + ty;
            if (blockY < CHUNK_HEIGHT) {
              chunk.setBlock(x, blockY, z, BLOCKS.WOOD);
            }
          }

          // Foliage with variable size
          for (let fx = -foliageSize; fx <= foliageSize; fx++) {
            for (let fz = -foliageSize; fz <= foliageSize; fz++) {
              const distSq = fx * fx + fz * fz;
              if (distSq <= foliageSize * foliageSize + 1) {
                for (let fy = 0; fy < 3; fy++) {
                  const foliageY = terrainHeight + trunkHeight - 1 + fy;
                  if (foliageY < CHUNK_HEIGHT && foliageY > terrainHeight) {
                    const gx = x + fx;
                    const gz = z + fz;
                    if (gx >= 0 && gx < CHUNK_SIZE && gz >= 0 && gz < CHUNK_SIZE) {
                      if (chunk.getBlock(gx, foliageY, gz) === BLOCKS.AIR) {
                        chunk.setBlock(gx, foliageY, gz, BLOCKS.LEAVES);
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }

    chunk.mesh.geometry = this.buildChunkGeometry(chunk);
    this.scene.add(chunk.mesh);

    return chunk;
  }

  buildChunkGeometry(chunk) {
    const geometry = new THREE.BufferGeometry();
    const vertices = [];
    const colors = [];
    const indices = [];

    let indexOffset = 0;

    for (let x = 0; x < CHUNK_SIZE; x++) {
      for (let y = 0; y < CHUNK_HEIGHT; y++) {
        for (let z = 0; z < CHUNK_SIZE; z++) {
          const block = chunk.getBlock(x, y, z);
          if (block === BLOCKS.AIR) continue;

          const worldX = chunk.chunkX * CHUNK_SIZE + x;
          const worldZ = chunk.chunkZ * CHUNK_SIZE + z;

          const color = BLOCK_COLORS[block] || 0xFFFFFF;
          const r = (color >> 16) & 255;
          const g = (color >> 8) & 255;
          const b = color & 255;

          this.addBlockVertices(vertices, indices, colors, indexOffset, x, y, z,
                                worldX, worldZ, chunk, r, g, b);
          indexOffset = vertices.length / 3;
        }
      }
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(vertices), 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(new Uint8Array(colors), 3, true));
    geometry.setIndex(new THREE.BufferAttribute(new Uint32Array(indices), 1));

    return geometry;
  }

  addBlockVertices(vertices, indices, colors, indexOffset, x, y, z, worldX, worldZ, chunk, r, g, b) {
    const block = chunk.getBlock(x, y, z);
    const isWater = block === BLOCKS.WATER;

    const faces = [
      // top
      { normal: [0, 1, 0], vertices: [[0,1,0], [1,1,0], [1,1,1], [0,1,1]] },
      // bottom
      { normal: [0, -1, 0], vertices: [[0,0,1], [1,0,1], [1,0,0], [0,0,0]] },
      // front
      { normal: [0, 0, 1], vertices: [[0,0,1], [1,0,1], [1,1,1], [0,1,1]] },
      // back
      { normal: [0, 0, -1], vertices: [[1,0,0], [0,0,0], [0,1,0], [1,1,0]] },
      // right
      { normal: [1, 0, 0], vertices: [[1,0,0], [1,0,1], [1,1,1], [1,1,0]] },
      // left
      { normal: [-1, 0, 0], vertices: [[0,0,1], [0,0,0], [0,1,0], [0,1,1]] }
    ];

    faces.forEach(face => {
      const adjX = face.normal[0];
      const adjY = face.normal[1];
      const adjZ = face.normal[2];

      const adjBlock = this.getBlockAt(worldX + adjX, y + adjY, worldZ + adjZ);
      const shouldRender = adjBlock === BLOCKS.AIR || (isWater && adjBlock !== BLOCKS.WATER);
      if (!shouldRender) return;

      const baseIndex = indexOffset + vertices.length / 3;

      face.vertices.forEach(v => {
        vertices.push(x + v[0], y + v[1], z + v[2]);
        colors.push(r, g, b);
      });

      indices.push(baseIndex, baseIndex + 1, baseIndex + 2);
      indices.push(baseIndex, baseIndex + 2, baseIndex + 3);
    });
  }

  loadChunksAroundPlayer(playerPos) {
    const chunkX = Math.floor(playerPos.x / CHUNK_SIZE);
    const chunkZ = Math.floor(playerPos.z / CHUNK_SIZE);
    const viewDistance = 4;

    const loadedChunks = new Set();

    for (let x = chunkX - viewDistance; x <= chunkX + viewDistance; x++) {
      for (let z = chunkZ - viewDistance; z <= chunkZ + viewDistance; z++) {
        const key = this.getChunkKey(x, z);
        loadedChunks.add(key);

        if (!this.chunks.has(key)) {
          this.generateChunk(x, z);
        }
      }
    }

    // Unload distant chunks
    for (const [key, chunk] of this.chunks) {
      if (!loadedChunks.has(key)) {
        this.scene.remove(chunk.mesh);
        chunk.mesh.geometry.dispose();
        chunk.mesh.material.dispose();
        this.chunks.delete(key);
      }
    }
  }
}

class Chunk {
  constructor(chunkX, chunkZ, world) {
    this.chunkX = chunkX;
    this.chunkZ = chunkZ;
    this.world = world;
    this.blocks = new Uint8Array(CHUNK_SIZE * CHUNK_HEIGHT * CHUNK_SIZE);

    const material = new THREE.MeshPhongMaterial({
      vertexColors: true,
      side: THREE.DoubleSide,
      flatShading: true
    });
    this.mesh = new THREE.Mesh(new THREE.BufferGeometry(), material);
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;
    this.mesh.position.set(chunkX * CHUNK_SIZE, 0, chunkZ * CHUNK_SIZE);
  }

  getBlock(x, y, z) {
    if (x < 0 || x >= CHUNK_SIZE || y < 0 || y >= CHUNK_HEIGHT || z < 0 || z >= CHUNK_SIZE) {
      return BLOCKS.AIR;
    }
    return this.blocks[x + y * CHUNK_SIZE + z * CHUNK_SIZE * CHUNK_HEIGHT];
  }

  setBlock(x, y, z, block) {
    if (x < 0 || x >= CHUNK_SIZE || y < 0 || y >= CHUNK_HEIGHT || z < 0 || z >= CHUNK_SIZE) {
      return;
    }
    this.blocks[x + y * CHUNK_SIZE + z * CHUNK_SIZE * CHUNK_HEIGHT] = block;
  }
}

export { BLOCKS, CHUNK_SIZE, CHUNK_HEIGHT, SEA_LEVEL };
