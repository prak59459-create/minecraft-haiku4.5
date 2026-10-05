import { BLOCKS, BLOCK_NAMES } from './blocks.js';

export class Inventory {
    constructor(maxSlots = 36, maxStackSize = 64) {
        this.maxSlots = maxSlots;
        this.maxStackSize = maxStackSize;
        this.slots = [];
        this.selectedSlot = 0;

        for (let i = 0; i < maxSlots; i++) {
            this.slots.push({ blockId: BLOCKS.AIR, count: 0 });
        }

        this.quickSlots = [
            BLOCKS.STONE, BLOCKS.GRASS, BLOCKS.DIRT,
            BLOCKS.COBBLESTONE, BLOCKS.OAK_LOG, BLOCKS.OAK_LEAVES,
            BLOCKS.SAND, BLOCKS.WATER, BLOCKS.GRAVEL
        ];

        this.initializeQuickSlots();
    }

    initializeQuickSlots() {
        for (let i = 0; i < this.quickSlots.length && i < this.maxSlots; i++) {
            this.slots[i].blockId = this.quickSlots[i];
            this.slots[i].count = 1;
        }
    }

    addBlock(blockId, count = 1) {
        let remaining = count;

        for (let i = 0; i < this.maxSlots && remaining > 0; i++) {
            const slot = this.slots[i];

            if (slot.blockId === blockId && slot.count < this.maxStackSize) {
                const canAdd = Math.min(remaining, this.maxStackSize - slot.count);
                slot.count += canAdd;
                remaining -= canAdd;
            }
        }

        for (let i = 0; i < this.maxSlots && remaining > 0; i++) {
            const slot = this.slots[i];

            if (slot.blockId === BLOCKS.AIR) {
                const toAdd = Math.min(remaining, this.maxStackSize);
                slot.blockId = blockId;
                slot.count = toAdd;
                remaining -= toAdd;
            }
        }

        return remaining === 0;
    }

    removeBlock(slotIndex, count = 1) {
        if (slotIndex < 0 || slotIndex >= this.maxSlots) return false;

        const slot = this.slots[slotIndex];
        if (slot.count < count) return false;

        slot.count -= count;
        if (slot.count === 0) {
            slot.blockId = BLOCKS.AIR;
        }

        return true;
    }

    getSelectedBlock() {
        if (this.selectedSlot < 0 || this.selectedSlot >= this.maxSlots) {
            return BLOCKS.AIR;
        }

        const slot = this.slots[this.selectedSlot];
        return slot.blockId;
    }

    selectSlot(slotIndex) {
        if (slotIndex >= 0 && slotIndex < this.maxSlots) {
            this.selectedSlot = slotIndex;
            return true;
        }
        return false;
    }

    selectQuickSlot(index) {
        if (index >= 0 && index < Math.min(9, this.maxSlots)) {
            this.selectedSlot = index;
            return true;
        }
        return false;
    }

    getSlotInfo(slotIndex) {
        if (slotIndex < 0 || slotIndex >= this.maxSlots) {
            return { blockId: BLOCKS.AIR, count: 0, name: 'Air' };
        }

        const slot = this.slots[slotIndex];
        return {
            blockId: slot.blockId,
            count: slot.count,
            name: BLOCK_NAMES[slot.blockId] || 'Unknown'
        };
    }

    clear() {
        for (let i = 0; i < this.maxSlots; i++) {
            this.slots[i].blockId = BLOCKS.AIR;
            this.slots[i].count = 0;
        }
        this.initializeQuickSlots();
    }

    getEmptySlotCount() {
        let count = 0;
        for (const slot of this.slots) {
            if (slot.blockId === BLOCKS.AIR) {
                count++;
            }
        }
        return count;
    }

    getTotalItemCount() {
        let total = 0;
        for (const slot of this.slots) {
            total += slot.count;
        }
        return total;
    }
}
