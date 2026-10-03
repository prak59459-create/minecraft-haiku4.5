class PerformanceMonitor {
    constructor() {
        this.metrics = {
            fps: 0,
            drawCalls: 0,
            chunksLoaded: 0,
            vertexCount: 0,
            triangleCount: 0,
            frameTime: 0
        };

        this.frameCount = 0;
        this.frameTimeSum = 0;
        this.lastTime = performance.now();
        this.fpsCheckInterval = 500;
        this.lastFpsCheck = this.lastTime;
    }

    recordFrame(drawCalls, chunksLoaded, vertexCount) {
        const now = performance.now();
        const deltaTime = now - this.lastTime;
        this.lastTime = now;

        this.frameTimeSum += deltaTime;
        this.frameCount++;

        this.metrics.drawCalls = drawCalls;
        this.metrics.chunksLoaded = chunksLoaded;
        this.metrics.vertexCount = vertexCount;
        this.metrics.triangleCount = Math.floor(vertexCount / 3);
        this.metrics.frameTime = deltaTime;

        if (now - this.lastFpsCheck >= this.fpsCheckInterval) {
            this.metrics.fps = Math.round(this.frameCount / ((now - this.lastFpsCheck) / 1000));
            this.frameCount = 0;
            this.lastFpsCheck = now;
        }

        return this.metrics;
    }

    getReport() {
        return {
            fps: this.metrics.fps,
            frameTime: `${this.metrics.frameTime.toFixed(2)}ms`,
            drawCalls: this.metrics.drawCalls,
            chunks: this.metrics.chunksLoaded,
            vertices: (this.metrics.vertexCount / 1000).toFixed(1) + 'k',
            triangles: (this.metrics.triangleCount / 1000).toFixed(1) + 'k'
        };
    }
}

class ChunkMeshOptimizer {
    static optimizeFaces(positions, colors, indices) {
        const faces = [];
        for (let i = 0; i < indices.length; i += 6) {
            faces.push({
                indices: indices.slice(i, i + 6),
                positions: positions.slice(i * 3, (i + 6) * 3),
                colors: colors.slice(i * 3, (i + 6) * 3)
            });
        }
        return faces;
    }

    static calculateMemoryUsage(vertexCount) {
        const vertexData = vertexCount * 3 * 4;
        const colorData = vertexCount * 3 * 4;
        const indexData = vertexCount * 4;
        return (vertexData + colorData + indexData) / (1024 * 1024);
    }

    static estimateDrawTime(vertexCount) {
        return vertexCount / 1000000;
    }
}

class RenderOptimizer {
    constructor(renderer, camera, scene) {
        this.renderer = renderer;
        this.camera = camera;
        this.scene = scene;
        this.frustum = new THREE.Frustum();
        this.matrix = new THREE.Matrix4();
        this.visibleChunks = new Set();
    }

    updateFrustum() {
        this.matrix.multiplyMatrices(
            this.camera.projectionMatrix,
            this.camera.matrixWorldInverse
        );
        this.frustum.setFromProjectionMatrix(this.matrix);
    }

    isChunkVisible(chunkMesh) {
        if (!chunkMesh) return false;
        const boundingBox = new THREE.Box3().setFromObject(chunkMesh);
        const sphere = boundingBox.getBoundingSphere(new THREE.Sphere());
        return this.frustum.containsPoint(sphere.center) ||
               this.frustum.containsPoint(sphere.center.clone().add(new THREE.Vector3(CHUNK_SIZE, 0, 0))) ||
               this.frustum.containsPoint(sphere.center.clone().add(new THREE.Vector3(0, 0, CHUNK_SIZE)));
    }

    getVisibleChunks(chunkGroup) {
        this.updateFrustum();
        const visible = [];

        chunkGroup.children.forEach(chunk => {
            if (this.isChunkVisible(chunk)) {
                visible.push(chunk);
            }
        });

        return visible;
    }
}

class DetailLevelManager {
    static getDetailLevel(distance) {
        if (distance < 5) return 'high';
        if (distance < 10) return 'medium';
        if (distance < 15) return 'low';
        return 'ultra-low';
    }

    static shouldRenderChunk(distance, renderDistance) {
        return distance <= renderDistance * CHUNK_SIZE + CHUNK_SIZE;
    }

    static isChunkInViewport(position, cameraPosition) {
        const distance = position.distanceTo(cameraPosition);
        return distance < (RENDER_DISTANCE + 1) * CHUNK_SIZE * Math.sqrt(3);
    }
}
