export const DEFAULT_CONFIG = {
    // Rendering
    renderDistance: 8,
    shadowQuality: 'high',
    shadowMapSize: 2048,
    maxParticles: 1000,
    enableClouds: true,
    enableWater: true,
    enableShadows: true,

    // Physics
    gravity: 20,
    moveSpeed: 4.3,
    sprintSpeed: 5.6,
    jumpForce: 8,
    playerWidth: 0.6,
    playerHeight: 1.8,

    // Gameplay
    dayNightCycleTime: 600,
    renderDebug: false,
    enableAudio: true,
    volumeLevel: 0.5,

    // Terrain
    terrainScale: 0.1,
    terrainAmplitude: 20,
    terrainOctaves: 3,
    waterLevel: 62,
    treeChance: 0.03,

    // Camera
    mouseSensitivity: 0.004,
    fovDefault: 75,
    nearPlane: 0.1,
    farPlane: 1000,

    // Performance
    dynamicQuality: true,
    targetFps: 60,
    showFps: true,

    // Controls
    keyForward: 'KeyW',
    keyBackward: 'KeyS',
    keyLeft: 'KeyA',
    keyRight: 'KeyD',
    keyJump: 'Space',
    keySprint: 'ShiftLeft'
};

export class ConfigManager {
    constructor() {
        this.config = { ...DEFAULT_CONFIG };
        this.loadFromStorage();
    }

    get(key) {
        return this.config[key];
    }

    set(key, value) {
        this.config[key] = value;
        this.saveToStorage();
    }

    update(updates) {
        Object.assign(this.config, updates);
        this.saveToStorage();
    }

    getAll() {
        return { ...this.config };
    }

    reset() {
        this.config = { ...DEFAULT_CONFIG };
        this.saveToStorage();
    }

    saveToStorage() {
        try {
            localStorage.setItem('minecraft-config', JSON.stringify(this.config));
        } catch (e) {
            console.warn('Failed to save config to localStorage:', e);
        }
    }

    loadFromStorage() {
        try {
            const stored = localStorage.getItem('minecraft-config');
            if (stored) {
                const parsed = JSON.parse(stored);
                this.config = { ...DEFAULT_CONFIG, ...parsed };
            }
        } catch (e) {
            console.warn('Failed to load config from localStorage:', e);
        }
    }

    exportConfig() {
        return JSON.stringify(this.config, null, 2);
    }

    importConfig(configJson) {
        try {
            const parsed = JSON.parse(configJson);
            this.config = { ...DEFAULT_CONFIG, ...parsed };
            this.saveToStorage();
            return true;
        } catch (e) {
            console.error('Failed to import config:', e);
            return false;
        }
    }
}

export const config = new ConfigManager();
