export class ChunkManager {
    constructor(world, maxChunksLoaded = 200) {
        this.world = world;
        this.maxChunksLoaded = maxChunksLoaded;
        this.chunkLoadQueue = [];
        this.chunkUnloadQueue = [];
    }

    queueChunkLoad(cx, cz) {
        if (!this.world.chunks.has(`${cx},${cz}`)) {
            this.chunkLoadQueue.push({ cx, cz, priority: 0 });
        }
    }

    queueChunkUnload(cx, cz) {
        this.chunkUnloadQueue.push({ cx, cz });
    }

    processPendingLoads(maxPerFrame = 1) {
        let loaded = 0;
        while (loaded < maxPerFrame && this.chunkLoadQueue.length > 0) {
            const { cx, cz } = this.chunkLoadQueue.shift();
            this.world.getChunk(cx, cz);
            loaded++;
        }
    }

    processPendingUnloads(maxPerFrame = 2) {
        let unloaded = 0;
        while (unloaded < maxPerFrame && this.chunkUnloadQueue.length > 0) {
            const { cx, cz } = this.chunkUnloadQueue.shift();
            const key = `${cx},${cz}`;
            if (this.world.chunks.has(key)) {
                this.world.chunks.delete(key);
            }
            unloaded++;
        }
    }

    update(playerX, playerZ, renderDistance) {
        const playerChunkX = Math.floor(playerX / 16);
        const playerChunkZ = Math.floor(playerZ / 16);

        // Queue chunks to load around player
        for (let dx = -renderDistance; dx <= renderDistance; dx++) {
            for (let dz = -renderDistance; dz <= renderDistance; dz++) {
                const cx = playerChunkX + dx;
                const cz = playerChunkZ + dz;
                this.queueChunkLoad(cx, cz);
            }
        }

        // Queue chunks to unload that are far away
        for (const [key] of this.world.chunks) {
            const [cx, cz] = key.split(',').map(Number);
            const dist = Math.max(Math.abs(cx - playerChunkX), Math.abs(cz - playerChunkZ));
            if (dist > renderDistance + 2) {
                this.queueChunkUnload(cx, cz);
            }
        }

        // Process queued operations
        this.processPendingLoads(2);
        this.processPendingUnloads(1);
    }

    getLoadedChunkCount() {
        return this.world.chunks.size;
    }

    clearAllChunks() {
        this.world.chunks.clear();
        this.chunkLoadQueue = [];
        this.chunkUnloadQueue = [];
    }
}
