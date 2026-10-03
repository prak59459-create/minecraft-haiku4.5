class Block {
    constructor(type, x, y, z) {
        this.type = type;
        this.x = x;
        this.y = y;
        this.z = z;
    }

    getColor() {
        return BLOCK_COLORS[this.type] || 0xFFFFFF;
    }

    isTransparent() {
        return this.type === BLOCK_TYPES.WATER || this.type === BLOCK_TYPES.AIR;
    }

    isOpaque() {
        return !this.isTransparent() && this.type !== BLOCK_TYPES.AIR;
    }

    isSolid() {
        return this.type !== BLOCK_TYPES.AIR && this.type !== BLOCK_TYPES.WATER;
    }
}

class BlockFace {
    constructor(x, y, z, direction) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.direction = direction;
    }

    getNormal() {
        const normals = {
            0: [1, 0, 0],   // +X
            1: [-1, 0, 0],  // -X
            2: [0, 1, 0],   // +Y
            3: [0, -1, 0],  // -Y
            4: [0, 0, 1],   // +Z
            5: [0, 0, -1]   // -Z
        };
        return normals[this.direction];
    }
}
