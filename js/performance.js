class PerformanceMonitor {
    constructor() {
        this.stats = {
            fps: 0,
            frameTime: 0,
            chunksLoaded: 0,
            blocksLoaded: 0,
            drawCalls: 0,
            memory: 0
        };

        this.frameStart = 0;
        this.frameCount = 0;
        this.lastCheck = Date.now();
    }

    startFrame() {
        this.frameStart = performance.now();
    }

    endFrame() {
        const now = Date.now();
        this.stats.frameTime = performance.now() - this.frameStart;
        this.frameCount++;

        if (now - this.lastCheck >= 1000) {
            this.stats.fps = this.frameCount;
            this.frameCount = 0;
            this.lastCheck = now;

            // Estimate memory usage
            if (performance.memory) {
                this.stats.memory = Math.round(performance.memory.usedJSHeapSize / 1048576);
            }
        }
    }

    update(world) {
        this.stats.chunksLoaded = world.meshes.size;
        this.stats.blocksLoaded = world.meshes.size * 65536; // 16*16*256
    }

    getReport() {
        return {
            fps: this.stats.fps,
            frameTime: this.stats.frameTime.toFixed(2) + 'ms',
            chunksLoaded: this.stats.chunksLoaded,
            blocksLoaded: this.stats.blocksLoaded,
            memory: this.stats.memory + 'MB'
        };
    }
}
