const Utils = {
    getChunkCoords: (x, z) => {
        return {
            x: Math.floor(x / CONFIG.CHUNK_SIZE),
            z: Math.floor(z / CONFIG.CHUNK_SIZE)
        };
    },

    getBlockCoords: (x, y, z) => {
        return {
            x: Math.floor(x),
            y: Math.floor(y),
            z: Math.floor(z)
        };
    },

    getLocalBlockCoords: (x, y, z) => {
        const chunkX = Math.floor(x / CONFIG.CHUNK_SIZE) * CONFIG.CHUNK_SIZE;
        const chunkZ = Math.floor(z / CONFIG.CHUNK_SIZE) * CONFIG.CHUNK_SIZE;

        return {
            x: x - chunkX,
            y: y,
            z: z - chunkZ
        };
    },

    chunkKey: (x, z) => `${x},${z}`,

    blockKey: (x, y, z) => `${x},${y},${z}`,

    lerp: (a, b, t) => a + (b - a) * t,

    smoothstep: (t) => t * t * (3 - 2 * t),

    clamp: (x, min, max) => Math.max(min, Math.min(max, x))
};
