export class GameMode {
    constructor(inventory) {
        this.inventory = inventory;
        this.mode = 'survival'; // 'survival' or 'creative'
        this.isFlying = false;
        this.flySpeed = 0.15;
    }

    setMode(mode) {
        if (mode === 'survival' || mode === 'creative') {
            this.mode = mode;
            this.isFlying = false;

            if (mode === 'creative') {
                this.fillCreativeInventory();
            }

            return true;
        }
        return false;
    }

    toggleMode() {
        this.mode = this.mode === 'survival' ? 'creative' : 'survival';
        if (this.mode === 'creative') {
            this.fillCreativeInventory();
        }
        return this.mode;
    }

    fillCreativeInventory() {
        if (!this.inventory) return;

        this.inventory.clear();
        const BLOCKS = {
            AIR: 0, STONE: 1, GRASS: 2, DIRT: 3, COBBLESTONE: 4,
            OAK_LOG: 5, OAK_LEAVES: 6, SAND: 7, WATER: 8, GRAVEL: 9,
            BEDROCK: 10, COAL_ORE: 11, IRON_ORE: 12, GOLD_ORE: 13,
            DIAMOND_ORE: 14, LAVA: 15, OAK_PLANKS: 16, BRICKS: 17,
            SMOOTH_STONE: 18, CLAY: 19, OBSIDIAN: 20, SNOW: 21, SANDSTONE: 22
        };

        for (const [name, blockId] of Object.entries(BLOCKS)) {
            if (blockId !== BLOCKS.AIR) {
                this.inventory.addBlock(blockId, 64);
            }
        }
    }

    startFlying() {
        if (this.mode === 'creative') {
            this.isFlying = true;
            return true;
        }
        return false;
    }

    stopFlying() {
        this.isFlying = false;
    }

    toggleFlying() {
        if (this.mode === 'creative') {
            this.isFlying = !this.isFlying;
            return this.isFlying;
        }
        return false;
    }

    canPlaceBlock(inventory) {
        return this.mode === 'creative' || (inventory && inventory.hasBlock(inventory.getSelectedBlock()));
    }

    canDestroyBlock() {
        return true;
    }

    getMode() {
        return this.mode;
    }

    isSurvival() {
        return this.mode === 'survival';
    }

    isCreative() {
        return this.mode === 'creative';
    }
}
