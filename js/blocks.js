const BLOCKS = {
    0: { name: 'Air', solid: false, color: 0xffffff },
    1: { name: 'Grass', solid: true, color: 0x3db74f, top: 0x3db74f, side: 0x8b7355, bottom: 0x5d4e37 },
    2: { name: 'Dirt', solid: true, color: 0x8b7355 },
    3: { name: 'Stone', solid: true, color: 0x8a8a8a },
    4: { name: 'Wood', solid: true, color: 0x6b4423, top: 0x4a3425, bottom: 0x4a3425 },
    5: { name: 'Leaves', solid: true, color: 0x2a9d2f, transparent: true },
    6: { name: 'Water', solid: true, color: 0x4a90e2, transparent: true, liquid: true },
    7: { name: 'Sand', solid: true, color: 0xf5deb3 },
    8: { name: 'Gravel', solid: true, color: 0x8b8680 },
    9: { name: 'Log', solid: true, color: 0x4d2c1a, top: 0x4a3425, bottom: 0x4a3425 },
};

function createBlockMaterial(blockType) {
    const block = BLOCKS[blockType];
    if (!block) return new THREE.MeshStandardMaterial({ color: 0xff00ff });

    const color = block.color || 0xcccccc;
    const material = new THREE.MeshStandardMaterial({
        color: color,
        roughness: 0.7,
        metalness: 0,
        transparent: block.transparent || false,
        opacity: block.transparent ? 0.8 : 1.0,
        side: block.transparent ? THREE.FrontSide : THREE.FrontSide
    });

    return material;
}

function getBlockColor(blockType, face = 'default') {
    const block = BLOCKS[blockType];
    if (!block) return 0xff00ff;

    if (face === 'top' && block.top) return block.top;
    if (face === 'side' && block.side) return block.side;
    if (face === 'bottom' && block.bottom) return block.bottom;

    return block.color || 0xcccccc;
}

function isBlockSolid(blockType) {
    const block = BLOCKS[blockType];
    return block && block.solid;
}

function isBlockLiquid(blockType) {
    const block = BLOCKS[blockType];
    return block && block.liquid;
}
