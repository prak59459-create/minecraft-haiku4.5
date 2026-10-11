export const BIOMES = {
    PLAINS: 'plains',
    FOREST: 'forest',
    DESERT: 'desert',
    SNOW: 'snow',
    MOUNTAIN: 'mountain',
    OCEAN: 'ocean'
};

export function getBiome(x, z, perlinNoise) {
    if (!perlinNoise) return BIOMES.PLAINS;

    const temperature = perlinNoise.noise2D(x * 0.01, z * 0.01);
    const humidity = perlinNoise.noise2D(x * 0.012, z * 0.012);
    const height = perlinNoise.noise2D(x * 0.003, z * 0.003);

    if (temperature > 0.4) return BIOMES.DESERT;
    if (temperature < -0.3) return BIOMES.SNOW;
    if (height > 0.3) return BIOMES.MOUNTAIN;
    if (humidity > 0.2 && temperature > -0.1) return BIOMES.FOREST;

    return BIOMES.PLAINS;
}

export function getBiomeColor(biome) {
    const colors = {
        [BIOMES.PLAINS]: 0x7FD87F,
        [BIOMES.FOREST]: 0x228B22,
        [BIOMES.DESERT]: 0xEDD5B1,
        [BIOMES.SNOW]: 0xF5FFFA,
        [BIOMES.MOUNTAIN]: 0x8B7355,
        [BIOMES.OCEAN]: 0x4A90E2
    };
    return colors[biome] || 0x7FD87F;
}
