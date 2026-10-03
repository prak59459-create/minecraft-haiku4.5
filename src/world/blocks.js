export class BlockDatabase {
    constructor() {
        this.blocks = {
            'air': { id: 0, name: 'air', type: 'air', solid: false },
            'grass': { id: 1, name: 'grass', type: 'grass', solid: true },
            'dirt': { id: 2, name: 'dirt', type: 'dirt', solid: true },
            'stone': { id: 3, name: 'stone', type: 'stone', solid: true },
            'wood': { id: 4, name: 'wood', type: 'wood', solid: true },
            'leaves': { id: 5, name: 'leaves', type: 'leaves', solid: true },
            'water': { id: 6, name: 'water', type: 'water', solid: false },
            'sand': { id: 7, name: 'sand', type: 'sand', solid: true },
            'gravel': { id: 8, name: 'gravel', type: 'gravel', solid: true },
            'cobblestone': { id: 9, name: 'cobblestone', type: 'cobblestone', solid: true }
        };

        this.blockById = {};
        for (const blockType in this.blocks) {
            const block = this.blocks[blockType];
            this.blockById[block.id] = block;
        }
    }

    getBlock(blockType) {
        return this.blocks[blockType] || this.blocks['air'];
    }

    getBlockId(blockType) {
        const block = this.blocks[blockType];
        return block ? block.id : 0;
    }

    getBlockById(blockId) {
        return this.blockById[blockId] || this.blocks['air'];
    }

    isBlockSolid(blockType) {
        const block = this.blocks[blockType];
        return block ? block.solid : false;
    }
}
