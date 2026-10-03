export const BLOCK_TYPES = {
    AIR: 0,
    GRASS: 1,
    DIRT: 2,
    STONE: 3,
    WOOD: 4,
    LEAVES: 5,
    WATER: 6,
    SAND: 7,
    GRAVEL: 8,
    LOG: 9,
};

export const BLOCK_DATA = {
    [BLOCK_TYPES.AIR]: {
        name: 'Air',
        solid: false,
        transparent: true,
        colors: { top: 0xaabbff, side: 0xaabbff, bottom: 0xaabbff },
    },
    [BLOCK_TYPES.GRASS]: {
        name: 'Grass',
        solid: true,
        transparent: false,
        colors: { top: 0x2fa438, side: 0x8b7355, bottom: 0x654321 },
    },
    [BLOCK_TYPES.DIRT]: {
        name: 'Dirt',
        solid: true,
        transparent: false,
        colors: { top: 0x8b6914, side: 0x8b6914, bottom: 0x8b6914 },
    },
    [BLOCK_TYPES.STONE]: {
        name: 'Stone',
        solid: true,
        transparent: false,
        colors: { top: 0x888888, side: 0x888888, bottom: 0x888888 },
    },
    [BLOCK_TYPES.WOOD]: {
        name: 'Wood',
        solid: true,
        transparent: false,
        colors: { top: 0x654321, side: 0x8b5a2b, bottom: 0x654321 },
    },
    [BLOCK_TYPES.LEAVES]: {
        name: 'Leaves',
        solid: true,
        transparent: true,
        colors: { top: 0x228b22, side: 0x228b22, bottom: 0x228b22 },
    },
    [BLOCK_TYPES.WATER]: {
        name: 'Water',
        solid: false,
        transparent: true,
        colors: { top: 0x3366cc, side: 0x3366cc, bottom: 0x3366cc },
    },
    [BLOCK_TYPES.SAND]: {
        name: 'Sand',
        solid: true,
        transparent: false,
        colors: { top: 0xf4a460, side: 0xf4a460, bottom: 0xf4a460 },
    },
    [BLOCK_TYPES.GRAVEL]: {
        name: 'Gravel',
        solid: true,
        transparent: false,
        colors: { top: 0x999999, side: 0x999999, bottom: 0x999999 },
    },
    [BLOCK_TYPES.LOG]: {
        name: 'Log',
        solid: true,
        transparent: false,
        colors: { top: 0x8b4513, side: 0x654321, bottom: 0x8b4513 },
    },
};

export function getBlockData(type) {
    return BLOCK_DATA[type] || BLOCK_DATA[BLOCK_TYPES.AIR];
}

export function isBlockSolid(type) {
    const data = getBlockData(type);
    return data.solid;
}

export function isBlockTransparent(type) {
    const data = getBlockData(type);
    return data.transparent;
}
