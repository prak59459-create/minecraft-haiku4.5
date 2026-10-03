export class Optimization {
    constructor() {
        this.stats = {
            meshes: 0,
            vertices: 0,
            triangles: 0,
            calls: 0
        };
        this.targetFPS = 60;
        this.lastFrameTime = 0;
    }

    updateStats(renderer) {
        if (renderer.info) {
            this.stats.meshes = renderer.info.memory.geometries || 0;
            this.stats.vertices = renderer.info.render.vertices || 0;
            this.stats.triangles = renderer.info.render.triangles || 0;
            this.stats.calls = renderer.info.render.calls || 0;
        }
    }

    shouldLimitQuality(fps) {
        return fps < this.targetFPS * 0.8;
    }

    optimizeWorldRender(world) {
        // Reduce chunk render distance if FPS is low
        if (world.renderDistance > 1) {
            world.renderDistance = Math.max(1, world.renderDistance - 1);
        }
    }

    normalizeWorldRender(world) {
        // Increase chunk render distance when FPS is good
        if (world.renderDistance < 3) {
            world.renderDistance = Math.min(3, world.renderDistance + 1);
        }
    }
}

export function benchmarkScene(scene, camera, renderer) {
    const startTime = performance.now();
    const frameCount = 60;

    for (let i = 0; i < frameCount; i++) {
        renderer.render(scene, camera);
    }

    const endTime = performance.now();
    const totalTime = endTime - startTime;
    const avgFrameTime = totalTime / frameCount;
    const fps = 1000 / avgFrameTime;

    return { avgFrameTime, fps, totalTime };
}
