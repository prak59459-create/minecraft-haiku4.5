import * as THREE from 'three';

export class WeatherSystem {
    constructor(scene) {
        this.scene = scene;
        this.isRaining = false;
        this.rainIntensity = 0;
        this.rainDrops = [];
        this.rainParticles = null;
        this.windVector = new THREE.Vector3(0.01, 0, 0);
    }

    startRain() {
        if (this.isRaining) return;
        this.isRaining = true;
        this.rainIntensity = 0;
    }

    stopRain() {
        this.isRaining = false;
        this.rainIntensity = 0;
    }

    updateRain() {
        if (this.isRaining && this.rainIntensity < 1) {
            this.rainIntensity += 0.01;
        } else if (!this.isRaining && this.rainIntensity > 0) {
            this.rainIntensity -= 0.01;
        }
    }

    getRainIntensity() {
        return this.rainIntensity;
    }

    setWind(x, z) {
        this.windVector.set(x, 0, z);
    }

    getWind() {
        return this.windVector;
    }
}
