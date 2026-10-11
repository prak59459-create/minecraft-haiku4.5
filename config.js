export class Config {
    static async load() {
        try {
            const response = await fetch('config.json');
            const config = await response.json();
            Config.data = config;
            return config;
        } catch (error) {
            console.warn('Could not load config.json, using defaults');
            Config.data = Config.getDefaults();
            return Config.data;
        }
    }

    static getDefaults() {
        return {
            world: {
                renderDistance: 10,
                seedOffset: 0,
                waterLevel: 62,
                bedrockLevel: 0
            },
            player: {
                speed: 0.12,
                sprintSpeed: 0.18,
                crouchSpeed: 0.06,
                jumpPower: 0.55,
                gravity: 0.025,
                mouseSensitivity: 0.003,
                eyeHeight: 0.85,
                height: 1.8,
                width: 0.6
            },
            raycast: {
                distance: 6,
                stepSize: 0.02
            },
            graphics: {
                renderScale: 1.0,
                shadowMapSize: 2048,
                particleLimit: 512,
                fpsTarget: 60,
                adaptiveQuality: true,
                maxChunksPerFrame: 4
            },
            terrain: {
                chunkSize: 16,
                maxHeight: 160,
                minHeight: 20,
                seaLevel: 62,
                treeFrequency: 0.5,
                caveFrequency: 0.35,
                oreRarity: 0.5
            },
            audio: {
                enabled: true,
                masterVolume: 0.3,
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
