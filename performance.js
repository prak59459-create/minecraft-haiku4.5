export class PerformanceMonitor {
    constructor() {
        this.metrics = {
            frameTime: [],
            chunkBuildTime: [],
            meshUpdateTime: [],
            rayCastTime: []
        };
        this.maxSamples = 60;
        this.startTime = performance.now();
    }

    recordFrameTime(deltaTime) {
        this.metrics.frameTime.push(deltaTime);
        if (this.metrics.frameTime.length > this.maxSamples) {
            this.metrics.frameTime.shift();
        }
    }

    recordChunkBuildTime(time) {
        this.metrics.chunkBuildTime.push(time);
        if (this.metrics.chunkBuildTime.length > this.maxSamples) {
            this.metrics.chunkBuildTime.shift();
        }
    }

    recordMeshUpdateTime(time) {
        this.metrics.meshUpdateTime.push(time);
        if (this.metrics.meshUpdateTime.length > this.maxSamples) {
            this.metrics.meshUpdateTime.shift();
        }
    }

    recordRayCastTime(time) {
        this.metrics.rayCastTime.push(time);
        if (this.metrics.rayCastTime.length > this.maxSamples) {
            this.metrics.rayCastTime.shift();
        }
    }

    getAverageFrameTime() {
        if (this.metrics.frameTime.length === 0) return 0;
        const sum = this.metrics.frameTime.reduce((a, b) => a + b, 0);
        return (sum / this.metrics.frameTime.length).toFixed(2);
    }

    getAverageChunkBuildTime() {
        if (this.metrics.chunkBuildTime.length === 0) return 0;
        const sum = this.metrics.chunkBuildTime.reduce((a, b) => a + b, 0);
        return (sum / this.metrics.chunkBuildTime.length).toFixed(2);
    }

    getAverageMeshUpdateTime() {
        if (this.metrics.meshUpdateTime.length === 0) return 0;
        const sum = this.metrics.meshUpdateTime.reduce((a, b) => a + b, 0);
        return (sum / this.metrics.meshUpdateTime.length).toFixed(2);
    }

    getAverageRayCastTime() {
        if (this.metrics.rayCastTime.length === 0) return 0;
        const sum = this.metrics.rayCastTime.reduce((a, b) => a + b, 0);
        return (sum / this.metrics.rayCastTime.length).toFixed(2);
    }

    getUptime() {
        return Math.floor((performance.now() - this.startTime) / 1000);
    }

    getReport() {
        return {
            averageFrameTime: this.getAverageFrameTime(),
            averageChunkBuildTime: this.getAverageChunkBuildTime(),
            averageMeshUpdateTime: this.getAverageMeshUpdateTime(),
            averageRayCastTime: this.getAverageRayCastTime(),
            uptime: this.getUptime()
        };
    }

    reset() {
        this.metrics = {
            frameTime: [],
            chunkBuildTime: [],
            meshUpdateTime: [],
            rayCastTime: []
        };
    }
}
