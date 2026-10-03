import * as THREE from 'three';

export class Environment {
    constructor(scene) {
        this.scene = scene;
        this.sunlight = null;
        this.ambientLight = null;
        this.timeOfDay = 0.25; // 0-1, where 0.25 is sunrise, 0.5 is noon
        this.cycleSpeed = 0.00005; // cycle per frame
    }

    update(delta) {
        this.timeOfDay += this.cycleSpeed * delta;
        if (this.timeOfDay >= 1) {
            this.timeOfDay -= 1;
        }

        this.updateLighting();
    }

    updateLighting() {
        // Calculate sun position (0.25 = sunrise, 0.5 = noon, 0.75 = sunset)
        const sunAngle = (this.timeOfDay - 0.25) * Math.PI * 2;
        const sunY = Math.sin(sunAngle) * 100;
        const sunX = Math.cos(sunAngle) * 100;

        if (this.sunlight) {
            this.sunlight.position.set(sunX, Math.max(sunY, 10), 100);

            // Adjust lighting based on time of day
            let lightIntensity = 0.4;
            if (this.timeOfDay >= 0.25 && this.timeOfDay < 0.75) {
                lightIntensity = 0.4 + 0.6 * Math.sin((this.timeOfDay - 0.25) * Math.PI);
            }
            this.sunlight.intensity = lightIntensity;
        }

        if (this.ambientLight) {
            let ambientIntensity = 0.3;
            if (this.timeOfDay >= 0.25 && this.timeOfDay < 0.75) {
                ambientIntensity = 0.3 + 0.4 * Math.sin((this.timeOfDay - 0.25) * Math.PI);
            }
            this.ambientLight.intensity = ambientIntensity;
        }

        // Update fog color based on time
        const fogColor = this.getFogColor();
        this.scene.fog.color.setHex(fogColor);
        this.scene.background.setHex(fogColor);
    }

    getFogColor() {
        // Blue sky during day, darker during night
        if (this.timeOfDay >= 0.25 && this.timeOfDay < 0.75) {
            const dayProgress = Math.sin((this.timeOfDay - 0.25) * Math.PI);
            const r = Math.round(135 + (200 - 135) * dayProgress);
            const g = Math.round(206 + (238 - 206) * dayProgress);
            const b = Math.round(235 + (255 - 235) * dayProgress);
            return (r << 16) | (g << 8) | b;
        } else {
            return 0x001a33; // Night sky
        }
    }

    setSunlight(sunlight) {
        this.sunlight = sunlight;
    }

    setAmbientLight(light) {
        this.ambientLight = light;
    }
}
