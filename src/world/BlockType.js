export const BlockType = {
    STONE: 1,
    DIRT: 2,
    GRASS: 3,
    WOOD: 4,
    LEAVES: 5,
    WATER: 6,
    SAND: 7,
    GRAVEL: 8,
    COBBLESTONE: 9,
    COAL_ORE: 10,

    getColor(type) {
        const colors = {
            1: { r: 0.5, g: 0.5, b: 0.5 },      // STONE - Gray
            2: { r: 0.6, g: 0.4, b: 0.2 },      // DIRT - Brown
            3: { r: 0.2, g: 0.6, b: 0.2 },      // GRASS - Green
            4: { r: 0.4, g: 0.25, b: 0.1 },     // WOOD - Dark Brown
            5: { r: 0.1, g: 0.5, b: 0.1 },      // LEAVES - Dark Green
            6: { r: 0.2, g: 0.5, b: 0.8 },      // WATER - Blue
            7: { r: 0.9, g: 0.85, b: 0.6 },     // SAND - Light Yellow
            8: { r: 0.5, g: 0.45, b: 0.4 },     // GRAVEL - Light Gray
            9: { r: 0.45, g: 0.45, b: 0.45 },   // COBBLESTONE - Dark Gray
            10: { r: 0.2, g: 0.2, b: 0.2 }      // COAL_ORE - Dark
        };
        return colors[type] || { r: 1, g: 1, b: 1 };
    },

    getName(type) {
        const names = {
            0: 'Air',
            1: 'Stone',
            2: 'Dirt',
            3: 'Grass',
            4: 'Wood',
            5: 'Leaves',
            6: 'Water',
            7: 'Sand',
            8: 'Gravel',
            9: 'Cobblestone',
            10: 'Coal Ore'
        };
        return names[type] || 'Unknown';
    }
};
