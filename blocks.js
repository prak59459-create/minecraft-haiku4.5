const BLOCKS = {
    AIR: { id: 0, name: 'Air', solid: false, color: 0x87ceeb },
    GRASS: { id: 1, name: 'Grass', solid: true, color: 0x2d8c2d },
    DIRT: { id: 2, name: 'Dirt', solid: true, color: 0x8b5a3c },
    STONE: { id: 3, name: 'Stone', solid: true, color: 0x808080 },
    WOOD: { id: 4, name: 'Wood', solid: true, color: 0x8b4513 },
    LEAVES: { id: 5, name: 'Leaves', solid: true, color: 0x228b22 },
    WATER: { id: 6, name: 'Water', solid: false, color: 0x1e90ff, transparent: true },
    SAND: { id: 7, name: 'Sand', solid: true, color: 0xf5deb3 },
    GRAVEL: { id: 8, name: 'Gravel', solid: true, color: 0xa9a9a9 },
    COBBLESTONE: { id: 9, name: 'Cobblestone', solid: true, color: 0x696969 }
};

const BLOCK_TYPES = Object.values(BLOCKS).filter(b => b.id !== 0);

function getBlockColor(blockId) {
    for (let block of Object.values(BLOCKS)) {
        if (block.id === blockId) return block.color;
    }
    return 0xffffff;
}

function isBlockSolid(blockId) {
    for (let block of Object.values(BLOCKS)) {
        if (block.id === blockId) return block.solid !== false;
    }
    return true;
}
