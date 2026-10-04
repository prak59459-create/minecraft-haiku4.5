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
    [BlockType.GRASS]: { r: 95, g: 145, b: 80 },
    [BlockType.DIRT]: { r: 153, g: 102, b: 51 },
    [BlockType.STONE]: { r: 128, g: 128, b: 128 },
    [BlockType.WOOD]: { r: 162, g: 102, b: 38 },
    [BlockType.LEAVES]: { r: 52, g: 160, b: 52 },
    [BlockType.WATER]: { r: 64, g: 164, b: 255 },
    [BlockType.SAND]: { r: 255, g: 220, b: 100 },
    [BlockType.GRAVEL]: { r: 160, g: 160, b: 160 },
    [BlockType.COAL_ORE]: { r: 60, g: 60, b: 60 },
    [BlockType.IRON_ORE]: { r: 200, g: 200, b: 200 },
    [BlockType.GOLD_ORE]: { r: 255, g: 230, b: 0 }
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
