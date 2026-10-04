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
    BIRCH_LOG: 15,
    BIRCH_LEAVES: 16,
    SPRUCE_LOG: 17,
    SPRUCE_LEAVES: 18,
    SPRUCE_WOOD: 19,
    DEEPSLATE: 20,
    COPPER_ORE: 21,
    TIN_ORE: 22,
    EMERALD_ORE: 23,
    LAVA: 24
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
    15: 'Birch Log',
    16: 'Birch Leaves',
    17: 'Spruce Log',
    18: 'Spruce Leaves',
    19: 'Spruce Wood',
    20: 'Deepslate',
    21: 'Copper Ore',
    22: 'Tin Ore',
    23: 'Emerald Ore',
    24: 'Lava'
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
    15: 0x7A5C3E,
    16: 0x1F5C1F,
    17: 0x4A3728,
    18: 0x0B4C0B,
    19: 0x6B4423,
    20: 0x3A3A3C,
    21: 0xB87333,
    22: 0xC0C0C0,
    23: 0x1AAE5A,
    24: 0xFF4500
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
    BLOCKS.BIRCH_LOG,
    BLOCKS.BIRCH_LEAVES,
    BLOCKS.SPRUCE_LOG,
    BLOCKS.SPRUCE_LEAVES,
    BLOCKS.SPRUCE_WOOD,
    BLOCKS.DEEPSLATE,
    BLOCKS.COPPER_ORE,
    BLOCKS.TIN_ORE,
    BLOCKS.EMERALD_ORE
]);

export const TRANSPARENT_BLOCKS = new Set([
    BLOCKS.WATER,
    BLOCKS.OAK_LEAVES,
    BLOCKS.BIRCH_LEAVES,
    BLOCKS.SPRUCE_LEAVES,
    BLOCKS.LAVA
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
