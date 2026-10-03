class PerformanceMonitor {
    constructor() {
        this.frameCount = 0;
        this.fps = 0;
        this.lastTime = Date.now();
        this.frameTime = 0;
        this.updateTime = 0;
        this.renderTime = 0;

        this.metrics = {
            triangles: 0,
            meshes: 0,
            drawCalls: 0,
            particles: 0,
            chunks: 0,
            lightingRecalculations: 0
        };

        this.samples = [];
        this.maxSamples = 60;
        this.rolling = false;
    }

    startFrame() {
        this.frameStartTime = performance.now();
    }

    endFrame() {
        this.frameCount++;
        const currentTime = Date.now();

        if (currentTime - this.lastTime >= 1000) {
            this.fps = this.frameCount;
            this.frameCount = 0;
            this.lastTime = currentTime;
        }

        this.frameTime = performance.now() - this.frameStartTime;
        this.samples.push({
            fps: this.fps,
            frameTime: this.frameTime,
            metrics: { ...this.metrics }
        });

        if (this.samples.length > this.maxSamples) {
            this.samples.shift();
        }
    }

    startUpdate() {
        this.updateStartTime = performance.now();
    }

    endUpdate() {
        this.updateTime = performance.now() - this.updateStartTime;
    }

    startRender() {
        this.renderStartTime = performance.now();
    }

    endRender() {
        this.renderTime = performance.now() - this.renderStartTime;
    }

    setMetric(name, value) {
        this.metrics[name] = value;
    }

    getAverageFPS() {
        if (this.samples.length === 0) return 0;
        const total = this.samples.reduce((sum, s) => sum + s.fps, 0);
        return Math.round(total / this.samples.length);
    }

    getAverageFrameTime() {
        if (this.samples.length === 0) return 0;
        const total = this.samples.reduce((sum, s) => sum + s.frameTime, 0);
        return (total / this.samples.length).toFixed(2);
    }

    getStats() {
        return {
            fps: this.fps,
            avgFps: this.getAverageFPS(),
            frameTime: this.frameTime.toFixed(2),
            avgFrameTime: this.getAverageFrameTime(),
            updateTime: this.updateTime.toFixed(2),
            renderTime: this.renderTime.toFixed(2),
            metrics: this.metrics
        };
    }

    getReport() {
        const stats = this.getStats();
        return `
FPS: ${stats.fps} (Avg: ${stats.avgFps})
Frame Time: ${stats.frameTime}ms (Avg: ${stats.avgFrameTime}ms)
Update: ${stats.updateTime}ms | Render: ${stats.renderTime}ms
Triangles: ${stats.metrics.triangles}
Meshes: ${stats.metrics.meshes}
Draw Calls: ${stats.metrics.drawCalls}
Particles: ${stats.metrics.particles}
Chunks: ${stats.metrics.chunks}
`;
    }
}

class MemoryMonitor {
    constructor() {
        this.samples = [];
        this.maxSamples = 100;
    }

    sampleMemory() {
        if (performance.memory) {
            const memory = {
                timestamp: Date.now(),
                usedMemory: performance.memory.usedJSHeapSize,
                totalMemory: performance.memory.totalJSHeapSize,
                limit: performance.memory.jsHeapSizeLimit
            };

            this.samples.push(memory);

            if (this.samples.length > this.maxSamples) {
                this.samples.shift();
            }

            return memory;
        }
        return null;
    }

    getMemoryUsage() {
        if (this.samples.length === 0) return null;

        const latest = this.samples[this.samples.length - 1];
        const usagePercent = (latest.usedMemory / latest.limit * 100).toFixed(2);

        return {
            used: (latest.usedMemory / 1024 / 1024).toFixed(2),
            total: (latest.totalMemory / 1024 / 1024).toFixed(2),
            limit: (latest.limit / 1024 / 1024).toFixed(2),
            percent: usagePercent
        };
    }

    getMemoryTrend() {
        if (this.samples.length < 2) return null;

        const first = this.samples[0].usedMemory;
        const last = this.samples[this.samples.length - 1].usedMemory;
        const diff = last - first;
        const trend = diff > 0 ? 'increasing' : 'decreasing';

        return {
            trend: trend,
            change: (diff / 1024 / 1024).toFixed(2)
        };
    }
}

class ProfilingTimer {
    constructor(name) {
        this.name = name;
        this.measurements = [];
        this.running = false;
        this.startTime = null;
    }

    start() {
        if (!this.running) {
            this.startTime = performance.now();
            this.running = true;
        }
    }

    end() {
        if (this.running) {
            const duration = performance.now() - this.startTime;
            this.measurements.push(duration);
            this.running = false;

            if (this.measurements.length > 100) {
                this.measurements.shift();
            }

            return duration;
        }
        return 0;
    }

    getAverage() {
        if (this.measurements.length === 0) return 0;
        const total = this.measurements.reduce((a, b) => a + b, 0);
        return (total / this.measurements.length).toFixed(2);
    }

    getMax() {
        if (this.measurements.length === 0) return 0;
        return Math.max(...this.measurements).toFixed(2);
    }

    getMin() {
        if (this.measurements.length === 0) return 0;
        return Math.min(...this.measurements).toFixed(2);
    }

    getReport() {
        return `${this.name}: Avg ${this.getAverage()}ms | Min ${this.getMin()}ms | Max ${this.getMax()}ms`;
    }
}
