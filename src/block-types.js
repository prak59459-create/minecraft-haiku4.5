const BLOCK_TYPES = {
    AIR: 0,
    STONE: 1,
    DIRT: 2,
    GRASS: 3,
    COBBLESTONE: 4,
    OAK_LOG: 5,
    OAK_LEAVES: 6,
    SAND: 7,
    GRAVEL: 8,
    GOLD_ORE: 9,
    IRON_ORE: 10,
    COAL_ORE: 11,
    WATER: 12,
    GLASS: 13
};

const BLOCK_PROPERTIES = {
    [BLOCK_TYPES.AIR]: {
        name: 'Air',
        solid: false,
        transparent: true,
        color: [135, 206, 235],
        selectable: false
    },
    [BLOCK_TYPES.STONE]: {
        name: 'Stone',
        solid: true,
        transparent: false,
        color: [128, 128, 128],
        selectable: true
    },
    [BLOCK_TYPES.DIRT]: {
        name: 'Dirt',
        solid: true,
        transparent: false,
        color: [139, 119, 101],
        selectable: true
    },
    [BLOCK_TYPES.GRASS]: {
        name: 'Grass',
        solid: true,
        transparent: false,
        color: [34, 139, 34],
        selectable: true
    },
    [BLOCK_TYPES.COBBLESTONE]: {
        name: 'Cobblestone',
        solid: true,
        transparent: false,
        color: [100, 100, 100],
        selectable: true
    },
    [BLOCK_TYPES.OAK_LOG]: {
        name: 'Oak Log',
        solid: true,
        transparent: false,
        color: [139, 69, 19],
        selectable: true
    },
    [BLOCK_TYPES.OAK_LEAVES]: {
        name: 'Oak Leaves',
        solid: true,
        transparent: true,
        color: [34, 139, 34],
        selectable: true
    },
    [BLOCK_TYPES.SAND]: {
        name: 'Sand',
        solid: true,
        transparent: false,
        color: [238, 214, 175],
        selectable: true
    },
    [BLOCK_TYPES.GRAVEL]: {
        name: 'Gravel',
        solid: true,
        transparent: false,
        color: [169, 169, 169],
        selectable: true
    },
    [BLOCK_TYPES.GOLD_ORE]: {
        name: 'Gold Ore',
        solid: true,
        transparent: false,
        color: [184, 134, 11],
        selectable: true
    },
    [BLOCK_TYPES.IRON_ORE]: {
        name: 'Iron Ore',
        solid: true,
        transparent: false,
        color: [160, 82, 45],
        selectable: true
    },
    [BLOCK_TYPES.COAL_ORE]: {
        name: 'Coal Ore',
        solid: true,
        transparent: false,
        color: [64, 64, 64],
        selectable: true
    },
    [BLOCK_TYPES.WATER]: {
        name: 'Water',
        solid: false,
        transparent: true,
        color: [64, 164, 223],
        selectable: false
    },
    [BLOCK_TYPES.GLASS]: {
        name: 'Glass',
        solid: true,
        transparent: true,
        color: [200, 225, 255],
        selectable: true
    }
};

const SELECTABLE_BLOCKS = [
    BLOCK_TYPES.STONE,
    BLOCK_TYPES.DIRT,
    BLOCK_TYPES.GRASS,
    BLOCK_TYPES.COBBLESTONE,
    BLOCK_TYPES.OAK_LOG,
    BLOCK_TYPES.OAK_LEAVES,
    BLOCK_TYPES.SAND,
    BLOCK_TYPES.GRAVEL,
    BLOCK_TYPES.GOLD_ORE,
    BLOCK_TYPES.IRON_ORE,
    BLOCK_TYPES.COAL_ORE,
    BLOCK_TYPES.GLASS
];
