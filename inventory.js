import { BLOCK_NAMES, BLOCKS } from './blocks.js';

export class InventoryManager {
    constructor() {
        this.selectedSlot = 0;
        this.inventory = new Array(9);
        this.setupInventory();
        this.setupEventListeners();
    }

    setupInventory() {
        const defaultBlocks = [
            BLOCKS.STONE,
            BLOCKS.GRASS,
            BLOCKS.DIRT,
            BLOCKS.OAK_LOG,
            BLOCKS.SAND,
            BLOCKS.WATER,
            BLOCKS.BIRCH_LOG,
            BLOCKS.SPRUCE_LOG,
            BLOCKS.DEEPSLATE
        ];

        for (let i = 0; i < 9; i++) {
            this.inventory[i] = {
                blockId: defaultBlocks[i],
                count: 64
            };
        }
    }

    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            const num = parseInt(e.key);
            if (num >= 1 && num <= 9) {
                this.selectSlot(num - 1);
            }
        });

        document.addEventListener('wheel', (e) => {
            if (e.deltaY > 0) {
                this.selectSlot((this.selectedSlot + 1) % 9);
            } else {
                this.selectSlot((this.selectedSlot - 1 + 9) % 9);
            }
        });

        document.querySelectorAll('.inventory-slot').forEach((slot, index) => {
            slot.addEventListener('click', () => this.selectSlot(index));
        });
    }

    selectSlot(index) {
        this.selectedSlot = Math.max(0, Math.min(8, index));
        this.updateDisplay();
    }

    getSelectedBlock() {
        return this.inventory[this.selectedSlot].blockId;
    }

    updateDisplay() {
        document.querySelectorAll('.inventory-slot').forEach((slot, index) => {
            if (index === this.selectedSlot) {
                slot.classList.add('selected');
            } else {
                slot.classList.remove('selected');
            }
        });
    }

    addBlock(blockId, count = 1) {
        for (let i = 0; i < 9; i++) {
            if (this.inventory[i].blockId === blockId && this.inventory[i].count < 64) {
                this.inventory[i].count = Math.min(64, this.inventory[i].count + count);
                return true;
            }
        }

        for (let i = 0; i < 9; i++) {
            if (this.inventory[i].blockId === BLOCKS.AIR) {
                this.inventory[i] = { blockId, count: Math.min(64, count) };
                return true;
            }
        }

        return false;
    }

    removeBlock(count = 1) {
        if (this.inventory[this.selectedSlot].blockId === BLOCKS.AIR) {
            return false;
        }
        this.inventory[this.selectedSlot].count -= count;
        if (this.inventory[this.selectedSlot].count <= 0) {
            this.inventory[this.selectedSlot] = { blockId: BLOCKS.AIR, count: 0 };
        }
        return true;
    }

    getSelectedBlockName() {
        const blockId = this.getSelectedBlock();
        return BLOCK_NAMES[blockId] || 'Unknown';
    }

    hasBlock(blockId) {
        for (let slot of this.inventory) {
            if (slot.blockId === blockId && slot.count > 0) {
                return true;
            }
        }
        return false;
    }

    toJSON() {
        return {
            selectedSlot: this.selectedSlot,
            inventory: this.inventory
        };
    }

    fromJSON(data) {
        this.selectedSlot = data.selectedSlot || 0;
        this.inventory = data.inventory || this.inventory;
        this.updateDisplay();
    }
}
