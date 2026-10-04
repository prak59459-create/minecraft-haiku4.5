import * as THREE from 'three';

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
    GLASS: 9,
    OAK_LOG: 10,
    BEDROCK: 11,
    COBBLESTONE: 12,
    PLANKS: 13,
    IRON_ORE: 14,
    COAL_ORE: 15,
    BRICK: 16,
    CLAY: 17
};

export const BLOCK_COLORS = {
    [BLOCK_TYPES.AIR]: 0xffffff,
    [BLOCK_TYPES.GRASS]: 0x2d8c2d,
    [BLOCK_TYPES.DIRT]: 0x8b5a2b,
    [BLOCK_TYPES.STONE]: 0x808080,
    [BLOCK_TYPES.WOOD]: 0x654321,
    [BLOCK_TYPES.LEAVES]: 0x228b22,
    [BLOCK_TYPES.WATER]: 0x4488ff,
    [BLOCK_TYPES.SAND]: 0xf4a460,
    [BLOCK_TYPES.GRAVEL]: 0x9b9b9b,
    [BLOCK_TYPES.GLASS]: 0xccddff,
    [BLOCK_TYPES.OAK_LOG]: 0x5a4a3a,
    [BLOCK_TYPES.BEDROCK]: 0x1a1a1a,
    [BLOCK_TYPES.COBBLESTONE]: 0x757575,
    [BLOCK_TYPES.PLANKS]: 0x8b6914,
    [BLOCK_TYPES.IRON_ORE]: 0xb8a038,
    [BLOCK_TYPES.COAL_ORE]: 0x353535,
    [BLOCK_TYPES.BRICK]: 0xa8504a,
    [BLOCK_TYPES.CLAY]: 0xc9aea5
};

export const BLOCK_NAMES = {
    [BLOCK_TYPES.AIR]: 'Air',
    [BLOCK_TYPES.GRASS]: 'Grass',
    [BLOCK_TYPES.DIRT]: 'Dirt',
    [BLOCK_TYPES.STONE]: 'Stone',
    [BLOCK_TYPES.WOOD]: 'Wood',
    [BLOCK_TYPES.LEAVES]: 'Leaves',
    [BLOCK_TYPES.WATER]: 'Water',
    [BLOCK_TYPES.SAND]: 'Sand',
    [BLOCK_TYPES.GRAVEL]: 'Gravel',
    [BLOCK_TYPES.GLASS]: 'Glass',
    [BLOCK_TYPES.OAK_LOG]: 'Oak Log',
    [BLOCK_TYPES.BEDROCK]: 'Bedrock',
    [BLOCK_TYPES.COBBLESTONE]: 'Cobblestone',
    [BLOCK_TYPES.PLANKS]: 'Planks',
    [BLOCK_TYPES.IRON_ORE]: 'Iron Ore',
    [BLOCK_TYPES.COAL_ORE]: 'Coal Ore',
    [BLOCK_TYPES.BRICK]: 'Brick',
    [BLOCK_TYPES.CLAY]: 'Clay'
};

export const TRANSPARENT_BLOCKS = new Set([
    BLOCK_TYPES.AIR,
    BLOCK_TYPES.WATER,
    BLOCK_TYPES.GLASS,
    BLOCK_TYPES.LEAVES
]);

export class BlockMesh {
    static createBoxGeometry(x, y, z) {
        const geometry = new THREE.BufferGeometry();

        const positions = [
            // Front face
            x, y, z + 1,
            x + 1, y, z + 1,
            x + 1, y + 1, z + 1,
            x, y + 1, z + 1,

            // Back face
            x + 1, y, z,
            x, y, z,
            x, y + 1, z,
            x + 1, y + 1, z,

            // Top face
            x, y + 1, z + 1,
            x + 1, y + 1, z + 1,
            x + 1, y + 1, z,
            x, y + 1, z,

            // Bottom face
            x, y, z,
            x + 1, y, z,
            x + 1, y, z + 1,
            x, y, z + 1,

            // Right face
            x + 1, y, z,
            x + 1, y, z + 1,
            x + 1, y + 1, z + 1,
            x + 1, y + 1, z,

            // Left face
            x, y, z + 1,
            x, y, z,
            x, y + 1, z,
            x, y + 1, z + 1,
        ];

        const indices = [
            0, 1, 2, 0, 2, 3,
            4, 5, 6, 4, 6, 7,
            8, 9, 10, 8, 10, 11,
            12, 13, 14, 12, 14, 15,
            16, 17, 18, 16, 18, 19,
            20, 21, 22, 20, 22, 23
        ];

        geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3));
        geometry.setIndex(new THREE.BufferAttribute(new Uint32Array(indices), 1));
        geometry.computeVertexNormals();

        return geometry;
    }
}
