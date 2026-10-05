export class ConfigLoader {
    static instance = null;
    static config = null;

    static getInstance() {
        if (!ConfigLoader.instance) {
            ConfigLoader.instance = new ConfigLoader();
        }
        return ConfigLoader.instance;
    }

    async loadConfig() {
        if (ConfigLoader.config) {
            return ConfigLoader.config;
        }

        try {
            const response = await fetch('config.json');
            ConfigLoader.config = await response.json();
            return ConfigLoader.config;
        } catch (error) {
            console.warn('Failed to load config.json, using defaults', error);
            return this.getDefaults();
        }
    }

    getDefaults() {
        return {
            world: {
                renderDistance: 8,
                seedOffset: 0,
                waterLevel: 62,
                bedrockLevel: 0
            },
            player: {
                speed: 0.1,
                sprintSpeed: 0.15,
                crouchSpeed: 0.05,
                jumpPower: 0.5,
                gravity: 0.02,
                mouseSensitivity: 0.003
            },
            graphics: {
                renderScale: 1.0,
                particleLimit: 2000,
                enableShadows: false,
                flatShading: true
            },
            performance: {
                enableNoiseCache: true,
                meshOptimization: true
            }
        };
    }

    get(path, defaultValue) {
        const keys = path.split('.');
        let value = ConfigLoader.config || this.getDefaults();

        for (const key of keys) {
            if (value && typeof value === 'object' && key in value) {
                value = value[key];
            } else {
                return defaultValue;
            }
        }

        return value;
    }
}
