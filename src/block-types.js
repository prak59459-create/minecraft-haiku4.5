export const BLOCK = {
    AIR: 0,
    GRASS: 1,
    DIRT: 2,
    STONE: 3,
    COBBLESTONE: 4,
    SAND: 5,
    LOG: 6,
    PLANKS: 7,
    LEAVES: 8,
    GLASS: 9,
    WATER: 10,
    BEDROCK: 11
};

function rgb(hex) {
    return [((hex >> 16) & 255) / 255, ((hex >> 8) & 255) / 255, (hex & 255) / 255];
}

function def(name, top, side = top, bottom = side, opts = {}) {
    return {
        name,
        top: rgb(top),
        side: rgb(side),
        bottom: rgb(bottom),
        hex: opts.icon ?? side,
        solid: opts.solid ?? true,
        opaque: opts.opaque ?? true,
        transparent: opts.transparent ?? false,
        targetable: opts.targetable ?? true,
        breakable: opts.breakable ?? true
    };
}

// Indexed by block id for fast lookup in hot loops.
export const BLOCK_INFO = [];
BLOCK_INFO[BLOCK.AIR] = def('Air', 0, 0, 0, { solid: false, opaque: false, targetable: false });
BLOCK_INFO[BLOCK.GRASS] = def('Grass', 0x5fa83a, 0x7d6a45, 0x866043, { icon: 0x5fa83a });
BLOCK_INFO[BLOCK.DIRT] = def('Dirt', 0x866043);
BLOCK_INFO[BLOCK.STONE] = def('Stone', 0x8a8a8a);
BLOCK_INFO[BLOCK.COBBLESTONE] = def('Cobblestone', 0x6e6e6e);
BLOCK_INFO[BLOCK.SAND] = def('Sand', 0xdccf9a);
BLOCK_INFO[BLOCK.LOG] = def('Log', 0xa58652, 0x6b4f2c, 0xa58652);
BLOCK_INFO[BLOCK.PLANKS] = def('Planks', 0xb08d57);
BLOCK_INFO[BLOCK.LEAVES] = def('Leaves', 0x3f8a2a, 0x3f8a2a, 0x3f8a2a, { opaque: false });
BLOCK_INFO[BLOCK.GLASS] = def('Glass', 0xcfe8f5, 0xcfe8f5, 0xcfe8f5, { opaque: false, transparent: true });
BLOCK_INFO[BLOCK.WATER] = def('Water', 0x3a6fd8, 0x3a6fd8, 0x3a6fd8, {
    solid: false, opaque: false, transparent: true, targetable: false
});
BLOCK_INFO[BLOCK.BEDROCK] = def('Bedrock', 0x333333, 0x333333, 0x333333, { breakable: false });

export const HOTBAR = [
    BLOCK.GRASS,
    BLOCK.DIRT,
    BLOCK.STONE,
    BLOCK.COBBLESTONE,
    BLOCK.SAND,
    BLOCK.LOG,
    BLOCK.PLANKS,
    BLOCK.LEAVES,
    BLOCK.GLASS
];
