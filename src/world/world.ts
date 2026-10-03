import * as THREE from 'three';
import { Chunk, CHUNK_SIZE } from './chunk';
import { PerlinNoise } from './perlin';
import { BLOCK_TYPES } from './blocks';

const RENDER_DISTANCE = 3;

export class World {
  scene: THREE.Scene;
  chunks: Map<string, Chunk> = new Map();
  perlin: PerlinNoise;
  selectedBlock: number = BLOCK_TYPES.DIRT;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.perlin = new PerlinNoise(42);
  }

  async initialize() {
    const centerChunkX = 0;
    const centerChunkZ = 0;

    for (let x = -RENDER_DISTANCE; x <= RENDER_DISTANCE; x++) {
      for (let z = -RENDER_DISTANCE; z <= RENDER_DISTANCE; z++) {
        const chunk = new Chunk(centerChunkX + x, centerChunkZ + z);
        chunk.generate(this.perlin);
        chunk.buildMesh();
        this.chunks.set(`${chunk.x},${chunk.z}`, chunk);
        this.scene.add(chunk.object);
        await new Promise(resolve => setTimeout(resolve, 5));
      }
    }
  }

  update(playerPos: THREE.Vector3) {
    const playerChunkX = Math.floor(playerPos.x / CHUNK_SIZE);
    const playerChunkZ = Math.floor(playerPos.z / CHUNK_SIZE);

    const chunksToKeep = new Set<string>();
    for (let x = -RENDER_DISTANCE; x <= RENDER_DISTANCE; x++) {
      for (let z = -RENDER_DISTANCE; z <= RENDER_DISTANCE; z++) {
        const chunkX = playerChunkX + x;
        const chunkZ = playerChunkZ + z;
        const key = `${chunkX},${chunkZ}`;
        chunksToKeep.add(key);

        if (!this.chunks.has(key)) {
          const chunk = new Chunk(chunkX, chunkZ);
          chunk.generate(this.perlin);
          chunk.buildMesh();
          this.chunks.set(key, chunk);
          this.scene.add(chunk.object);
        }
      }
    }

    for (const [key, chunk] of this.chunks.entries()) {
      if (!chunksToKeep.has(key)) {
        this.scene.remove(chunk.object);
        this.chunks.delete(key);
      }
    }
  }

  raycast(origin: THREE.Vector3, direction: THREE.Vector3, maxDist: number = 100): {
    position: THREE.Vector3;
    normal: THREE.Vector3;
    blockPos: THREE.Vector3;
    blockType: number;
  } | null {
    const step = 0.1;
    let currentDist = 0;

    while (currentDist < maxDist) {
      const pos = origin.clone().addScaledVector(direction, currentDist);
      const blockPos = new THREE.Vector3(
        Math.floor(pos.x),
        Math.floor(pos.y),
        Math.floor(pos.z)
      );

      const chunkX = Math.floor(blockPos.x / CHUNK_SIZE);
      const chunkZ = Math.floor(blockPos.z / CHUNK_SIZE);
      const chunk = this.chunks.get(`${chunkX},${chunkZ}`);

      if (chunk) {
        const localX = ((blockPos.x % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
        const localZ = ((blockPos.z % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
        const blockType = chunk.getBlock(localX, blockPos.y, localZ);

        if (blockType !== BLOCK_TYPES.AIR) {
          const normal = this.getBlockNormal(origin, blockPos);
          return {
            position: pos,
            normal,
            blockPos,
            blockType,
          };
        }
      }

      currentDist += step;
    }

    return null;
  }

  private getBlockNormal(origin: THREE.Vector3, blockPos: THREE.Vector3): THREE.Vector3 {
    const diffs = [
      Math.abs(origin.x - (blockPos.x + 0.5)),
      Math.abs(origin.y - (blockPos.y + 0.5)),
      Math.abs(origin.z - (blockPos.z + 0.5)),
    ];

    const minDiff = Math.min(...diffs);
    if (minDiff === diffs[0]) {
      return new THREE.Vector3(origin.x > blockPos.x + 0.5 ? 1 : -1, 0, 0);
    } else if (minDiff === diffs[1]) {
      return new THREE.Vector3(0, origin.y > blockPos.y + 0.5 ? 1 : -1, 0);
    } else {
      return new THREE.Vector3(0, 0, origin.z > blockPos.z + 0.5 ? 1 : -1);
    }
  }

  placeBlock(blockPos: THREE.Vector3, blockType: number) {
    const chunkX = Math.floor(blockPos.x / CHUNK_SIZE);
    const chunkZ = Math.floor(blockPos.z / CHUNK_SIZE);
    const chunk = this.chunks.get(`${chunkX},${chunkZ}`);

    if (chunk) {
      const localX = ((blockPos.x % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
      const localZ = ((blockPos.z % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
      chunk.setBlock(localX, blockPos.y, localZ, blockType);
      this.rebuildChunk(chunkX, chunkZ);
    }
  }

  destroyBlock(blockPos: THREE.Vector3) {
    this.placeBlock(blockPos, BLOCK_TYPES.AIR);
  }

  private rebuildChunk(chunkX: number, chunkZ: number) {
    const chunk = this.chunks.get(`${chunkX},${chunkZ}`);
    if (chunk && chunk.mesh) {
      this.scene.remove(chunk.object);
      chunk.object = new THREE.Group();
      chunk.mesh = null;
      chunk.buildMesh();
      this.scene.add(chunk.object);
    }
  }

  getBlockAt(pos: THREE.Vector3): number {
    const blockPos = new THREE.Vector3(Math.floor(pos.x), Math.floor(pos.y), Math.floor(pos.z));
    const chunkX = Math.floor(blockPos.x / CHUNK_SIZE);
    const chunkZ = Math.floor(blockPos.z / CHUNK_SIZE);
    const chunk = this.chunks.get(`${chunkX},${chunkZ}`);

    if (chunk) {
      const localX = ((blockPos.x % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
      const localZ = ((blockPos.z % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
      return chunk.getBlock(localX, blockPos.y, localZ);
    }
    return BLOCK_TYPES.AIR;
  }
}
