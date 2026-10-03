const GameConfig = {
    world: {
        seed: 12345,
        renderDistance: 8,
        chunkSize: 16,
        chunkHeight: 256,
        seaLevel: 62,
        worldBorder: 10000
    },
    player: {
        startX: 0,
        startY: 80,
        startZ: 0,
        speed: 0.15,
        sprintSpeed: 0.25,
        jumpForce: 0.6,
        gravity: 0.015,
        collisionRadius: 0.3,
        collisionHeight: 1.8,
        eyeHeight: 0.62
    },
    graphics: {
        fov: 75,
        drawDistance: 1000,
        fogDistance: 200,
        shadowMapResolution: 2048,
        antialias: true,
        maxPixelRatio: 2,
        shadows: true
    },
    particles: {
        maxParticles: 5000,
        destructionParticleCount: 8,
        particleMaxAge: 100
    },
    terrain: {
        minHeight: 50,
        maxHeight: 120,
        noiseScale1: 0.01,
        noiseScale2: 0.05,
        noiseScale3: 0.1,
        noiseScale4: 0.2
    },
    performance: {
        enableShadows: true,
        enableFog: true,
        enableParticles: true,
        chunkUpdateInterval: 1,
        maxChunksPerFrame: 4
    },
    controls: {
        mouseSpeed: 0.001,
        invertMouse: false,
        enablePointerLock: true
    },
    dayNight: {
        dayLength: 1200,
        timescale: 1.0,
        enableCycle: true
    },
    debug: {
        showFPS: true,
        showPosition: true,
        showChunkInfo: true,
        wireframe: false,
        showCollision: false
    }
};

const GameDefaults = {
    hotbarSize: 9,
    defaultSelectedBlock: 3,
    blockTypes: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
};

function loadConfig(userConfig = {}) {
    const mergeConfig = (target, source) => {
        const result = { ...target };
        for (const key in source) {
            if (typeof source[key] === 'object' && !Array.isArray(source[key])) {
                result[key] = mergeConfig(target[key] || {}, source[key]);
            } else {
                result[key] = source[key];
            }
        }
        return result;
    };

    return mergeConfig(GameConfig, userConfig);
}

function saveConfig(config) {
    try {
        localStorage.setItem('gameConfig', JSON.stringify(config));
    } catch (e) {
        console.warn('Failed to save config:', e);
    }
}

function getSavedConfig() {
    try {
        const saved = localStorage.getItem('gameConfig');
        return saved ? JSON.parse(saved) : {};
    } catch (e) {
        console.warn('Failed to load saved config:', e);
        return {};
    }
}
