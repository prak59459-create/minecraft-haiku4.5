export const BLOCK_TYPES = {
  AIR: 0,
  GRASS: 1,
  DIRT: 2,
  STONE: 3,
  WOOD: 4,
  LEAVES: 5,
  WATER: 6,
};

export const BLOCK_NAMES: { [key: number]: string } = {
  0: 'Air',
  1: 'Grass',
  2: 'Dirt',
  3: 'Stone',
  4: 'Wood',
  5: 'Leaves',
  6: 'Water',
};

export function getBlockName(type: number): string {
  return BLOCK_NAMES[type] || 'Unknown';
}
