export class PerformanceMonitor {
    constructor() {
        this.metrics = {
            fps: 0,
            frameTime: 0,
            memoryUsed: 0,
            chunkCount: 0,
            meshCount: 0,
            particleCount: 0,
            drawCalls: 0
        };

        this.history = {
            fps: [],
            frameTime: [],
            memoryUsed: []
        };

        this.maxHistoryLength = 60;
        this.enabled = false;
        this.lastFrameTime = performance.now();
        this.frameCount = 0;
        this.lastSecond = performance.now();
    }

    update(game) {
        if (!this.enabled) return;

        const now = performance.now();
        const deltaTime = now - this.lastFrameTime;
        this.lastFrameTime = now;

        this.metrics.frameTime = deltaTime;
        this.frameCount++;

        if (now - this.lastSecond >= 1000) {
            this.metrics.fps = this.frameCount;
            this.frameCount = 0;
            this.lastSecond = now;

            this.recordHistory('fps', this.metrics.fps);
            this.recordHistory('frameTime', this.metrics.frameTime);
        }

        if (performance.memory) {
            this.metrics.memoryUsed = Math.round(performance.memory.usedJSHeapSize / 1048576);
            this.recordHistory('memoryUsed', this.metrics.memoryUsed);
        }

        if (game) {
            this.metrics.chunkCount = game.world.chunks.size;
            this.metrics.meshCount = game.chunkMeshes.size;
            this.metrics.particleCount = game.particleSystem.activeCount || 0;
        }
    }

    recordHistory(metric, value) {
        if (!this.history[metric]) return;

        this.history[metric].push(value);
        if (this.history[metric].length > this.maxHistoryLength) {
            this.history[metric].shift();
        }
    }

    getAverageFPS() {
        if (this.history.fps.length === 0) return 0;
        const sum = this.history.fps.reduce((a, b) => a + b, 0);
        return Math.round(sum / this.history.fps.length);
    }

    getAverageFrameTime() {
        if (this.history.frameTime.length === 0) return 0;
        const sum = this.history.frameTime.reduce((a, b) => a + b, 0);
        return (sum / this.history.frameTime.length).toFixed(2);
    }

    getMetrics() {
        return {
            current: this.metrics,
            average: {
                fps: this.getAverageFPS(),
                frameTime: this.getAverageFrameTime()
            },
            history: this.history
        };
    }

    toggle() {
        this.enabled = !this.enabled;
        return this.enabled;
    }

    reset() {
        this.history.fps = [];
        this.history.frameTime = [];
        this.history.memoryUsed = [];
        this.frameCount = 0;
        this.lastSecond = performance.now();
    }
}
