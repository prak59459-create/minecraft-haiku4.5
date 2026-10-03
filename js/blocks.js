class BlockType {
    constructor(id, name, color, metalness = 0.0, roughness = 0.8) {
        this.id = id;
        this.name = name;
        this.color = color;
        this.metalness = metalness;
        this.roughness = roughness;
    }
}

class BlockRegistry {
    constructor() {
        this.blocks = new Map();
        this.register(new BlockType(0, 'Air', 0xffffff, 0, 1));
        this.register(new BlockType(1, 'Stone', 0x808080, 0.1, 0.7));
        this.register(new BlockType(2, 'Dirt', 0x8b7355, 0.0, 0.9));
        this.register(new BlockType(3, 'Grass', 0x228b22, 0.0, 0.85));
        this.register(new BlockType(4, 'Wood', 0x8b4513, 0.0, 0.8));
        this.register(new BlockType(5, 'Leaves', 0x228b22, 0.0, 0.9));
        this.register(new BlockType(6, 'Water', 0x4a90e2, 0.5, 0.3));
        this.register(new BlockType(7, 'Sand', 0xdaa520, 0.0, 0.95));
        this.register(new BlockType(8, 'Gravel', 0x888888, 0.0, 0.85));
        this.register(new BlockType(9, 'Cobblestone', 0x696969, 0.0, 0.8));
        this.register(new BlockType(10, 'Iron', 0xcccccc, 0.7, 0.2));
        this.register(new BlockType(11, 'Gold', 0xffd700, 0.8, 0.1));
    }

    register(blockType) {
        this.blocks.set(blockType.id, blockType);
    }

    get(id) {
        return this.blocks.get(id) || this.blocks.get(0);
    }

    getByName(name) {
        for (const [id, block] of this.blocks) {
            if (block.name === name) return block;
        }
        return this.blocks.get(0);
    }

    getAll() {
        return Array.from(this.blocks.values()).filter(b => b.id !== 0);
    }

    createMaterial(blockType) {
        return new THREE.MeshStandardMaterial({
            color: blockType.color,
            metalness: blockType.metalness,
            roughness: blockType.roughness,
            flatShading: false
        });
    }
}

const BLOCK_SIZE = 1;
const CHUNK_SIZE = 16;
const CHUNK_HEIGHT = 256;
const RENDER_DISTANCE = 8;
const WORLD_SEED = 12345;

const blockRegistry = new BlockRegistry();
