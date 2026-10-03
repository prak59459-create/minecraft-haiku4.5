import { BlockType } from '../world/BlockType.js';

export class Inventory {
    constructor(maxSlots = 9) {
        this.maxSlots = maxSlots;
        this.slots = Array(maxSlots).fill(null);
        this.selectedSlot = 0;
        this.initializeDefaultItems();
    }

    initializeDefaultItems() {
        const defaultBlocks = [
            BlockType.GRASS,
            BlockType.DIRT,
            BlockType.STONE,
            BlockType.WOOD,
            BlockType.LEAVES,
            BlockType.SAND,
            BlockType.GRAVEL,
            BlockType.COBBLESTONE,
            BlockType.COAL_ORE
        ];

        for (let i = 0; i < this.maxSlots && i < defaultBlocks.length; i++) {
            this.slots[i] = {
                blockType: defaultBlocks[i],
                count: 64
            };
        }
    }

    getSelectedItem() {
        return this.slots[this.selectedSlot];
    }

    selectSlot(index) {
        if (index >= 0 && index < this.maxSlots) {
            this.selectedSlot = index;
            return this.slots[index];
        }
        return null;
    }

    addItem(blockType, count = 1) {
        for (let i = 0; i < this.maxSlots; i++) {
            if (this.slots[i] && this.slots[i].blockType === blockType) {
                this.slots[i].count += count;
                return true;
            }
        }

        for (let i = 0; i < this.maxSlots; i++) {
            if (!this.slots[i]) {
                this.slots[i] = { blockType, count };
                return true;
            }
        }

        return false;
    }

    removeItem(count = 1) {
        const item = this.getSelectedItem();
        if (!item) return false;

        item.count -= count;
        if (item.count <= 0) {
            this.slots[this.selectedSlot] = null;
        }
        return true;
    }

    hasItem(blockType) {
        return this.slots.some(slot => slot && slot.blockType === blockType && slot.count > 0);
    }

    getItemCount(blockType) {
        let count = 0;
        for (const slot of this.slots) {
            if (slot && slot.blockType === blockType) {
                count += slot.count;
            }
        }
        return count;
    }
}
