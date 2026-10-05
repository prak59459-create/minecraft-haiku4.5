export const BLOCKS = {
    AIR: 0,
    STONE: 1,
    GRASS: 2,
    DIRT: 3,
    COBBLESTONE: 4,
    OAK_LOG: 5,
    OAK_LEAVES: 6,
    SAND: 7,
    WATER: 8,
    GRAVEL: 9,
    BEDROCK: 10,
    COAL_ORE: 11,
    IRON_ORE: 12,
    GOLD_ORE: 13,
    DIAMOND_ORE: 14,
    OBSIDIAN: 15,
    LAVA: 16,
    CLAY: 17,
    MYCELIUM: 18
};

export const BLOCK_NAMES = {
    0: 'Air',
    1: 'Stone',
    2: 'Grass',
    3: 'Dirt',
    4: 'Cobblestone',
    5: 'Oak Log',
    6: 'Oak Leaves',
    7: 'Sand',
    8: 'Water',
    9: 'Gravel',
    10: 'Bedrock',
    11: 'Coal Ore',
    12: 'Iron Ore',
    13: 'Gold Ore',
    14: 'Diamond Ore',
    15: 'Obsidian',
    16: 'Lava',
    17: 'Clay',
    18: 'Mycelium'
};

export const BLOCK_COLORS = {
    0: 0x000000,
    1: 0x808080,
    2: 0x228B22,
    3: 0x8B7355,
    4: 0x696969,
    5: 0x654321,
    6: 0x2D5016,
    7: 0xEDD5B1,
    8: 0x4A90E2,
    9: 0x999999,
    10: 0x1A1A1A,
    11: 0x1A1A1A,
    12: 0xB8860B,
    13: 0xFFD700,
    14: 0x00CED1,
    15: 0x0F0F0F,
    16: 0xFF6600,
    17: 0x9B8B7E,
    18: 0x4B2F20
};

export const SOLID_BLOCKS = new Set([
    BLOCKS.STONE,
    BLOCKS.GRASS,
    BLOCKS.DIRT,
    BLOCKS.COBBLESTONE,
    BLOCKS.OAK_LOG,
    BLOCKS.OAK_LEAVES,
    BLOCKS.SAND,
    BLOCKS.GRAVEL,
    BLOCKS.BEDROCK,
    BLOCKS.COAL_ORE,
    BLOCKS.IRON_ORE,
    BLOCKS.GOLD_ORE,
    BLOCKS.DIAMOND_ORE,
    BLOCKS.OBSIDIAN,
    BLOCKS.LAVA,
    BLOCKS.CLAY,
    BLOCKS.MYCELIUM
]);

export const TRANSPARENT_BLOCKS = new Set([
    BLOCKS.WATER,
    BLOCKS.LAVA,
    BLOCKS.OAK_LEAVES
]);

export const LIGHT_EMITTING = new Set([
    BLOCKS.LAVA
]);

export function isBlockSolid(blockId) {
    return SOLID_BLOCKS.has(blockId);
}

export function isBlockTransparent(blockId) {
    return TRANSPARENT_BLOCKS.has(blockId);
}

export function getBlockBreakTime(blockId) {
    const breakTimes = {
        [BLOCKS.STONE]: 1.5,
        [BLOCKS.GRASS]: 0.6,
        [BLOCKS.DIRT]: 0.5,
        [BLOCKS.SAND]: 0.5,
        [BLOCKS.GRAVEL]: 0.6,
        [BLOCKS.OAK_LOG]: 2,
        [BLOCKS.OAK_LEAVES]: 0.2,
        [BLOCKS.COAL_ORE]: 3,
        [BLOCKS.IRON_ORE]: 5,
        [BLOCKS.GOLD_ORE]: 7.5,
        [BLOCKS.DIAMOND_ORE]: 5,
        [BLOCKS.OBSIDIAN]: 50,
        [BLOCKS.BEDROCK]: -1,
    };
    return breakTimes[blockId] || 0;
}
