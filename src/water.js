import * as THREE from 'three';

export class WaterSimulation {
    constructor(scene) {
        this.scene = scene;
        this.waterMaterial = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                waveAmplitude: { value: 0.1 },
                waveFrequency: { value: 2.0 },
                waterColor: { value: new THREE.Color(0x4488ff) }
            },
            vertexShader: `
                uniform float time;
                uniform float waveAmplitude;
                uniform float waveFrequency;

                varying float vWave;

                void main() {
                    float wave = sin(position.x * waveFrequency + time) * waveAmplitude;
                    wave += sin(position.z * waveFrequency + time) * waveAmplitude;

                    vec3 newPosition = position;
                    newPosition.y += wave;

                    vWave = wave;

                    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
                }
            `,
            fragmentShader: `
                uniform vec3 waterColor;
                varying float vWave;

                void main() {
                    vec3 color = waterColor;
                    float alpha = 0.6 + vWave * 0.2;
                    gl_FragColor = vec4(color, alpha);
                }
            `,
            transparent: true,
            side: THREE.DoubleSide
        });
    }

    getWaterMaterial() {
        return this.waterMaterial;
    }

    update(time) {
        this.waterMaterial.uniforms.time.value = time;
    }

    setWaterColor(color) {
        this.waterMaterial.uniforms.waterColor.value = color;
    }

    setWaveProperties(amplitude, frequency) {
        this.waterMaterial.uniforms.waveAmplitude.value = amplitude;
        this.waterMaterial.uniforms.waveFrequency.value = frequency;
    }
}

export class PlayerWaterInteraction {
    constructor() {
        this.isInWater = false;
        this.waterDrag = 0.2;
    }

    checkWaterCollision(player, world) {
        const block = world.getBlock(
            Math.floor(player.position.x),
            Math.floor(player.position.y + player.eyeHeight),
            Math.floor(player.position.z)
        );

        const waterBlockTypes = [6]; // WATER
        this.isInWater = waterBlockTypes.includes(block);

        if (this.isInWater) {
            player.velocity.x *= (1 - this.waterDrag);
            player.velocity.z *= (1 - this.waterDrag);
            player.velocity.y *= 0.95;
        }

        return this.isInWater;
    }

    applyBuoyancy(player) {
        if (this.isInWater) {
            player.velocity.y += 0.5;
            player.gravity = 10;
        } else {
            player.gravity = 20;
        }
    }
}
