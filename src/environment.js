import * as THREE from 'three';
import { SimplexNoise } from 'simplex-noise';

export class CloudGenerator {
    constructor(scene) {
        this.scene = scene;
        this.clouds = [];
        this.noise = new SimplexNoise();
    }

    generateClouds() {
        const cloudCount = 40;

        for (let i = 0; i < cloudCount; i++) {
            const x = (Math.random() - 0.5) * 400;
            const y = 100 + Math.random() * 40;
            const z = (Math.random() - 0.5) * 400;

            const width = 20 + Math.random() * 20;
            const depth = 10 + Math.random() * 15;
            const height = 5 + Math.random() * 8;

            const geometry = new THREE.BoxGeometry(width, height, depth);
            const material = new THREE.MeshPhongMaterial({
                color: 0xffffff,
                transparent: true,
                opacity: 0.6,
                emissive: 0xffffff,
                emissiveIntensity: 0.1,
                side: THREE.BackSide
            });

            const cloud = new THREE.Mesh(geometry, material);
            cloud.position.set(x, y, z);
            cloud.castShadow = false;
            cloud.receiveShadow = false;

            this.scene.add(cloud);
            this.clouds.push({
                mesh: cloud,
                velocity: (Math.random() - 0.5) * 5
            });
        }
    }

    update(deltaTime) {
        for (let cloud of this.clouds) {
            cloud.mesh.position.x += cloud.velocity * deltaTime;

            if (cloud.mesh.position.x > 250) {
                cloud.mesh.position.x = -250;
            } else if (cloud.mesh.position.x < -250) {
                cloud.mesh.position.x = 250;
            }
        }
    }

    clear() {
        for (let cloud of this.clouds) {
            this.scene.remove(cloud.mesh);
            cloud.mesh.geometry.dispose();
            cloud.mesh.material.dispose();
        }
        this.clouds = [];
    }
}

export class WaterRenderer {
    constructor(scene) {
        this.scene = scene;
        this.waterMaterial = new THREE.MeshPhongMaterial({
            color: 0x4488ff,
            transparent: true,
            opacity: 0.6,
            wireframe: false,
            side: THREE.DoubleSide
        });
    }

    getWaterMaterial() {
        return this.waterMaterial;
    }

    updateWaterEffect(time) {
        const waveStrength = Math.sin(time * 2) * 0.02;
        this.waterMaterial.emissiveIntensity = 0.1 + Math.sin(time) * 0.05;
    }
}

export class Sky {
    constructor(scene) {
        this.scene = scene;
        this.skyColor = new THREE.Color(0x87ceeb);
    }

    setSkyColor(color) {
        this.skyColor.copy(color);
        this.scene.background = color;
        this.scene.fog.color = color;
    }

    updateFog(distance) {
        this.scene.fog.far = distance;
    }
}
