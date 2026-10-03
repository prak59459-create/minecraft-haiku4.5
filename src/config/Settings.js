export class Settings {
    constructor() {
        this.settings = {
            graphics: {
                renderDistance: 8,
                particlesEnabled: true,
                waterShaderEnabled: false,
                fov: 75,
                mouseSensitivity: 0.002,
                brightness: 1.0,
                shadowsEnabled: true
            },
            audio: {
                soundsEnabled: true,
                musicEnabled: false,
                soundVolume: 0.7,
                musicVolume: 0.5
            },
            gameplay: {
                difficulty: 'normal',
                showHUD: true,
                showDebug: false,
                autoSave: false,
                autoSaveInterval: 300000 // 5 minutes
            },
            controls: {
                invertY: false,
                sprint: 'hold', // or 'toggle'
                crouchMode: 'hold'
            }
        };

        this.loadSettings();
    }

    getSetting(path) {
        const keys = path.split('.');
        let value = this.settings;

        for (const key of keys) {
            if (value && typeof value === 'object' && key in value) {
                value = value[key];
            } else {
                return null;
            }
        }

        return value;
    }

    setSetting(path, value) {
        const keys = path.split('.');
        let obj = this.settings;

        for (let i = 0; i < keys.length - 1; i++) {
            const key = keys[i];
            if (!(key in obj)) {
                obj[key] = {};
            }
            obj = obj[key];
        }

        obj[keys[keys.length - 1]] = value;
        this.saveSettings();
    }

    saveSettings() {
        try {
            localStorage.setItem('minecraft-settings', JSON.stringify(this.settings));
        } catch (e) {
            console.error('Failed to save settings:', e);
        }
    }

    loadSettings() {
        try {
            const saved = localStorage.getItem('minecraft-settings');
            if (saved) {
                const loaded = JSON.parse(saved);
                this.settings = { ...this.settings, ...loaded };
            }
        } catch (e) {
            console.error('Failed to load settings:', e);
        }
    }

    resetSettings() {
        this.settings = {
            graphics: {
                renderDistance: 8,
                particlesEnabled: true,
                waterShaderEnabled: false,
                fov: 75,
                mouseSensitivity: 0.002,
                brightness: 1.0,
                shadowsEnabled: true
            },
            audio: {
                soundsEnabled: true,
                musicEnabled: false,
                soundVolume: 0.7,
                musicVolume: 0.5
            },
            gameplay: {
                difficulty: 'normal',
                showHUD: true,
                showDebug: false,
                autoSave: false,
                autoSaveInterval: 300000
            },
            controls: {
                invertY: false,
                sprint: 'hold',
                crouchMode: 'hold'
            }
        };
        this.saveSettings();
    }

    getAll() {
        return JSON.parse(JSON.stringify(this.settings));
    }
}
