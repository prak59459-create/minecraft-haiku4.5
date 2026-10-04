import { BlockType } from './blocks.js';
import * as THREE from 'three';

const CHUNK_SIZE = 16;
const CHUNK_HEIGHT = 128;
const RENDER_DISTANCE = 10;

interface Vector3Like {
    x: number;
    y: number;
    z: number;
}

class Chunk {
    blocks: Uint8Array;
    x: number;
    z: number;
    loaded: boolean = false;
    mesh: THREE.Mesh | null = null;

    constructor(x: number, z: number) {
        this.x = x;
        this.z = z;
        this.blocks = new Uint8Array(CHUNK_SIZE * CHUNK_HEIGHT * CHUNK_SIZE);
    }

    getBlock(x: number, y: number, z: number): BlockType {
        if (y < 0 || y >= CHUNK_HEIGHT || x < 0 || x >= CHUNK_SIZE || z < 0 || z >= CHUNK_SIZE) {
            return BlockType.AIR;
        }
        return this.blocks[x + z * CHUNK_SIZE + y * CHUNK_SIZE * CHUNK_SIZE];
    }

    setBlock(x: number, y: number, z: number, type: BlockType): void {
        if (y < 0 || y >= CHUNK_HEIGHT || x < 0 || x >= CHUNK_SIZE || z < 0 || z >= CHUNK_SIZE) return;
        this.blocks[x + z * CHUNK_SIZE + y * CHUNK_SIZE * CHUNK_SIZE] = type;
    }
}

class PerlinNoise {
    private p: number[] = [];

    constructor(seed: number = 0) {
        const perm = Array.from({ length: 256 }, (_, i) => i);
        for (let i = 255; i > 0; i--) {
            const j = Math.floor((seed + i * 17) % 256);
            [perm[i], perm[j]] = [perm[j], perm[i]];
        }
        this.p = [...perm, ...perm];
    }

    private fade(t: number): number {
        return t * t * t * (t * (t * 6 - 15) + 10);
    }

    private lerp(a: number, b: number, t: number): number {
        return a + (b - a) * t;
    }

    private grad(hash: number, x: number, y: number, z: number): number {
        const h = hash & 15;
        const u = h < 8 ? x : y;
        const v = h < 8 ? y : z;
        return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
    }

    perlin(x: number, y: number, z: number): number {
        const xi = Math.floor(x) & 255;
        const yi = Math.floor(y) & 255;
        const zi = Math.floor(z) & 255;

        const xf = x - Math.floor(x);
        const yf = y - Math.floor(y);
        const zf = z - Math.floor(z);

        const u = this.fade(xf);
        const v = this.fade(yf);
        const w = this.fade(zf);

        const p = this.p;
        const aa = p[p[p[xi] + yi] + zi];
        const ba = p[p[p[xi + 1] + yi] + zi];
        const ab = p[p[p[xi] + yi + 1] + zi];
        const bb = p[p[p[xi + 1] + yi + 1] + zi];
        const aaa = p[p[p[xi] + yi] + zi + 1];
        const baa = p[p[p[xi + 1] + yi] + zi + 1];
        const aba = p[p[p[xi] + yi + 1] + zi + 1];
        const bba = p[p[p[xi + 1] + yi + 1] + zi + 1];

        const x1 = this.lerp(this.grad(aa, xf, yf, zf), this.grad(ba, xf - 1, yf, zf), u);
        const x2 = this.lerp(this.grad(ab, xf, yf - 1, zf), this.grad(bb, xf - 1, yf - 1, zf), u);
        const y1 = this.lerp(x1, x2, v);

        const x3 = this.lerp(this.grad(aaa, xf, yf, zf - 1), this.grad(baa, xf - 1, yf, zf - 1), u);
        const x4 = this.lerp(this.grad(aba, xf, yf - 1, zf - 1), this.grad(bba, xf - 1, yf - 1, zf - 1), u);
        const y2 = this.lerp(x3, x4, v);

        return this.lerp(y1, y2, w);
    }
}

export class World {
    chunks: Map<string, Chunk> = new Map();
    noise: PerlinNoise;
    scene: THREE.Scene;

    constructor(scene: THREE.Scene, seed: number = 42) {
        this.scene = scene;
        this.noise = new PerlinNoise(seed);
    }

    private getChunkKey(cx: number, cz: number): string {
        return `${cx},${cz}`;
    }

    getChunk(cx: number, cz: number): Chunk {
        const key = this.getChunkKey(cx, cz);
        let chunk = this.chunks.get(key);
        if (!chunk) {
            chunk = new Chunk(cx, cz);
            this.generateChunk(chunk);
            this.chunks.set(key, chunk);
        }
        return chunk;
    }

    private generateChunk(chunk: Chunk): void {
        for (let x = 0; x < CHUNK_SIZE; x++) {
            for (let z = 0; z < CHUNK_SIZE; z++) {
                const worldX = chunk.x * CHUNK_SIZE + x;
                const worldZ = chunk.z * CHUNK_SIZE + z;
                const height = this.getTerrainHeight(worldX, worldZ);

                for (let y = CHUNK_HEIGHT - 1; y >= 0; y--) {
                    let block = BlockType.AIR;

                    if (y < height - 4) {
                        block = BlockType.STONE;
                        const rand = Math.random();
                        if (rand < 0.02) block = BlockType.COAL_ORE;
                        else if (rand < 0.025) block = BlockType.IRON_ORE;
                        else if (rand < 0.028) block = BlockType.GOLD_ORE;
                    } else if (y < height - 1) {
                        block = BlockType.DIRT;
                    } else if (y === height - 1) {
                        block = this.noise.perlin(worldX * 0.15, 0, worldZ * 0.15) > 0.2 ? BlockType.GRASS : BlockType.DIRT;
                    } else if (y < 62 && block === BlockType.AIR) {
                        block = BlockType.WATER;
                    }

                    chunk.setBlock(x, y, z, block);
                }
            }
        }

        if (Math.random() < 0.8) {
            this.generateTrees(chunk);
        }
        chunk.loaded = true;
    }

    private generateTrees(chunk: Chunk): void {
        for (let i = 0; i < 2 + Math.floor(Math.random() * 3); i++) {
            const x = Math.floor(Math.random() * CHUNK_SIZE);
            const z = Math.floor(Math.random() * CHUNK_SIZE);
            const worldX = chunk.x * CHUNK_SIZE + x;
            const worldZ = chunk.z * CHUNK_SIZE + z;
            const height = this.getTerrainHeight(worldX, worldZ);

            if (chunk.getBlock(x, height, z) === BlockType.GRASS && Math.random() < 0.7) {
                const treeHeight = 4 + Math.floor(Math.random() * 4);
                this.generateTree(chunk, x, height, z, treeHeight);
            }
        }
    }

    private generateTree(chunk: Chunk, x: number, y: number, z: number, height: number): void {
        for (let i = 0; i < height; i++) {
            if (y + i < CHUNK_HEIGHT) {
                chunk.setBlock(x, y + 1 + i, z, BlockType.WOOD);
            }
        }

        for (let dx = -2; dx <= 2; dx++) {
            for (let dz = -2; dz <= 2; dz++) {
                for (let dy = -2; dy <= 2; dy++) {
                    if (Math.abs(dx) === 2 && Math.abs(dz) === 2) continue;
                    const lx = x + dx;
                    const lz = z + dz;
                    const ly = y + height + dy;
                    if (lx >= 0 && lx < CHUNK_SIZE && lz >= 0 && lz < CHUNK_SIZE && ly >= 0 && ly < CHUNK_HEIGHT) {
                        if (chunk.getBlock(lx, ly, lz) === BlockType.AIR) {
                            chunk.setBlock(lx, ly, lz, BlockType.LEAVES);
                        }
                    }
                }
            }
        }
    }

    private getTerrainHeight(x: number, z: number): number {
        const base = this.noise.perlin(x * 0.003, 0, z * 0.003) * 40 + 70;
        const mid = this.noise.perlin(x * 0.01, 0, z * 0.01) * 20;
        const detail = this.noise.perlin(x * 0.03, 0, z * 0.03) * 10;
        const height = base + mid + detail;
        return Math.floor(Math.max(50, Math.min(120, height)));
    }

    getBlock(x: number, y: number, z: number): BlockType {
        if (y < 0 || y >= CHUNK_HEIGHT) return BlockType.AIR;
        const cx = Math.floor(x / CHUNK_SIZE);
        const cz = Math.floor(z / CHUNK_SIZE);
        const chunk = this.getChunk(cx, cz);
        const lx = ((x % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
        const lz = ((z % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
        return chunk.getBlock(lx, y, lz);
    }

    setBlock(x: number, y: number, z: number, type: BlockType): void {
        if (y < 0 || y >= CHUNK_HEIGHT) return;
        const cx = Math.floor(x / CHUNK_SIZE);
        const cz = Math.floor(z / CHUNK_SIZE);
        const chunk = this.getChunk(cx, cz);
        const lx = ((x % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
        const lz = ((z % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
        chunk.setBlock(lx, y, lz, type);
    }

    updateChunksAround(pos: Vector3Like): void {
        const cx = Math.floor(pos.x / CHUNK_SIZE);
        const cz = Math.floor(pos.z / CHUNK_SIZE);

        const loaded = new Set<string>();
        for (let dx = -RENDER_DISTANCE; dx <= RENDER_DISTANCE; dx++) {
            for (let dz = -RENDER_DISTANCE; dz <= RENDER_DISTANCE; dz++) {
                const key = this.getChunkKey(cx + dx, cz + dz);
                loaded.add(key);
                this.getChunk(cx + dx, cz + dz);
            }
        }

        for (const [key, chunk] of this.chunks) {
            if (!loaded.has(key) && chunk.mesh) {
                this.scene.remove(chunk.mesh);
                chunk.mesh.geometry.dispose();
                (chunk.mesh.material as THREE.Material).dispose();
                chunk.mesh = null;
            }
        }
    }

    buildMesh(chunk: Chunk): THREE.Mesh {
        const geometry = new THREE.BufferGeometry();
        const vertices: number[] = [];
        const colors: number[] = [];
        const indices: number[] = [];

        for (let x = 0; x < CHUNK_SIZE; x++) {
            for (let y = 0; y < CHUNK_HEIGHT; y++) {
                for (let z = 0; z < CHUNK_SIZE; z++) {
                    const block = chunk.getBlock(x, y, z);
                    if (block === BlockType.AIR) continue;

                    const color = { r: 128, g: 128, b: 128 };
                    this.addBlockFaces(x, y, z, chunk, vertices, colors, indices, color);
                }
            }
        }

        if (vertices.length === 0) {
            return new THREE.Mesh(new THREE.BufferGeometry(), new THREE.MeshBasicMaterial());
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(vertices), 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(new Uint8Array(colors), 3, true));
        geometry.setIndex(new THREE.BufferAttribute(new Uint32Array(indices), 1));

        const material = new THREE.MeshStandardMaterial({
            vertexColors: true,
            roughness: 0.8,
            metalness: 0.1
        });

        return new THREE.Mesh(geometry, material);
    }

    private addBlockFaces(x: number, y: number, z: number, chunk: Chunk, vertices: number[], colors: number[], indices: number[], baseColor: { r: number, g: number, b: number }): void {
        const block = chunk.getBlock(x, y, z);
        const isWater = block === BlockType.WATER;

        const faces = [
            { nx: 1, ny: 0, nz: 0, brightness: 0.8, verts: [[1,0,0],[1,1,0],[1,1,1],[1,0,1]] },
            { nx: -1, ny: 0, nz: 0, brightness: 0.8, verts: [[0,0,1],[0,1,1],[0,1,0],[0,0,0]] },
            { nx: 0, ny: 1, nz: 0, brightness: 1.0, verts: [[0,1,0],[1,1,0],[1,1,1],[0,1,1]] },
            { nx: 0, ny: -1, nz: 0, brightness: 0.6, verts: [[0,0,1],[1,0,1],[1,0,0],[0,0,0]] },
            { nx: 0, ny: 0, nz: 1, brightness: 0.9, verts: [[1,0,1],[1,1,1],[0,1,1],[0,0,1]] },
            { nx: 0, ny: 0, nz: -1, brightness: 0.9, verts: [[0,0,0],[0,1,0],[1,1,0],[1,0,0]] }
        ];

        for (const face of faces) {
            const neighbor = chunk.getBlock(x + face.nx, y + face.ny, z + face.nz);
            if (neighbor === BlockType.AIR || (isWater && neighbor === BlockType.AIR)) {
                const start = vertices.length / 3;
                for (const vert of face.verts) {
                    vertices.push(x + vert[0], y + vert[1], z + vert[2]);
                    const r = Math.min(255, baseColor.r * face.brightness);
                    const g = Math.min(255, baseColor.g * face.brightness);
                    const b = Math.min(255, baseColor.b * face.brightness);
                    colors.push(r, g, b);
                }
                indices.push(start, start + 1, start + 2, start + 2, start + 3, start);
            }
        }
    }
}
