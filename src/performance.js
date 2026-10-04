export class PerformanceMonitor {
    constructor() {
        this.metrics = {
            fps: 0,
            frameTime: 0,
            vertexCount: 0,
            geometryCount: 0,
            memoryUsage: 0
        };
        this.frameCount = 0;
        this.lastTime = performance.now();
        this.history = [];
        this.historySize = 60;
    }

    update(renderer) {
        const now = performance.now();
        const deltaTime = now - this.lastTime;

        this.frameCount++;
        this.metrics.frameTime = deltaTime;

        if (this.frameCount >= 60) {
            this.metrics.fps = Math.round(1000 / (deltaTime / this.frameCount));
            this.frameCount = 0;
        }

        if (renderer && renderer.info) {
            this.metrics.vertexCount = renderer.info.render.vertices;
            this.metrics.geometryCount = renderer.info.memory.geometries;
        }

        if (performance.memory) {
            this.metrics.memoryUsage = Math.round(performance.memory.usedJSHeapSize / 1048576);
        }

        this.history.push({ ...this.metrics, timestamp: now });
        if (this.history.length > this.historySize) {
            this.history.shift();
        }

        this.lastTime = now;
    }

    getMetrics() {
        return this.metrics;
    }

    getHistory() {
        return this.history;
    }

    getAverageFps() {
        if (this.history.length === 0) return 0;
        const sum = this.history.reduce((acc, m) => acc + m.fps, 0);
        return Math.round(sum / this.history.length);
    }

    getAverageFrameTime() {
        if (this.history.length === 0) return 0;
        const sum = this.history.reduce((acc, m) => acc + m.frameTime, 0);
        return (sum / this.history.length).toFixed(2);
    }
}

export class RenderQualityController {
    constructor(renderer) {
        this.renderer = renderer;
        this.quality = 'high';
        this.shadowMapSize = 2048;
    }

    setQuality(level) {
        this.quality = level;

        switch (level) {
            case 'low':
                this.shadowMapSize = 512;
                this.renderer.setPixelRatio(0.75);
                break;
            case 'medium':
                this.shadowMapSize = 1024;
                this.renderer.setPixelRatio(1);
                break;
            case 'high':
                this.shadowMapSize = 2048;
                this.renderer.setPixelRatio(1);
                break;
            case 'ultra':
                this.shadowMapSize = 4096;
                this.renderer.setPixelRatio(window.devicePixelRatio);
                break;
        }
    }

    adaptQuality(averageFps) {
        if (averageFps < 30) {
            this.setQuality('low');
        } else if (averageFps < 50) {
            this.setQuality('medium');
        } else if (averageFps < 120) {
            this.setQuality('high');
        } else {
            this.setQuality('ultra');
        }
    }
}
