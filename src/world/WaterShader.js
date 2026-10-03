import * as THREE from 'three';

export const WaterShaderMaterial = () => {
    return new THREE.ShaderMaterial({
        uniforms: {
            time: { value: 0 },
            waveIntensity: { value: 0.1 }
        },
        vertexShader: `
            uniform float time;
            uniform float waveIntensity;
            varying vec3 vPosition;

            void main() {
                vPosition = position;
                vec3 pos = position;

                // Add wave effect
                pos.y += sin(position.x * 0.5 + time * 0.5) * waveIntensity;
                pos.y += cos(position.z * 0.5 + time * 0.5) * waveIntensity;

                gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
            }
        `,
        fragmentShader: `
            uniform float time;
            varying vec3 vPosition;

            void main() {
                float wave = sin(vPosition.x * 2.0 + time) * 0.5 + 0.5;
                gl_FragColor = vec4(0.2, 0.4 + wave * 0.2, 0.8, 0.6);
            }
        `,
        transparent: true,
        side: THREE.DoubleSide
    });
};

export class WaterAnimation {
    constructor() {
        this.time = 0;
        this.speed = 0.001;
    }

    update(material) {
        this.time += this.speed;
        if (material.uniforms.time) {
            material.uniforms.time.value = this.time;
        }
    }
}
