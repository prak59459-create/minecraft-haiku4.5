import * as THREE from 'three';
import { PerlinNoise, getBlockType } from './perlin';
import { BLOCK_TYPES } from './blocks';

export const CHUNK_SIZE = 16;
export const CHUNK_HEIGHT = 128;

export class Chunk {
  x: number;
  z: number;
  blocks: Uint8Array;
  mesh: THREE.Mesh | null = null;
  object: THREE.Group = new THREE.Group();
  loaded: boolean = false;

  constructor(x: number, z: number) {
    this.x = x;
    this.z = z;
    this.blocks = new Uint8Array(CHUNK_SIZE * CHUNK_HEIGHT * CHUNK_SIZE);
  }

  generate(perlin: PerlinNoise) {
    for (let x = 0; x < CHUNK_SIZE; x++) {
      for (let z = 0; z < CHUNK_SIZE; z++) {
        const worldX = this.x * CHUNK_SIZE + x;
        const worldZ = this.z * CHUNK_SIZE + z;

        for (let y = 0; y < CHUNK_HEIGHT; y++) {
          const blockType = getBlockType(worldX, y, worldZ, perlin);
          this.setBlock(x, y, z, blockType);
        }
      }
    }
    this.loaded = true;
  }

  setBlock(x: number, y: number, z: number, type: number) {
    if (x < 0 || x >= CHUNK_SIZE || y < 0 || y >= CHUNK_HEIGHT || z < 0 || z >= CHUNK_SIZE) {
      return;
    }
    this.blocks[x + z * CHUNK_SIZE + y * CHUNK_SIZE * CHUNK_SIZE] = type;
  }

  getBlock(x: number, y: number, z: number): number {
    if (x < 0 || x >= CHUNK_SIZE || y < 0 || y >= CHUNK_HEIGHT || z < 0 || z >= CHUNK_SIZE) {
      return 0;
    }
    return this.blocks[x + z * CHUNK_SIZE + y * CHUNK_SIZE * CHUNK_SIZE];
  }

  buildMesh() {
    const geometry = new THREE.BufferGeometry();
    const positions: number[] = [];
    const normals: number[] = [];
    const colors: number[] = [];
    const indices: number[] = [];

    const textures: { [key: number]: [number, number, number] } = {
      0: [0, 0, 0], // air
      1: [0.2, 0.8, 0.2], // grass - green
      2: [0.6, 0.4, 0.2], // dirt - brown
      3: [0.5, 0.5, 0.5], // stone - gray
      4: [0.4, 0.2, 0], // wood - dark brown
      5: [0.2, 0.6, 0.2], // leaves - dark green
      6: [0.1, 0.2, 0.8], // water - blue
    };

    let vertexCount = 0;

    for (let x = 0; x < CHUNK_SIZE; x++) {
      for (let y = 0; y < CHUNK_HEIGHT; y++) {
        for (let z = 0; z < CHUNK_SIZE; z++) {
          const blockType = this.getBlock(x, y, z);
          if (blockType === 0) continue;

          const color = textures[blockType] || [1, 1, 1];
          const wx = this.x * CHUNK_SIZE + x;
          const wy = y;
          const wz = this.z * CHUNK_SIZE + z;

          // Check each face and add if adjacent is air
          const faces = [
            { nx: 1, dir: [1, 0, 0], normal: [1, 0, 0] },
            { nx: -1, dir: [-1, 0, 0], normal: [-1, 0, 0] },
            { ny: 1, dir: [0, 1, 0], normal: [0, 1, 0] },
            { ny: -1, dir: [0, -1, 0], normal: [0, -1, 0] },
            { nz: 1, dir: [0, 0, 1], normal: [0, 0, 1] },
            { nz: -1, dir: [0, 0, -1], normal: [0, 0, -1] },
          ];

          for (const face of faces) {
            const dx = (face as any).nx || (face as any).nz ? 0 : (face as any).dir[0];
            const dy = (face as any).ny ? (face as any).dir[1] : 0;
            const dz = (face as any).nz ? (face as any).dir[2] : 0;

            const nx = x + dx;
            const ny = y + dy;
            const nz = z + dz;

            if (this.getBlock(nx, ny, nz) !== 0) continue;

            const normal = (face as any).normal;
            const verts = this.getFaceVertices(x, y, z, normal);

            for (const v of verts) {
              positions.push(v[0] + wx, v[1] + wy, v[2] + wz);
              normals.push(...normal);
              colors.push(...color);
            }

            const start = vertexCount;
            indices.push(start, start + 1, start + 2, start, start + 2, start + 3);
            vertexCount += 4;
          }
        }
      }
    }

    if (vertexCount === 0) return;

    geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3));
    geometry.setAttribute('normal', new THREE.BufferAttribute(new Float32Array(normals), 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array(colors), 3));
    geometry.setIndex(new THREE.BufferAttribute(new Uint32Array(indices), 1));

    const material = new THREE.MeshPhongMaterial({ vertexColors: true, side: THREE.DoubleSide });
    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;
    this.object.add(this.mesh);
  }

  private getFaceVertices(x: number, y: number, z: number, normal: number[]): number[][] {
    const [nx, ny, nz] = normal;
    if (nx !== 0) {
      const ox = x + (nx > 0 ? 1 : 0);
      return [
        [ox, y, z], [ox, y + 1, z], [ox, y + 1, z + 1], [ox, y, z + 1]
      ];
    } else if (ny !== 0) {
      const oy = y + (ny > 0 ? 1 : 0);
      return [
        [x, oy, z], [x + 1, oy, z], [x + 1, oy, z + 1], [x, oy, z + 1]
      ];
    } else {
      const oz = z + (nz > 0 ? 1 : 0);
      return [
        [x, y, oz], [x, y + 1, oz], [x + 1, y + 1, oz], [x + 1, y, oz]
      ];
    }
  }
}
