export enum BlockType {
    AIR = 0,
    GRASS = 1,
    DIRT = 2,
    STONE = 3,
    WOOD = 4,
    LEAVES = 5,
    WATER = 6,
    SAND = 7,
    GRAVEL = 8,
    COAL_ORE = 9,
    IRON_ORE = 10,
    GOLD_ORE = 11
}

interface BlockColor {
    r: number;
    g: number;
    b: number;
}

const blockColors: Record<BlockType, BlockColor> = {
    [BlockType.AIR]: { r: 0, g: 0, b: 0 },
    [BlockType.GRASS]: { r: 76, g: 139, b: 76 },
    [BlockType.DIRT]: { r: 139, g: 101, b: 56 },
    [BlockType.STONE]: { r: 128, g: 128, b: 128 },
    [BlockType.WOOD]: { r: 139, g: 69, b: 19 },
    [BlockType.LEAVES]: { r: 34, g: 139, b: 34 },
    [BlockType.WATER]: { r: 30, g: 144, b: 255 },
    [BlockType.SAND]: { r: 238, g: 214, b: 175 },
    [BlockType.GRAVEL]: { r: 169, g: 169, b: 169 },
    [BlockType.COAL_ORE]: { r: 64, g: 64, b: 64 },
    [BlockType.IRON_ORE]: { r: 192, g: 192, b: 192 },
    [BlockType.GOLD_ORE]: { r: 255, g: 215, b: 0 }
};

const blockNames: Record<BlockType, string> = {
    [BlockType.AIR]: 'Air',
    [BlockType.GRASS]: 'Grass',
    [BlockType.DIRT]: 'Dirt',
    [BlockType.STONE]: 'Stone',
    [BlockType.WOOD]: 'Wood',
    [BlockType.LEAVES]: 'Leaves',
    [BlockType.WATER]: 'Water',
    [BlockType.SAND]: 'Sand',
    [BlockType.GRAVEL]: 'Gravel',
    [BlockType.COAL_ORE]: 'Coal Ore',
    [BlockType.IRON_ORE]: 'Iron Ore',
    [BlockType.GOLD_ORE]: 'Gold Ore'
};

export function getBlockColor(type: BlockType): BlockColor {
    return blockColors[type] || blockColors[BlockType.STONE];
}

export function getBlockName(type: BlockType): string {
    return blockNames[type] || 'Unknown';
}

export function isSolid(type: BlockType): boolean {
    return type !== BlockType.AIR && type !== BlockType.WATER;
}

export function isTransparent(type: BlockType): boolean {
    return type === BlockType.AIR || type === BlockType.WATER || type === BlockType.LEAVES;
}
