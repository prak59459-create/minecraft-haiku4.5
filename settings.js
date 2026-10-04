export class GameSettings {
    constructor() {
        this.settings = {
            graphics: {
                renderDistance: 8,
                shadowMapSize: 2048,
                particleLimit: 2000,
                fpsTarget: 60,
                enableFog: true,
                enableShadows: true,
                pixelRatio: 1
            },
            gameplay: {
                difficulty: 'normal',
                enablePvP: false,
                enableFlight: false,
                enableCreativeMode: false,
                autoSave: true,
                autoSaveInterval: 30000
            },
            audio: {
                enabled: true,
                masterVolume: 0.5,
                soundEffects: true,
                musicEnabled: false,
                musicVolume: 0.3
            },
            controls: {
                mouseSensitivity: 0.003,
                invertY: false,
                showCrosshair: true,
                showDebug: false
            },
            world: {
                seed: 0,
                worldType: 'normal',
                terrainScale: 1.0
            }
        };

        this.loadSettings();
    }

    loadSettings() {
        try {
            const saved = localStorage.getItem('minecraft_settings');
            if (saved) {
                const parsed = JSON.parse(saved);
                this.settings = { ...this.settings, ...parsed };
            }
        } catch (e) {
            console.warn('Failed to load settings:', e);
        }
    }

    saveSettings() {
        try {
            localStorage.setItem('minecraft_settings', JSON.stringify(this.settings));
        } catch (e) {
            console.warn('Failed to save settings:', e);
        }
    }

    getSetting(path) {
        const parts = path.split('.');
        let value = this.settings;

        for (const part of parts) {
            if (value && typeof value === 'object') {
                value = value[part];
            } else {
                return undefined;
            }
        }

        return value;
    }

    setSetting(path, value) {
        const parts = path.split('.');
        let current = this.settings;

        for (let i = 0; i < parts.length - 1; i++) {
            const part = parts[i];
            if (!current[part]) {
                current[part] = {};
            }
            current = current[part];
        }

        current[parts[parts.length - 1]] = value;
        this.saveSettings();
    }

    resetToDefaults() {
        localStorage.removeItem('minecraft_settings');
        this.settings = {
            graphics: {
                renderDistance: 8,
                shadowMapSize: 2048,
                particleLimit: 2000,
                fpsTarget: 60,
                enableFog: true,
                enableShadows: true,
                pixelRatio: 1
            },
            gameplay: {
                difficulty: 'normal',
                enablePvP: false,
                enableFlight: false,
                enableCreativeMode: false,
                autoSave: true,
                autoSaveInterval: 30000
            },
            audio: {
                enabled: true,
                masterVolume: 0.5,
                soundEffects: true,
                musicEnabled: false,
                musicVolume: 0.3
            },
            controls: {
                mouseSensitivity: 0.003,
                invertY: false,
                showCrosshair: true,
                showDebug: false
            },
            world: {
                seed: 0,
                worldType: 'normal',
                terrainScale: 1.0
            }
        };
    }

    exportSettings() {
        return JSON.stringify(this.settings, null, 2);
    }

    importSettings(jsonString) {
        try {
            const imported = JSON.parse(jsonString);
            this.settings = { ...this.settings, ...imported };
            this.saveSettings();
            return true;
        } catch (e) {
            console.error('Failed to import settings:', e);
            return false;
        }
    }

    getGraphicsProfile() {
        const rd = this.getSetting('graphics.renderDistance');
        if (rd <= 4) return 'low';
        if (rd <= 8) return 'medium';
        if (rd <= 12) return 'high';
        return 'ultra';
    }

    setGraphicsProfile(profile) {
        const profiles = {
            low: { renderDistance: 4, shadowMapSize: 512, particleLimit: 500 },
            medium: { renderDistance: 8, shadowMapSize: 1024, particleLimit: 1000 },
            high: { renderDistance: 12, shadowMapSize: 2048, particleLimit: 2000 },
            ultra: { renderDistance: 16, shadowMapSize: 4096, particleLimit: 3000 }
        };

        if (profiles[profile]) {
            Object.entries(profiles[profile]).forEach(([key, value]) => {
                this.setSetting(`graphics.${key}`, value);
            });
        }
    }
}
