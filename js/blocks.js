const BLOCKS = {
    AIR: 0,
    STONE: 1,
    GRASS: 2,
    DIRT: 3,
    COBBLESTONE: 4,
    WOOD: 5,
    LEAVES: 6,
    SAND: 7,
    GRAVEL: 8,
    WATER: 9,
    OAK_LOG: 10,
    BOOKSHELF: 11
};

const BLOCK_INFO = {
    0: { name: 'air', color: 0x87ceeb, solid: false },
    1: { name: 'stone', color: 0x7f7f7f, solid: true },
    2: { name: 'grass', color: 0x7cb342, solid: true },
    3: { name: 'dirt', color: 0x8b7355, solid: true },
    4: { name: 'cobblestone', color: 0x696969, solid: true },
    5: { name: 'wood', color: 0x8b4513, solid: true },
    6: { name: 'leaves', color: 0x228b22, solid: true, transparent: true },
    7: { name: 'sand', color: 0xf4a460, solid: true },
    8: { name: 'gravel', color: 0xa9a9a9, solid: true },
    9: { name: 'water', color: 0x4fa3ff, solid: false, liquid: true },
    10: { name: 'oak_log', color: 0x704214, solid: true },
    11: { name: 'bookshelf', color: 0x8b6f47, solid: true }
};

function getBlockColor(blockId) {
    return BLOCK_INFO[blockId]?.color || 0xffffff;
}

function isBlockSolid(blockId) {
    return BLOCK_INFO[blockId]?.solid || false;
}

function isBlockTransparent(blockId) {
    return BLOCK_INFO[blockId]?.transparent || false;
}

function isBlockLiquid(blockId) {
    return BLOCK_INFO[blockId]?.liquid || false;
}
