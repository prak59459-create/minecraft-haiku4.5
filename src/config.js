export const GameConfig = {
    world: {
        chunkSize: 16,
        renderDistance: 3,
        worldHeight: 256,
        baseHeight: 64,
        waterLevel: 62,
        terrainScale: 50
    },

    player: {
        speed: 20,
        sprintSpeed: 30,
        jumpPower: 15,
        eyeHeight: 1.62,
        playerRadius: 0.3
    },

    physics: {
        gravity: -9.81 * 5,
        friction: 0.8,
        airResistance: 0.99
    },

    graphics: {
        renderWidth: window.innerWidth,
        renderHeight: window.innerHeight,
        fov: 75,
        near: 0.1,
        far: 1000,
        shadowMapSize: 2048,
        ambientLightIntensity: 0.6,
        directionalLightIntensity: 0.8
    },

    controls: {
        mouseSensitivity: 0.001,
        maxPitch: Math.PI / 2,
        minPitch: -Math.PI / 2
    },

    raycast: {
        maxDistance: 5,
        stepSize: 0.05
    }
};
