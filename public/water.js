import * as THREE from 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.module.js';

export class WaterShader {
  static getVertexShader() {
    return `
      uniform float time;
      varying vec2 vUv;
      varying float vWave;

      void main() {
        vUv = uv;

        vec3 pos = position;
        float wave = sin(pos.x * 0.1 + time * 2.0) * 0.05 + sin(pos.z * 0.1 + time * 1.5) * 0.05;
        pos.y += wave;

        vWave = wave;

        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `;
  }

  static getFragmentShader() {
    return `
      varying vec2 vUv;
      varying float vWave;
      uniform samplerCube envMap;

      void main() {
        vec3 waterColor = vec3(0.2, 0.4, 0.8);
        vec3 foam = vec3(1.0) * max(0.0, vWave * 2.0);

        vec3 finalColor = mix(waterColor, waterColor + foam, 0.3);

        gl_FragColor = vec4(finalColor, 0.7);
      }
    `;
  }

  static createMaterial() {
    return new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 }
      },
      vertexShader: this.getVertexShader(),
      fragmentShader: this.getFragmentShader(),
      transparent: true,
      side: THREE.DoubleSide,
      fog: true
    });
  }
}

export class WaterRenderer {
  constructor(scene) {
    this.scene = scene;
    this.waterMeshes = new Map();
    this.waterMaterial = WaterShader.createMaterial();
    this.time = 0;
  }

  updateWater(deltaTime) {
    this.time += deltaTime;
    this.waterMaterial.uniforms.time.value = this.time;
  }

  getWaterBlockColor() {
    return new THREE.Color(0x3366cc);
  }

  addWaterTransparency(mesh) {
    if (mesh.material) {
      mesh.material.transparent = true;
      mesh.material.opacity = 0.8;
    }
  }

  isWaterBlock(block) {
    return block === 6;
  }
}
