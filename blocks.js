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
    BRICK: 16,
    SANDSTONE: 17,
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
    15: 'Obsidian',
    16: 'Brick',
    17: 'Sandstone',
    18: 'Snow',
    19: 'Ice'
};

export const BLOCK_COLORS = {
    0: 0x000000,
    1: 0x7F7F7F,
    2: 0x3DA33D,
    3: 0x9B7B57,
    4: 0x696969,
    5: 0x704020,
    6: 0x3D6B2F,
    7: 0xE8D7B8,
    8: 0x5BA3E0,
    9: 0xB0B0B0,
    10: 0x1A1A1A,
    11: 0x282828,
    12: 0xD4AF37,
    13: 0xFFEA00,
    14: 0x00E5FF,
    15: 0x0A0A1A,
    16: 0xD35F2F,
    17: 0xE5D4A0,
    18: 0xF0F0FF,
    19: 0x7FE5FF
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
    BLOCKS.BRICK,
    BLOCKS.SANDSTONE,
    BLOCKS.SNOW,
    BLOCKS.ICE
]);

export const TRANSPARENT_BLOCKS = new Set([
    BLOCKS.WATER,
    BLOCKS.OAK_LEAVES,
    BLOCKS.ICE
]);

export const LIGHT_EMITTING = new Set([]);

export function isBlockSolid(blockId) {
    return SOLID_BLOCKS.has(blockId);
}

export function isBlockTransparent(blockId) {
    return TRANSPARENT_BLOCKS.has(blockId);
}
