export const WORLD_CONFIG = {
    // Chunk settings
    chunkSize: 16,
    chunkHeight: 64,
    renderDistance: 8,
    maxLoadedChunks: 256,

    // Terrain settings
    seed: 12345,
    waterLevel: 5,
    beachHeight: 7,

    // Physics settings
    gravity: 0.08,
    jumpForce: 0.5,
    moveSpeed: 0.15,
    sprintSpeed: 0.3,
    playerRadius: 0.3,
    playerHeight: 1.6,
    blockReachDistance: 5,

    // Camera settings
    fov: 75,
    nearClip: 0.1,
    farClip: 1000,
    fogFar: 500,
    fogNear: 200,

    // Graphics settings
    shadowMapSize: 2048,
    maxParticles: 1000,
    particleLifetime: 1.0,

    // Performance settings
    targetFPS: 60,
    adaptiveQuality: true,
    enableParticles: true,
    enableSounds: true,
    enableWaterShader: false
};

export const BLOCK_CONFIG = {
    size: 1,
    textureSize: 16,
    tilesPerTexture: 16
};

export const CONTROLS = {
    forward: 'w',
    backward: 's',
    left: 'a',
    right: 'd',
    jump: ' ',
    sprint: 'shift',
    destroy: 'mouse0',
    place: 'mouse2'
};
