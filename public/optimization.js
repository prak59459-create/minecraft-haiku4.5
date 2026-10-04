export class ChunkOptimizer {
  constructor() {
    this.frustum = null;
    this.cameraPosition = null;
  }

  updateFrustum(camera) {
    if (!this.frustum) {
      const THREE = window.THREE || {};
      this.frustum = new (THREE.Frustum || class {})();
    }
    this.frustum.setFromProjectionMatrix(
      new (window.THREE?.Matrix4 || class {})().multiplyMatrices(
        camera.projectionMatrix,
        camera.matrixWorldInverse
      )
    );
    this.cameraPosition = camera.position.clone();
  }

  shouldRenderChunk(chunkPos, chunkSize) {
    if (!this.cameraPosition) return true;
    const distSq = this.cameraPosition.distanceToSquared(chunkPos);
    return distSq < (chunkSize * 5) * (chunkSize * 5);
  }

  calculateLOD(distance) {
    if (distance < 50) return 0;
    if (distance < 100) return 1;
    if (distance < 150) return 2;
    return 3;
  }
}

export class MeshCombiner {
  static combineChunkMeshes(chunks, maxDistance = 100) {
    const THREE = window.THREE;
    const combined = {};

    for (const chunk of chunks) {
      if (!chunk.mesh) continue;

      const meshes = chunk.mesh.children || [chunk.mesh];
      for (const mesh of meshes) {
        const matKey = mesh.material?.uuid || 'default';
        if (!combined[matKey]) {
          combined[matKey] = {
            geometry: new THREE.BufferGeometry(),
            material: mesh.material,
            meshes: []
          };
        }
        combined[matKey].meshes.push(mesh);
      }
    }

    return combined;
  }

  static createInstancedMesh(meshes, material) {
    if (!meshes || meshes.length === 0) return null;

    const THREE = window.THREE;
    const count = meshes.length;
    const baseGeometry = meshes[0].geometry;

    const instancedGeometry = baseGeometry.clone();
    const positions = [];
    const matrix = new THREE.Matrix4();

    meshes.forEach((mesh, index) => {
      mesh.updateMatrix();
      const instanceMatrix = new THREE.Matrix4().copy(mesh.matrix);
      positions.push(instanceMatrix.elements);
    });

    return new THREE.InstancedMesh(instancedGeometry, material, count);
  }
}

export class RenderStats {
  constructor() {
    this.frameCount = 0;
    this.fps = 0;
    this.lastTime = Date.now();
    this.drawCalls = 0;
    this.triangles = 0;
    this.vertices = 0;
  }

  update() {
    this.frameCount++;
    const now = Date.now();
    if (now - this.lastTime >= 1000) {
      this.fps = this.frameCount;
      this.frameCount = 0;
      this.lastTime = now;
    }
    return this.fps;
  }

  calculateMeshStats(scene) {
    this.drawCalls = 0;
    this.triangles = 0;
    this.vertices = 0;

    scene.traverse((obj) => {
      if (obj.isMesh) {
        this.drawCalls++;
        if (obj.geometry) {
          const posAttr = obj.geometry.getAttribute('position');
          if (posAttr) {
            this.vertices += posAttr.count;
            if (obj.geometry.index) {
              this.triangles += obj.geometry.index.count / 3;
            }
          }
        }
      }
    });

    return {
      fps: this.fps,
      drawCalls: this.drawCalls,
      triangles: Math.floor(this.triangles),
      vertices: this.vertices
    };
  }
}
