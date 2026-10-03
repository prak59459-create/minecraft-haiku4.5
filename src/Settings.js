export class Settings {
    constructor() {
        this.load();
    }

    load() {
        const saved = localStorage.getItem('minecraftSettings');
        if (saved) {
            const settings = JSON.parse(saved);
            Object.assign(this, settings);
        } else {
            this.setDefaults();
        }
    }

    setDefaults() {
        this.renderDistance = 8;
        this.fov = 75;
        this.mouseSensitivity = 1.0;
        this.soundVolume = 0.7;
        this.viewDistance = 500;
        this.fogDistance = 1000;
    }

    save() {
        localStorage.setItem('minecraftSettings', JSON.stringify({
            renderDistance: this.renderDistance,
            fov: this.fov,
            mouseSensitivity: this.mouseSensitivity,
            soundVolume: this.soundVolume,
            viewDistance: this.viewDistance,
            fogDistance: this.fogDistance
        }));
    }

    setRenderDistance(distance) {
        this.renderDistance = Math.max(2, Math.min(16, distance));
        this.save();
    }

    setFOV(fov) {
        this.fov = Math.max(30, Math.min(120, fov));
        this.save();
    }

    setMouseSensitivity(sensitivity) {
        this.mouseSensitivity = Math.max(0.1, Math.min(3.0, sensitivity));
        this.save();
    }
}
