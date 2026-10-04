// Game configuration and tunable parameters

export const Config = {
    // World settings
    world: {
        chunkSize: 16,
        chunkHeight: 128,
        renderDistance: 10,
        seaLevel: 62
    },

    // Player settings
    player: {
        height: 1.7,
        width: 0.6,
        walkSpeed: 4.3,
        sprintSpeed: 5.612,
        crouchSpeed: 1.3,
        jumpForce: 12,
        gravity: 24,
        mouseSensitivity: 0.003
    },

    // Camera settings
    camera: {
        fov: 75,
        near: 0.1,
        far: 1000,
        fogNear: 150,
        fogFar: 400
    },

    // Rendering settings
    rendering: {
        antialias: true,
        shadows: true,
        pixelRatioMax: 2,
        clearColor: 0x87ceeb
    },

    // Lighting settings
    lighting: {
        sunIntensity: 1.0,
        ambientIntensity: 0.5,
        minAmbient: 0.3,
        shadowMapSize: 2048,
        shadowCameraSize: 100,
        shadowCameraFar: 200
    },

    // Audio settings
    audio: {
        masterVolume: 0.5,
        sfxVolume: 0.7,
        musicVolume: 0.3
    },

    // Particle settings
    particles: {
        destructionCount: 8,
        maxParticles: 1000
    },

    // Inventory settings
    inventory: {
        slots: 9,
        maxStackSize: 64
    },

    // Debug settings
    debug: {
        showStats: true,
        showChunkBoundaries: false,
        disableFog: false
    }
};

// Derived settings (calculated from base settings)
export const DerivedConfig = {
    world: {
        viewDistance: Config.world.chunkSize * Config.world.renderDistance
    }
};
