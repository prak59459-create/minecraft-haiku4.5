import { BLOCKS } from './blocks.js';

export const CHUNK_SIZE_EXPORT = 16;
export const WORLD_HEIGHT_EXPORT = 256;

const CHUNK_SIZE = 16;
const CHUNK_HEIGHT = 256;
const WORLD_HEIGHT = 256;

let chunkWorker;

function initChunkWorker() {
    if (typeof Worker !== 'undefined') {
        try {
            chunkWorker = new Worker('chunkWorker.js', { type: 'module' });
        } catch (e) {
            console.warn('Worker initialization failed, falling back to sync generation');
        }
    }
}

export class Chunk {
    constructor(x, z) {
        this.x = x;
        this.z = z;
        this.blocks = new Uint8Array(CHUNK_SIZE * WORLD_HEIGHT * CHUNK_SIZE);
        this.generated = false;
        this.generating = false;
        this.mesh = null;
    }

    getBlock(x, y, z) {
        if (x < 0 || x >= CHUNK_SIZE || y < 0 || y >= WORLD_HEIGHT || z < 0 || z >= CHUNK_SIZE) {
            return BLOCKS.AIR;
        }
        const idx = x + y * CHUNK_SIZE + z * CHUNK_SIZE * WORLD_HEIGHT;
        return this.blocks[idx] || 0;
    }

    setBlock(x, y, z, blockId) {
        if (x < 0 || x >= CHUNK_SIZE || y < 0 || y >= WORLD_HEIGHT || z < 0 || z >= CHUNK_SIZE) {
            return;
        }
        const idx = x + y * CHUNK_SIZE + z * CHUNK_SIZE * WORLD_HEIGHT;
        this.blocks[idx] = blockId;
    }

    setBlocksFromWorker(blockArray) {
        this.blocks = new Uint8Array(blockArray);
        this.generated = true;
        this.generating = false;
    }

    generate(callback) {
        if (this.generated || this.generating) return;

        this.generating = true;

        if (chunkWorker) {
            const handler = (e) => {
                if (e.data.chunkX === this.x && e.data.chunkZ === this.z) {
                    this.setBlocksFromWorker(e.data.blocks);
                    callback?.(this);
                }
            };
            chunkWorker.onmessage = handler;
            chunkWorker.postMessage({ chunkX: this.x, chunkZ: this.z });
        } else {
            this.generated = true;
            this.generating = false;
            callback?.(this);
        }
    }
}

export class World {
    constructor(renderDistance = 8) {
        this.chunks = new Map();
        this.renderDistance = renderDistance;
        initChunkWorker();
    }

    getChunk(cx, cz) {
        const key = `${cx},${cz}`;
        if (!this.chunks.has(key)) {
            const chunk = new Chunk(cx, cz);
            chunk.generate((generatedChunk) => {
                this.onChunkGenerated?.(generatedChunk);
            });
            this.chunks.set(key, chunk);
        }
        return this.chunks.get(key);
    }

    getBlock(x, y, z) {
        if (y < 0 || y >= WORLD_HEIGHT) return BLOCKS.AIR;

        const cx = Math.floor(x / CHUNK_SIZE);
        const cz = Math.floor(z / CHUNK_SIZE);
        const lx = ((x % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
        const lz = ((z % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;

        const chunk = this.getChunk(cx, cz);
        return chunk.getBlock(lx, y, lz);
    }

    setBlock(x, y, z, blockId) {
        if (y < 0 || y >= WORLD_HEIGHT) return;

        const cx = Math.floor(x / CHUNK_SIZE);
        const cz = Math.floor(z / CHUNK_SIZE);
        const lx = ((x % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
        const lz = ((z % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;

        const chunk = this.getChunk(cx, cz);
        chunk.setBlock(lx, y, lz, blockId);
    }

    updateChunksAround(playerX, playerZ) {
        const playerChunkX = Math.floor(playerX / CHUNK_SIZE);
        const playerChunkZ = Math.floor(playerZ / CHUNK_SIZE);

        const chunksToKeep = new Set();
        for (let dx = -this.renderDistance; dx <= this.renderDistance; dx++) {
            for (let dz = -this.renderDistance; dz <= this.renderDistance; dz++) {
                const key = `${playerChunkX + dx},${playerChunkZ + dz}`;
                chunksToKeep.add(key);
                this.getChunk(playerChunkX + dx, playerChunkZ + dz);
            }
        }

        const toDelete = [];
        for (const [key] of this.chunks) {
            if (!chunksToKeep.has(key)) {
                toDelete.push(key);
            }
        }

        toDelete.forEach(key => this.chunks.delete(key));
    }
}
