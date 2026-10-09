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
    BRICKS: 15,
    OBSIDIAN: 16,
    EMERALD_ORE: 17
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
    15: 'Bricks',
    16: 'Obsidian',
    17: 'Emerald Ore'
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
    15: 0xA0522D,
    16: 0x0B0B0B,
    17: 0x50C878
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
    BLOCKS.BRICKS,
    BLOCKS.OBSIDIAN,
    BLOCKS.EMERALD_ORE
]);

export const TRANSPARENT_BLOCKS = new Set([
    BLOCKS.WATER,
    BLOCKS.OAK_LEAVES
]);

export const LIGHT_EMITTING = new Set([]);

export function isBlockSolid(blockId) {
    return SOLID_BLOCKS.has(blockId);
}

export function isBlockTransparent(blockId) {
    return TRANSPARENT_BLOCKS.has(blockId);
}
