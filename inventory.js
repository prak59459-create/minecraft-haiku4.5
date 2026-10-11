import { BLOCK_NAMES } from './blocks.js';

export class Inventory {
    constructor(slotCount = 36) {
        this.slotCount = slotCount;
        this.slots = Array(slotCount).fill(null).map(() => ({ blockId: 0, count: 0 }));
        this.selectedSlot = 0;
        this.maxStackSize = 64;
    }

    addBlock(blockId, count = 1) {
        if (blockId === 0) return false;

        let remaining = count;

        for (let i = 0; i < this.slotCount && remaining > 0; i++) {
            if (this.slots[i].blockId === blockId && this.slots[i].count < this.maxStackSize) {
                const space = this.maxStackSize - this.slots[i].count;
                const toAdd = Math.min(remaining, space);
                this.slots[i].count += toAdd;
                remaining -= toAdd;
            }
        }

        for (let i = 0; i < this.slotCount && remaining > 0; i++) {
            if (this.slots[i].blockId === 0) {
                const toAdd = Math.min(remaining, this.maxStackSize);
                this.slots[i].blockId = blockId;
                this.slots[i].count = toAdd;
                remaining -= toAdd;
            }
        }

        return remaining === 0;
    }

    removeBlock(blockId, count = 1) {
        let remaining = count;

        for (let i = 0; i < this.slotCount && remaining > 0; i++) {
            if (this.slots[i].blockId === blockId) {
                const toRemove = Math.min(remaining, this.slots[i].count);
                this.slots[i].count -= toRemove;
                remaining -= toRemove;

                if (this.slots[i].count === 0) {
                    this.slots[i].blockId = 0;
                }
            }
        }

        return remaining === 0;
    }

    getSelectedBlock() {
        return this.slots[this.selectedSlot].blockId;
    }

    selectSlot(index) {
        if (index >= 0 && index < 9) {
            this.selectedSlot = index;
            return this.slots[index].blockId;
        }
        return 0;
    }

    getSlot(index) {
        return this.slots[index];
    }

    hasBlock(blockId, count = 1) {
        let total = 0;
        for (let i = 0; i < this.slotCount; i++) {
            if (this.slots[i].blockId === blockId) {
                total += this.slots[i].count;
                if (total >= count) return true;
            }
        }
        return false;
    }

    clear() {
        this.slots.fill(null).forEach((_, i) => {
            this.slots[i] = { blockId: 0, count: 0 };
        });
        this.selectedSlot = 0;
    }

    serialize() {
        return {
            slots: this.slots.map(slot => ({
                blockId: slot.blockId,
                count: slot.count
            })),
            selectedSlot: this.selectedSlot
        };
    }

    deserialize(data) {
        if (data.slots) {
            this.slots = data.slots.map(slot => ({
                blockId: slot.blockId || 0,
                count: slot.count || 0
            }));
        }
        if (typeof data.selectedSlot === 'number') {
            this.selectedSlot = data.selectedSlot;
        }
    }
}
