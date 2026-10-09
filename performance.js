export class PerformanceMonitor {
    constructor() {
        this.frameStats = [];
        this.fps = 0;
        this.msPerFrame = 0;
        this.memoryUsage = 0;
        this.metrics = {
            renderTime: 0,
            physicsTime: 0,
            chunkLoadTime: 0,
            meshBuildTime: 0
        };
        this.maxFrames = 60;
    }

    startFrame() {
        this.frameStart = performance.now();
    }

    endFrame() {
        const frameEnd = performance.now();
        const frameTime = frameEnd - this.frameStart;

        this.frameStats.push(frameTime);
        if (this.frameStats.length > this.maxFrames) {
            this.frameStats.shift();
        }

        this.msPerFrame = frameTime;
        this.fps = Math.round(1000 / frameTime);
        this.updateMemoryUsage();
    }

    updateMemoryUsage() {
        if (performance.memory) {
            this.memoryUsage = Math.round(performance.memory.usedJSHeapSize / 1048576);
        }
    }

    startMetric(metricName) {
        if (!this.metricTimers) this.metricTimers = {};
        this.metricTimers[metricName] = performance.now();
    }

    endMetric(metricName) {
        if (!this.metricTimers || !this.metricTimers[metricName]) return;

        const time = performance.now() - this.metricTimers[metricName];
        if (this.metrics[metricName] !== undefined) {
            this.metrics[metricName] = time;
        }
        delete this.metricTimers[metricName];
    }

    getAverageFrameTime() {
        if (this.frameStats.length === 0) return 0;
        const sum = this.frameStats.reduce((a, b) => a + b, 0);
        return sum / this.frameStats.length;
    }

    getStats() {
        return {
            fps: this.fps,
            msPerFrame: this.msPerFrame,
            avgFrameTime: this.getAverageFrameTime(),
            memoryUsage: this.memoryUsage,
            metrics: { ...this.metrics },
            frameCount: this.frameStats.length
        };
    }

    getReport() {
        const stats = this.getStats();
        return `
FPS: ${stats.fps}
Frame Time: ${stats.msPerFrame.toFixed(2)}ms
Avg Frame Time: ${stats.avgFrameTime.toFixed(2)}ms
Memory: ${stats.memoryUsage}MB
Render: ${stats.metrics.renderTime.toFixed(2)}ms
Physics: ${stats.metrics.physicsTime.toFixed(2)}ms
Chunk Load: ${stats.metrics.chunkLoadTime.toFixed(2)}ms
Mesh Build: ${stats.metrics.meshBuildTime.toFixed(2)}ms
        `.trim();
    }

    reset() {
        this.frameStats = [];
        this.fps = 0;
        this.msPerFrame = 0;
        this.metrics = {
            renderTime: 0,
            physicsTime: 0,
            chunkLoadTime: 0,
            meshBuildTime: 0
        };
    }
}

export class PerformanceOptimizer {
    constructor(monitor) {
        this.monitor = monitor;
        this.targetFps = 60;
        this.adaptiveQuality = true;
        this.renderScale = 1.0;
        this.particleLimit = 3000;
        this.shadowsEnabled = true;
    }

    analyze() {
        const stats = this.monitor.getStats();

        if (this.adaptiveQuality) {
            if (stats.fps < this.targetFps * 0.8) {
                this.reduceQuality();
            } else if (stats.fps > this.targetFps * 1.1) {
                this.increaseQuality();
            }
        }

        return {
            shouldOptimize: stats.fps < this.targetFps,
            bottleneck: this.identifyBottleneck(stats),
            recommendation: this.getRecommendation(stats)
        };
    }

    identifyBottleneck(stats) {
        const metrics = stats.metrics;
        const maxMetric = Math.max(
            metrics.renderTime,
            metrics.physicsTime,
            metrics.chunkLoadTime,
            metrics.meshBuildTime
        );

        if (metrics.renderTime === maxMetric) return 'rendering';
        if (metrics.physicsTime === maxMetric) return 'physics';
        if (metrics.chunkLoadTime === maxMetric) return 'chunk_loading';
        if (metrics.meshBuildTime === maxMetric) return 'mesh_building';
        return 'unknown';
    }

    getRecommendation(stats) {
        const bottleneck = this.identifyBottleneck(stats);

        switch (bottleneck) {
            case 'rendering':
                return 'Reduce render distance or disable shadows';
            case 'physics':
                return 'Reduce collision check frequency';
            case 'chunk_loading':
                return 'Increase chunk loading delay';
            case 'mesh_building':
                return 'Optimize mesh generation or reduce chunk count';
            default:
                return 'No specific recommendation';
        }
    }

    reduceQuality() {
        if (this.renderScale > 0.5) {
            this.renderScale -= 0.1;
        }
        if (this.particleLimit > 500) {
            this.particleLimit = Math.floor(this.particleLimit * 0.8);
        }
    }

    increaseQuality() {
        if (this.renderScale < 1.0) {
            this.renderScale = Math.min(1.0, this.renderScale + 0.1);
        }
        if (this.particleLimit < 5000) {
            this.particleLimit = Math.floor(this.particleLimit * 1.2);
        }
    }

    getSettings() {
        return {
            renderScale: this.renderScale,
            particleLimit: this.particleLimit,
            shadowsEnabled: this.shadowsEnabled,
            adaptiveQuality: this.adaptiveQuality,
            targetFps: this.targetFps
        };
    }
}
