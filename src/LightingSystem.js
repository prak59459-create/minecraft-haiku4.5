import * as THREE from 'three';

export class LightingSystem {
    constructor(scene) {
        this.scene = scene;
        this.ambientLight = null;
        this.directionalLight = null;
        this.time = 0;
        this.cycleLength = 30;

        this.setupLights();
    }

    setupLights() {
        this.ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(this.ambientLight);

        this.directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        this.directionalLight.position.set(100, 150, 100);
        this.directionalLight.castShadow = true;
        this.directionalLight.shadow.mapSize.width = 2048;
        this.directionalLight.shadow.mapSize.height = 2048;
        this.directionalLight.shadow.camera.left = -200;
        this.directionalLight.shadow.camera.right = 200;
        this.directionalLight.shadow.camera.top = 200;
        this.directionalLight.shadow.camera.bottom = -200;
        this.directionalLight.shadow.camera.near = 0.5;
        this.directionalLight.shadow.camera.far = 500;
        this.scene.add(this.directionalLight);
    }

    update(deltaTime, scene) {
        this.time += deltaTime;
        const cycleFraction = (this.time % this.cycleLength) / this.cycleLength;

        const sunAngle = cycleFraction * Math.PI * 2;
        const sunHeight = Math.sin(sunAngle);
        const sunIntensity = Math.max(0.15, Math.cos(sunAngle * 0.5) * 0.5 + 0.5);

        this.directionalLight.position.set(
            Math.cos(sunAngle) * 150,
            Math.max(30, sunHeight * 120 + 50),
            Math.sin(sunAngle) * 150
        );

        this.directionalLight.intensity = sunIntensity * 0.8;
        this.ambientLight.intensity = Math.max(0.15, sunIntensity * 0.5);

        const skyColor = this.interpolateColor(
            0x87ceeb,
            0x1a1a2e,
            Math.max(0, -sunHeight) * 0.5
        );

        const fogColor = this.interpolateColor(
            0x87ceeb,
            0x0a0a0a,
            Math.max(0, -sunHeight) * 0.7
        );

        scene.background.setHex(skyColor);
        scene.fog.color.setHex(fogColor);
    }

    interpolateColor(c1, c2, t) {
        const r1 = (c1 >> 16) & 255;
        const g1 = (c1 >> 8) & 255;
        const b1 = c1 & 255;

        const r2 = (c2 >> 16) & 255;
        const g2 = (c2 >> 8) & 255;
        const b2 = c2 & 255;

        const r = Math.round(r1 + (r2 - r1) * t);
        const g = Math.round(g1 + (g2 - g1) * t);
        const b = Math.round(b1 + (b2 - b1) * t);

        return (r << 16) | (g << 8) | b;
    }

    getCyclePhase() {
        return (this.time % this.cycleLength) / this.cycleLength;
    }

    isDaytime() {
        const phase = this.getCyclePhase();
        return phase < 0.75 && phase > 0.25;
    }
}
