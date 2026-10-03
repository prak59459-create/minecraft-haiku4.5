export class GameSettings {
    constructor() {
        this.settings = {
            renderDistance: 2,
            fov: 75,
            mouseSensitivity: 0.005,
            masterVolume: 0.3,
            headbob: true,
            shadowsEnabled: true,
            particlesEnabled: true,
            soundEnabled: true,
            vsyncEnabled: true,
            targetFPS: 60,
            textureQuality: 'high'
        };

        this.loadFromStorage();
    }

    get(key) {
        return this.settings[key];
    }

    set(key, value) {
        if (key in this.settings) {
            this.settings[key] = value;
            this.saveToStorage();
            return true;
        }
        return false;
    }

    loadFromStorage() {
        try {
            const stored = localStorage.getItem('minecraft-settings');
            if (stored) {
                const data = JSON.parse(stored);
                Object.assign(this.settings, data);
            }
        } catch (e) {
            console.warn('Failed to load settings from storage');
        }
    }

    saveToStorage() {
        try {
            localStorage.setItem('minecraft-settings', JSON.stringify(this.settings));
        } catch (e) {
            console.warn('Failed to save settings to storage');
        }
    }

    resetToDefaults() {
        this.settings = {
            renderDistance: 2,
            fov: 75,
            mouseSensitivity: 0.005,
            masterVolume: 0.3,
            headbob: true,
            shadowsEnabled: true,
            particlesEnabled: true,
            soundEnabled: true,
            vsyncEnabled: true,
            targetFPS: 60,
            textureQuality: 'high'
        };
        this.saveToStorage();
    }

    getAll() {
        return JSON.parse(JSON.stringify(this.settings));
    }
}
