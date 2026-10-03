export class BlockSystem {
    constructor() {
        this.blocks = {
            0: { name: 'air', color: 0x87ceeb, solid: false },
            1: { name: 'dirt', color: 0x8b7355, solid: true },
            2: { name: 'grass', color: 0x4fb36e, solid: true },
            3: { name: 'stone', color: 0x808080, solid: true },
            4: { name: 'wood', color: 0x654321, solid: true },
            5: { name: 'leaves', color: 0x228b22, solid: true },
            6: { name: 'water', color: 0x4493f8, solid: false },
            7: { name: 'sand', color: 0xedd5a6, solid: true },
            8: { name: 'gravel', color: 0x9a9a9a, solid: true },
            9: { name: 'cobblestone', color: 0x707070, solid: true }
        };
    }

    isBlockSolid(blockId) {
        return (this.blocks[blockId]?.solid ?? true);
    }

    getBlockName(blockId) {
        return this.blocks[blockId]?.name ?? 'unknown';
    }

    getBlockColor(blockId) {
        const hex = this.blocks[blockId]?.color ?? 0xffffff;
        return '#' + hex.toString(16).padStart(6, '0');
    }

    isValidBlockId(blockId) {
        return blockId in this.blocks && blockId !== 0;
    }
}
