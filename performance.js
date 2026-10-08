export class PerformanceMonitor {
    constructor() {
        this.metrics = {
            frameTime: 0,
            fps: 0,
            memory: 0,
            chunks: 0,
            meshes: 0,
            triangles: 0
        };
        this.frameTimeSamples = [];
        this.maxSamples = 60;
    }

    recordFrameTime(deltaMs) {
        this.frameTimeSamples.push(deltaMs);
        if (this.frameTimeSamples.length > this.maxSamples) {
            this.frameTimeSamples.shift();
        }

        const avgTime = this.frameTimeSamples.reduce((a, b) => a + b, 0) / this.frameTimeSamples.length;
        this.metrics.frameTime = avgTime;
        this.metrics.fps = Math.round(1000 / avgTime);
    }

    updateMetrics(gameState) {
        if (performance.memory) {
            this.metrics.memory = (performance.memory.usedJSHeapSize / 1048576).toFixed(1);
        }

        this.metrics.chunks = gameState.world.chunks.size;
        this.metrics.meshes = gameState.chunkMeshes.size;

        let triangles = 0;
        for (const mesh of gameState.chunkMeshes.values()) {
            if (mesh && mesh.geometry && mesh.geometry.getIndex()) {
                triangles += mesh.geometry.getIndex().count / 3;
            }
        }
        this.metrics.triangles = Math.floor(triangles);
    }

    getMetrics() {
        return { ...this.metrics };
    }

    shouldReduceRenderDistance() {
        return this.metrics.fps < 45;
    }

    shouldIncreaseRenderDistance() {
        return this.metrics.fps > 55;
    }
}
