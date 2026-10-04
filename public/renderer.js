import * as THREE from 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.module.js';
import { CONFIG } from './config.js';

export class AdvancedRenderer {
  constructor(canvas) {
    this.renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: CONFIG.rendering.antialias,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFShadowShadowMap;
    this.renderer.shadowMap.autoUpdate = true;

    this.stats = {
      fps: 0,
      drawCalls: 0,
      triangles: 0,
      vertices: 0,
      totalMemory: 0
    };

    this.setupPerformanceMonitoring();
  }

  setupPerformanceMonitoring() {
    this.frameCount = 0;
    this.lastTime = Date.now();
    this.performanceInterval = setInterval(() => {
      const now = Date.now();
      this.stats.fps = this.frameCount;
      this.frameCount = 0;
      this.lastTime = now;
    }, 1000);
  }

  updateStats(scene) {
    this.frameCount++;

    let triangles = 0;
    let vertices = 0;
    let drawCalls = 0;

    scene.traverse((obj) => {
      if (obj.isMesh) {
        drawCalls++;
        if (obj.geometry) {
          const posAttr = obj.geometry.getAttribute('position');
          if (posAttr) {
            vertices += posAttr.count;
            if (obj.geometry.index) {
              triangles += obj.geometry.index.count / 3;
            } else {
              triangles += posAttr.count / 3;
            }
          }
        }
      }
    });

    this.stats.drawCalls = drawCalls;
    this.stats.triangles = Math.floor(triangles);
    this.stats.vertices = vertices;

    if (performance.memory) {
      this.stats.totalMemory = (performance.memory.usedJSHeapSize / 1048576).toFixed(2);
    }
  }

  render(scene, camera) {
    this.renderer.render(scene, camera);
  }

  getStats() {
    return this.stats;
  }

  resize(width, height) {
    this.renderer.setSize(width, height);
  }

  dispose() {
    clearInterval(this.performanceInterval);
    this.renderer.dispose();
  }

  getRenderer() {
    return this.renderer;
  }
}

export class SceneOptimizer {
  static optimizeScene(scene) {
    scene.traverse((obj) => {
      if (obj.isMesh) {
        obj.castShadow = true;
        obj.receiveShadow = true;

        if (obj.geometry) {
          obj.geometry.computeBoundingBox();
          obj.frustumCulled = true;
        }

        if (obj.material) {
          if (Array.isArray(obj.material)) {
            obj.material.forEach(mat => SceneOptimizer.optimizeMaterial(mat));
          } else {
            SceneOptimizer.optimizeMaterial(obj.material);
          }
        }
      }
    });
  }

  static optimizeMaterial(material) {
    material.side = THREE.DoubleSide;
    material.flatShading = true;

    if (material.map) {
      material.map.minFilter = THREE.LinearMipMapLinearFilter;
      material.map.magFilter = THREE.LinearFilter;
    }
  }

  static updateVisibility(scene, camera, maxDistance = 200) {
    const frustum = new THREE.Frustum();
    frustum.setFromProjectionMatrix(
      new THREE.Matrix4().multiplyMatrices(
        camera.projectionMatrix,
        camera.matrixWorldInverse
      )
    );

    let visibleObjects = 0;
    scene.traverse((obj) => {
      if (obj.isMesh) {
        if (obj.geometry && obj.geometry.boundingBox) {
          const distance = camera.position.distanceTo(obj.position);
          obj.visible = distance < maxDistance && frustum.intersectsBox(obj.geometry.boundingBox);
          if (obj.visible) visibleObjects++;
        }
      }
    });

    return visibleObjects;
  }
}

export class LODSystem {
  constructor(camera) {
    this.camera = camera;
    this.lodLevels = [
      { distance: 50, detail: 1.0 },
      { distance: 100, detail: 0.75 },
      { distance: 150, detail: 0.5 },
      { distance: 200, detail: 0.25 }
    ];
  }

  getLODLevel(distance) {
    for (const level of this.lodLevels) {
      if (distance < level.distance) {
        return level;
      }
    }
    return this.lodLevels[this.lodLevels.length - 1];
  }

  calculateDetail(object) {
    const distance = this.camera.position.distanceTo(object.position);
    return this.getLODLevel(distance).detail;
  }

  updateLOD(scene) {
    scene.traverse((obj) => {
      if (obj.userData.hasLOD) {
        const detail = this.calculateDetail(obj);
        obj.scale.multiplyScalar(detail);
      }
    });
  }
}
