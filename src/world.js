import { CHUNK_SIZE, CHUNK_HEIGHT, SEA_LEVEL } from './config.js';
import { BLOCK, BLOCK_INFO } from './block-types.js';
import { createNoise2D, fbm2D, hash3 } from './utils.js';
import { buildChunkMesh } from './renderer.js';

const CS = CHUNK_SIZE;
const TREE_MARGIN = 2;

export function blockIndex(x, y, z) {
    return (y * CS + z) * CS + x;
}

export class Chunk {
    constructor(cx, cz) {
        this.cx = cx;
        this.cz = cz;
        this.blocks = new Uint8Array(CS * CS * CHUNK_HEIGHT);
        this.meshes = [];
        this.needsMesh = true;
    }

    disposeMeshes(scene) {
        for (const mesh of this.meshes) {
            scene.remove(mesh);
            mesh.geometry.dispose();
        }
        this.meshes = [];
    }
}

const chunkKey = (cx, cz) => `${cx},${cz}`;

export class World {
    constructor(scene, seed, renderDistance) {
        this.scene = scene;
        this.seed = seed;
        this.renderDistance = renderDistance;
        this.chunks = new Map();
        this.edits = new Map();
        this.continent = createNoise2D(seed);
        this.detail = createNoise2D(seed + 1);
        this.center = null;
        this.loadOrder = [];
    }

    getChunk(cx, cz) {
        return this.chunks.get(chunkKey(cx, cz));
    }

    getBlock(x, y, z) {
        if (y < 0 || y >= CHUNK_HEIGHT) return BLOCK.AIR;
        const chunk = this.chunks.get(chunkKey(x >> 4, z >> 4));
        if (!chunk) return BLOCK.AIR;
        return chunk.blocks[blockIndex(x & 15, y, z & 15)];
    }

    // Unloaded chunks count as solid so the player never falls through ungenerated terrain.
    isSolid(x, y, z) {
        if (y < 0) return true;
        if (y >= CHUNK_HEIGHT) return false;
        const chunk = this.chunks.get(chunkKey(x >> 4, z >> 4));
        if (!chunk) return true;
        return BLOCK_INFO[chunk.blocks[blockIndex(x & 15, y, z & 15)]].solid;
    }

    setBlock(x, y, z, id) {
        if (y < 0 || y >= CHUNK_HEIGHT) return false;
        const cx = x >> 4;
        const cz = z >> 4;
        const chunk = this.getChunk(cx, cz);
        if (!chunk) return false;
        const lx = x & 15;
        const lz = z & 15;
        const index = blockIndex(lx, y, lz);
        chunk.blocks[index] = id;
        const key = chunkKey(cx, cz);
        if (!this.edits.has(key)) this.edits.set(key, new Map());
        this.edits.get(key).set(index, id);

        this.remesh(chunk);
        if (lx === 0) this.remesh(this.getChunk(cx - 1, cz));
        if (lx === CS - 1) this.remesh(this.getChunk(cx + 1, cz));
        if (lz === 0) this.remesh(this.getChunk(cx, cz - 1));
        if (lz === CS - 1) this.remesh(this.getChunk(cx, cz + 1));
        return true;
    }

    remesh(chunk) {
        if (!chunk || !this.hasAllNeighbors(chunk)) return;
        chunk.disposeMeshes(this.scene);
        chunk.meshes = buildChunkMesh(this, chunk);
        for (const mesh of chunk.meshes) this.scene.add(mesh);
        chunk.needsMesh = false;
    }

    hasAllNeighbors(chunk) {
        const { cx, cz } = chunk;
        return this.chunks.has(chunkKey(cx + 1, cz)) && this.chunks.has(chunkKey(cx - 1, cz))
            && this.chunks.has(chunkKey(cx, cz + 1)) && this.chunks.has(chunkKey(cx, cz - 1));
    }

    terrainHeight(x, z) {
        const c = fbm2D(this.continent, x / 220, z / 220, 3);
        const d = fbm2D(this.detail, x / 48, z / 48, 3);
        const h = SEA_LEVEL + 4 + c * 18 + d * 5;
        return Math.max(1, Math.min(CHUNK_HEIGHT - 12, Math.floor(h)));
    }

    isTreeAt(x, z, height) {
        return height > SEA_LEVEL + 1 && hash3(x, 0, z, this.seed) < 0.012;
    }

    generateChunk(cx, cz) {
        const chunk = new Chunk(cx, cz);
        const blocks = chunk.blocks;
        const x0 = cx * CS;
        const z0 = cz * CS;
        const span = CS + TREE_MARGIN * 2;
        const heights = new Int32Array(span * span);

        for (let dz = 0; dz < span; dz++) {
            for (let dx = 0; dx < span; dx++) {
                heights[dz * span + dx] = this.terrainHeight(x0 + dx - TREE_MARGIN, z0 + dz - TREE_MARGIN);
            }
        }

        for (let z = 0; z < CS; z++) {
            for (let x = 0; x < CS; x++) {
                const h = heights[(z + TREE_MARGIN) * span + (x + TREE_MARGIN)];
                const beach = h <= SEA_LEVEL + 1;
                for (let y = 0; y <= Math.max(h, SEA_LEVEL); y++) {
                    let id;
                    if (y === 0) id = BLOCK.BEDROCK;
                    else if (y < h - 3) id = BLOCK.STONE;
                    else if (y < h) id = beach ? BLOCK.SAND : BLOCK.DIRT;
                    else if (y === h) id = beach ? BLOCK.SAND : BLOCK.GRASS;
                    else id = BLOCK.WATER;
                    blocks[blockIndex(x, y, z)] = id;
                }
            }
        }

        // Trees are placed from every trunk within the margin so canopies cross chunk borders seamlessly.
        for (let dz = 0; dz < span; dz++) {
            for (let dx = 0; dx < span; dx++) {
                const tx = x0 + dx - TREE_MARGIN;
                const tz = z0 + dz - TREE_MARGIN;
                const h = heights[dz * span + dx];
                if (this.isTreeAt(tx, tz, h)) this.placeTree(chunk, tx, h + 1, tz);
            }
        }

        const edits = this.edits.get(chunkKey(cx, cz));
        if (edits) for (const [index, id] of edits) blocks[index] = id;

        return chunk;
    }

    placeTree(chunk, tx, baseY, tz) {
        const trunk = 4 + Math.floor(hash3(tx, 1, tz, this.seed) * 3);
        const top = baseY + trunk;
        const set = (x, y, z, id, overwrite) => {
            const lx = x - chunk.cx * CS;
            const lz = z - chunk.cz * CS;
            if (lx < 0 || lx >= CS || lz < 0 || lz >= CS || y < 0 || y >= CHUNK_HEIGHT) return;
            const i = blockIndex(lx, y, lz);
            if (overwrite || chunk.blocks[i] === BLOCK.AIR) chunk.blocks[i] = id;
        };

        for (let y = top - 3; y <= top; y++) {
            const r = y >= top - 1 ? 1 : 2;
            for (let dz = -r; dz <= r; dz++) {
                for (let dx = -r; dx <= r; dx++) {
                    const corner = Math.abs(dx) === r && Math.abs(dz) === r;
                    if (corner && (r === 1 || hash3(tx + dx, y, tz + dz, this.seed) < 0.5)) continue;
                    set(tx + dx, y, tz + dz, BLOCK.LEAVES, false);
                }
            }
        }
        for (let y = baseY; y < top; y++) set(tx, y, tz, BLOCK.LOG, true);
    }

    ensureChunk(cx, cz) {
        const key = chunkKey(cx, cz);
        let chunk = this.chunks.get(key);
        if (!chunk) {
            chunk = this.generateChunk(cx, cz);
            this.chunks.set(key, chunk);
        }
        return chunk;
    }

    loadImmediate(cx, cz, radius) {
        for (let dz = -radius - 1; dz <= radius + 1; dz++) {
            for (let dx = -radius - 1; dx <= radius + 1; dx++) this.ensureChunk(cx + dx, cz + dz);
        }
        for (let dz = -radius; dz <= radius; dz++) {
            for (let dx = -radius; dx <= radius; dx++) this.remesh(this.getChunk(cx + dx, cz + dz));
        }
    }

    update(px, pz, genBudget = 3, meshBudget = 2) {
        const pcx = Math.floor(px / CS);
        const pcz = Math.floor(pz / CS);
        const R = this.renderDistance;

        if (!this.center || this.center[0] !== pcx || this.center[1] !== pcz) {
            this.center = [pcx, pcz];
            this.loadOrder = [];
            for (let dz = -R - 1; dz <= R + 1; dz++) {
                for (let dx = -R - 1; dx <= R + 1; dx++) this.loadOrder.push([dx * dx + dz * dz, dx, dz]);
            }
            this.loadOrder.sort((a, b) => a[0] - b[0]);
            this.unloadFar(pcx, pcz, R + 2);
        }

        for (const [, dx, dz] of this.loadOrder) {
            if (genBudget <= 0 && meshBudget <= 0) break;
            const cx = pcx + dx;
            const cz = pcz + dz;
            const chunk = this.getChunk(cx, cz);
            if (!chunk) {
                if (genBudget > 0) {
                    this.ensureChunk(cx, cz);
                    genBudget--;
                }
            } else if (chunk.needsMesh && meshBudget > 0 && Math.abs(dx) <= R && Math.abs(dz) <= R && this.hasAllNeighbors(chunk)) {
                this.remesh(chunk);
                meshBudget--;
            }
        }
    }

    unloadFar(pcx, pcz, maxDist) {
        for (const [key, chunk] of this.chunks) {
            if (Math.abs(chunk.cx - pcx) > maxDist || Math.abs(chunk.cz - pcz) > maxDist) {
                chunk.disposeMeshes(this.scene);
                this.chunks.delete(key);
            }
        }
    }

    get chunkCount() {
        return this.chunks.size;
    }
}
