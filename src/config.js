const CONFIG = {
    // World settings
    CHUNK_SIZE: 16,
    CHUNK_HEIGHT: 128,
    RENDER_DISTANCE: 8,
    WORLD_SEED: 42,

    // Block settings
    BLOCK_SIZE: 1,

    // Player settings
    PLAYER_HEIGHT: 1.7,
    PLAYER_WIDTH: 0.6,
    PLAYER_SPEED: 4.3,
    PLAYER_SPRINT_SPEED: 5.6,
    PLAYER_JUMP_FORCE: 10,
    GRAVITY: 20,

    // Camera settings
    MOUSE_SENSITIVITY: 0.003,
    FOV: 75,

    // Rendering
    RENDER_CHUNKS: true,
    SHADOW_MAP_SIZE: 1024,
    FOG_COLOR: 0x87ceeb,
    FOG_NEAR: 20,
    FOG_FAR: 300,

    // Day/night cycle
    DAY_DURATION: 20 * 60 * 1000,
    NIGHT_START: 12.5,
    NIGHT_END: 23.5
};
