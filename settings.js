export class GameSettings {
    constructor() {
        this.settings = {
            graphics: {
                renderDistance: 8,
                shadowQuality: 'medium',
                antialiasing: true,
                fog: true
            },
            audio: {
                masterVolume: 0.5,
                soundEffects: true,
                music: false
            },
            gameplay: {
                mouseSensitivity: 0.003,
                autoJump: true,
                particles: true
            },
            interface: {
                showDebug: false,
                showHelp: false,
                crosshairType: 'crosshair'
            }
        };
        this.loadFromLocalStorage();
    }

    get(path) {
        const keys = path.split('.');
        let current = this.settings;
        for (const key of keys) {
            if (current[key] === undefined) return null;
            current = current[key];
        }
        return current;
    }

    set(path, value) {
        const keys = path.split('.');
        let current = this.settings;
        for (let i = 0; i < keys.length - 1; i++) {
            const key = keys[i];
            if (current[key] === undefined) current[key] = {};
            current = current[key];
        }
        current[keys[keys.length - 1]] = value;
        this.saveToLocalStorage();
    }

    saveToLocalStorage() {
        try {
            localStorage.setItem('minecraft_settings', JSON.stringify(this.settings));
        } catch (e) {
            console.warn('Failed to save settings:', e);
        }
    }

    loadFromLocalStorage() {
        try {
            const saved = localStorage.getItem('minecraft_settings');
            if (saved) {
                const loaded = JSON.parse(saved);
                this.settings = this.mergeSettings(this.settings, loaded);
            }
        } catch (e) {
            console.warn('Failed to load settings:', e);
        }
    }

    mergeSettings(defaults, loaded) {
        const merged = { ...defaults };
        for (const key in loaded) {
            if (typeof loaded[key] === 'object' && loaded[key] !== null) {
                merged[key] = this.mergeSettings(defaults[key] || {}, loaded[key]);
            } else {
                merged[key] = loaded[key];
            }
        }
        return merged;
    }

    reset() {
        localStorage.removeItem('minecraft_settings');
        this.settings = {
            graphics: {
                renderDistance: 8,
                shadowQuality: 'medium',
                antialiasing: true,
                fog: true
            },
            audio: {
                masterVolume: 0.5,
                soundEffects: true,
                music: false
            },
            gameplay: {
                mouseSensitivity: 0.003,
                autoJump: true,
                particles: true
            },
            interface: {
                showDebug: false,
                showHelp: false,
                crosshairType: 'crosshair'
            }
        };
    }
}
