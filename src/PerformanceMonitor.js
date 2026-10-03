export class PerformanceMonitor {
    constructor() {
        this.metrics = {
            fps: 0,
            frameTime: 0,
            memoryUsage: 0,
            drawCalls: 0
        };
        this.frameCount = 0;
        this.accumulatedTime = 0;
        this.lastUpdate = performance.now();
    }

    update() {
        const now = performance.now();
        const delta = now - this.lastUpdate;
        this.lastUpdate = now;

        this.accumulatedTime += delta;
        this.frameCount++;
        this.metrics.frameTime = delta;

        if (this.accumulatedTime >= 1000) {
            this.metrics.fps = this.frameCount;
            this.frameCount = 0;
            this.accumulatedTime = 0;

            if (performance.memory) {
                this.metrics.memoryUsage = Math.round(performance.memory.usedJSHeapSize / 1048576);
            }
        }
    }

    getMetrics() {
        return { ...this.metrics };
    }

    getFPSString() {
        return this.metrics.fps.toFixed(0);
    }

    getMemoryString() {
        return this.metrics.memoryUsage ? `${this.metrics.memoryUsage} MB` : 'N/A';
    }

    getFrameTimeString() {
        return this.metrics.frameTime.toFixed(2) + ' ms';
    }
}
