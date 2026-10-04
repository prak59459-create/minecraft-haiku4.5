export class Config {
    static async load() {
        try {
            const response = await fetch('config.json');
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const config = await response.json();
            Config.data = Config.merge(Config.getDefaults(), config);
            return Config.data;
        } catch (error) {
            console.warn('Could not load config.json, using defaults:', error);
            Config.data = Config.getDefaults();
            return Config.data;
        }
    }

    static merge(defaults, custom) {
        const result = { ...defaults };
        for (const key in custom) {
            if (typeof custom[key] === 'object' && custom[key] !== null) {
                result[key] = this.merge(defaults[key] || {}, custom[key]);
            } else {
                result[key] = custom[key];
            }
        }
        return result;
    }

    static getDefaults() {
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
                mouseSensitivity: 0.003,
                eyeHeight: 0.85,
                height: 1.8,
                width: 0.6
            },
            raycast: {
                distance: 6,
                stepSize: 0.05
            },
            graphics: {
                renderScale: 1.0,
                shadowMapSize: 2048,
                particleLimit: 2000,
                fpsTarget: 60
            },
            terrain: {
                chunkSize: 16,
                maxHeight: 160,
                minHeight: 20,
                seaLevel: 62,
                treeFrequency: 0.5
            },
            audio: {
                enabled: true,
                masterVolume: 0.5,
                soundFx: true,
                music: false
            }
        };
    }

    static get(path) {
        const keys = path.split('.');
        let value = Config.data;
        for (const key of keys) {
            value = value[key];
            if (value === undefined) return undefined;
        }
        return value;
    }

    static set(path, value) {
        const keys = path.split('.');
        let obj = Config.data;
        for (let i = 0; i < keys.length - 1; i++) {
            if (!obj[keys[i]]) obj[keys[i]] = {};
            obj = obj[keys[i]];
        }
        obj[keys[keys.length - 1]] = value;
    }
}

Config.data = Config.getDefaults();
