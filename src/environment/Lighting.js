import * as THREE from 'three';

export class Lighting {
    constructor(scene) {
        this.scene = scene;
        this.timeOfDay = 0.5; // 0.0 = midnight, 0.5 = noon, 1.0 = next midnight
        this.lightLevel = 1.0;
        this.skyColor = new THREE.Color(0x87ceeb);
        this.fogColor = new THREE.Color(0x87ceeb);

        this.createLights();
    }

    createLights() {
        // Sun light
        this.sunLight = new THREE.DirectionalLight(0xffffff, 1);
        this.sunLight.castShadow = true;
        this.sunLight.shadow.mapSize.width = 2048;
        this.sunLight.shadow.mapSize.height = 2048;
        this.sunLight.shadow.camera.far = 200;
        this.sunLight.shadow.camera.left = -100;
        this.sunLight.shadow.camera.right = 100;
        this.sunLight.shadow.camera.top = 100;
        this.sunLight.shadow.camera.bottom = -100;
        this.scene.add(this.sunLight);

        // Ambient light for night
        this.ambientLight = new THREE.AmbientLight(0x4a4a6a, 0.3);
        this.scene.add(this.ambientLight);

        // Hemisphere light for better day/night
        this.hemisphereLight = new THREE.HemisphereLight(0x87ceeb, 0x3d3d4d, 0.6);
        this.scene.add(this.hemisphereLight);
    }

    update() {
        // Advance time
        this.timeOfDay += 0.00005; // Adjusts speed of day/night cycle
        if (this.timeOfDay >= 1.0) {
            this.timeOfDay -= 1.0;
        }

        this.updateLighting();
    }

    updateLighting() {
        // Calculate light based on time of day
        // 0-0.25: Night to sunrise
        // 0.25-0.5: Sunrise to noon
        // 0.5-0.75: Noon to sunset
        // 0.75-1.0: Sunset to night

        let brightness = 0;
        let sunAngle = this.timeOfDay * Math.PI * 2;

        if (this.timeOfDay < 0.23 || this.timeOfDay > 0.77) {
            // Night
            brightness = 0.2;
        } else if (this.timeOfDay >= 0.23 && this.timeOfDay < 0.27) {
            // Sunrise
            brightness = 0.2 + (this.timeOfDay - 0.23) / 0.04 * 0.8;
        } else if (this.timeOfDay >= 0.27 && this.timeOfDay < 0.5) {
            // Morning to noon
            brightness = 1.0;
        } else if (this.timeOfDay >= 0.5 && this.timeOfDay < 0.73) {
            // Noon to sunset
            brightness = 1.0;
        } else if (this.timeOfDay >= 0.73 && this.timeOfDay < 0.77) {
            // Sunset
            brightness = 1.0 - (this.timeOfDay - 0.73) / 0.04 * 0.8;
        }

        this.lightLevel = brightness;

        // Update sun position
        const sunHeight = Math.sin((this.timeOfDay - 0.25) * Math.PI * 2);
        const sunDistance = 150;
        this.sunLight.position.set(
            Math.cos(sunAngle) * sunDistance,
            Math.max(0, sunHeight * sunDistance),
            Math.sin(sunAngle) * sunDistance
        );

        // Update sun intensity
        this.sunLight.intensity = Math.max(0, brightness);

        // Update ambient light
        this.ambientLight.intensity = 0.3 + brightness * 0.3;

        // Update sky and fog colors
        const dayColor = new THREE.Color(0x87ceeb);
        const sunsetColor = new THREE.Color(0xff8844);
        const nightColor = new THREE.Color(0x0a0a1a);

        if (this.timeOfDay < 0.25) {
            // Night to sunrise
            const t = this.timeOfDay / 0.25;
            this.skyColor.lerpColors(nightColor, dayColor, t * 0.5);
        } else if (this.timeOfDay < 0.5) {
            // Sunrise to noon
            const t = (this.timeOfDay - 0.25) / 0.25;
            this.skyColor.lerpColors(dayColor, dayColor, t);
        } else if (this.timeOfDay < 0.75) {
            // Noon to sunset
            const t = (this.timeOfDay - 0.5) / 0.25;
            this.skyColor.lerpColors(dayColor, sunsetColor, t);
        } else {
            // Sunset to night
            const t = (this.timeOfDay - 0.75) / 0.25;
            this.skyColor.lerpColors(sunsetColor, nightColor, t);
        }

        this.fogColor.copy(this.skyColor);
    }
}
