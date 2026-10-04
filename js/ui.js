class UI {
    constructor(player, world) {
        this.player = player;
        this.world = world;
        this.frameCount = 0;
        this.lastTime = Date.now();
        this.fps = 60;
        this.lastBlockCount = 0;
    }

    update() {
        this.frameCount++;
        const now = Date.now();
        if (now - this.lastTime >= 1000) {
            this.fps = this.frameCount;
            this.frameCount = 0;
            this.lastTime = now;
        }

        const pos = this.player.position;
        const chunkX = Math.floor(pos.x / CHUNK_SIZE);
        const chunkZ = Math.floor(pos.z / CHUNK_SIZE);
        const timeOfDay = (game.time % 1) * 24;
        const timePeriod = timeOfDay < 12 ? 'Day' : 'Night';

        // Count loaded blocks
        let totalBlocksLoaded = 0;
        for (const chunk of this.world.chunks.values()) {
            if (chunk.generated) {
                totalBlocksLoaded += CHUNK_SIZE * CHUNK_SIZE * CHUNK_HEIGHT;
            }
        }

        const chunksCount = this.world.chunks.size;

        document.getElementById('fps').textContent = this.fps;
        document.getElementById('pos').textContent = `${pos.x.toFixed(1)}, ${pos.y.toFixed(1)}, ${pos.z.toFixed(1)}`;
        document.getElementById('chunk').textContent = `${chunkX}, ${chunkZ} (${chunksCount} chunks)`;
        document.getElementById('time').textContent = timePeriod + ` (${timeOfDay.toFixed(1)}h)`;
        document.getElementById('blocks').textContent = `${chunksCount}`;
    }
}
