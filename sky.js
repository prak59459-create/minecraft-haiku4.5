export class SkyRenderer {
    constructor(scene) {
        this.scene = scene;
        this.time = 0;
        this.cloudMeshes = [];
        this.setupSky();
    }

    setupSky() {
        // Sky dome would be more complex, so we'll use the scene background
        // which is already being updated in the game loop
    }

    update(timeOfDay) {
        this.time = timeOfDay;
    }

    getSkyColor(timeOfDay) {
        const color = new THREE.Color();

        if (timeOfDay < 0.25) {
            // Night to sunrise
            const t = timeOfDay / 0.25;
            color.setHSL(0.55, 0.6, 0.15 + t * 0.35);
        } else if (timeOfDay < 0.5) {
            // Sunrise to day
            const t = (timeOfDay - 0.25) / 0.25;
            color.setHSL(0.58 + t * 0.02, 0.7 + t * 0.1, 0.5 + t * 0.25);
        } else if (timeOfDay < 0.75) {
            // Day to sunset
            const t = (timeOfDay - 0.5) / 0.25;
            color.setHSL(0.6 - t * 0.15, 0.6 - t * 0.1, 0.75 - t * 0.2);
        } else {
            // Sunset to night
            const t = (timeOfDay - 0.75) / 0.25;
            color.setHSL(0.55 - t * 0.15, 0.5 - t * 0.2, 0.55 - t * 0.4);
        }

        return color;
    }

    getLightIntensity(timeOfDay) {
        if (timeOfDay < 0.25) {
            // Night
            return 0.15 + (timeOfDay / 0.25) * 0.35;
        } else if (timeOfDay < 0.5) {
            // Morning to noon
            return 0.5 + ((timeOfDay - 0.25) / 0.25) * 0.3;
        } else if (timeOfDay < 0.75) {
            // Noon to evening
            return 0.8 - ((timeOfDay - 0.5) / 0.25) * 0.25;
        } else {
            // Evening to night
            return 0.55 - ((timeOfDay - 0.75) / 0.25) * 0.4;
        }
    }
}
