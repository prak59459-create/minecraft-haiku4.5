export class PerformanceMonitor {
    constructor() {
        this.metrics = {
            fps: 0,
            frameTime: 0,
            updateTime: 0,
            renderTime: 0,
            physicsTime: 0,
            chunkLoadTime: 0,
            meshBuildTime: 0
        };

        this.samples = {
            fps: [],
            frameTime: [],
            renderTime: []
        };

        this.maxSamples = 60;
        this.lastTime = performance.now();
        this.frameCount = 0;
    }

    startMeasure(label) {
        this.marks = this.marks || {};
        this.marks[label] = performance.now();
    }

    endMeasure(label) {
        if (this.marks && this.marks[label]) {
            const duration = performance.now() - this.marks[label];
            this.metrics[label + 'Time'] = duration;
            delete this.marks[label];
            return duration;
        }
        return 0;
    }

    update() {
        this.frameCount++;
        const now = performance.now();
        const deltaTime = now - this.lastTime;

        if (deltaTime >= 1000) {
            this.metrics.fps = Math.round(this.frameCount * 1000 / deltaTime);
            this.frameCount = 0;
            this.lastTime = now;
        }

        this.metrics.frameTime = deltaTime;
        this.recordSample('fps', this.metrics.fps);
        this.recordSample('frameTime', this.metrics.frameTime);
    }

    recordSample(metric, value) {
        if (!this.samples[metric]) {
            this.samples[metric] = [];
        }

        this.samples[metric].push(value);
        if (this.samples[metric].length > this.maxSamples) {
            this.samples[metric].shift();
        }
    }

    getAverageFPS() {
        if (this.samples.fps.length === 0) return 0;
        const sum = this.samples.fps.reduce((a, b) => a + b, 0);
        return Math.round(sum / this.samples.fps.length);
    }

    getAverageFrameTime() {
        if (this.samples.frameTime.length === 0) return 0;
        const sum = this.samples.frameTime.reduce((a, b) => a + b, 0);
        return (sum / this.samples.frameTime.length).toFixed(2);
    }

    getMetrics() {
        return JSON.parse(JSON.stringify(this.metrics));
    }

    reset() {
        this.metrics = {
            fps: 0,
            frameTime: 0,
            updateTime: 0,
            renderTime: 0,
            physicsTime: 0,
            chunkLoadTime: 0,
            meshBuildTime: 0
        };
        this.samples = {
            fps: [],
            frameTime: [],
            renderTime: []
        };
    }
}
