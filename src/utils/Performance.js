export class PerformanceOptimizer {
    constructor(renderer) {
        this.renderer = renderer;
        this.targetFPS = 60;
        this.adaptiveQuality = true;
        this.maxDrawCalls = 1000;

        this.stats = {
            fps: 0,
            renderTime: 0,
            meshCount: 0,
            triangleCount: 0
        };
    }

    optimizeChunkMeshes(chunks) {
        // Combine meshes where possible to reduce draw calls
        let meshCount = 0;
        let triangleCount = 0;

        for (const chunk of chunks) {
            if (chunk.mesh) {
                chunk.mesh.traverse((obj) => {
                    if (obj.geometry) {
                        meshCount++;
                        if (obj.geometry.index) {
                            triangleCount += obj.geometry.index.count / 3;
                        }
                    }
                });
            }
        }

        this.stats.meshCount = meshCount;
        this.stats.triangleCount = triangleCount;
    }

    shouldLowerQuality(fps) {
        return fps < this.targetFPS * 0.7;
    }

    shouldRaiseQuality(fps) {
        return fps > this.targetFPS * 0.95;
    }

    optimizeMemory(scene) {
        // Clean up unused geometries and materials
        const usedGeometries = new Set();
        const usedMaterials = new Set();

        scene.traverse((obj) => {
            if (obj.geometry) usedGeometries.add(obj.geometry);
            if (obj.material) {
                if (Array.isArray(obj.material)) {
                    obj.material.forEach(m => usedMaterials.add(m));
                } else {
                    usedMaterials.add(obj.material);
                }
            }
        });

        return {
            geometries: usedGeometries.size,
            materials: usedMaterials.size
        };
    }
}
