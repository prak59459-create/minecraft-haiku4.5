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
    OAK_PLANK: 15,
    GLASS: 16,
    BRICKS: 17,
    SNOW: 18,
    ICE: 19
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
    15: 'Oak Plank',
    16: 'Glass',
    17: 'Bricks',
    18: 'Snow',
    19: 'Ice'
};

export const BLOCK_COLORS = {
    0: 0x000000,
    1: 0x7F7F7F,
    2: 0x3CB371,
    3: 0xA0826D,
    4: 0x6B6B6B,
    5: 0x5C3317,
    6: 0x3D5016,
    7: 0xF5DEB3,
    8: 0x1E90FF,
    9: 0xA9A9A9,
    10: 0x0D0D0D,
    11: 0x3D3D3D,
    12: 0xC0A020,
    13: 0xFFED4E,
    14: 0x00E5FF,
    15: 0xD2A679,
    16: 0xE8F4F8,
    17: 0xB83D3D,
    18: 0xF0F8FF,
    19: 0x9FCFFF
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
    BLOCKS.OAK_PLANK,
    BLOCKS.GLASS,
    BLOCKS.BRICKS,
    BLOCKS.SNOW,
    BLOCKS.ICE
]);

export const TRANSPARENT_BLOCKS = new Set([
    BLOCKS.WATER,
    BLOCKS.OAK_LEAVES,
    BLOCKS.GLASS,
    BLOCKS.ICE
]);

export const LIGHT_EMITTING = new Set([]);

export function isBlockSolid(blockId) {
    return SOLID_BLOCKS.has(blockId);
}

export function isBlockTransparent(blockId) {
    return TRANSPARENT_BLOCKS.has(blockId);
}
