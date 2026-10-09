import { BLOCK_NAMES } from './blocks.js';

export class InventorySystem {
    constructor(slotCount = 27, maxStackSize = 64) {
        this.slots = new Array(slotCount).fill(null);
        this.maxStackSize = maxStackSize;
        this.selectedSlot = 0;
        this.hotbarSize = 9;
    }

    addItem(blockId, count = 1) {
        let remaining = count;

        for (let i = 0; i < this.slots.length && remaining > 0; i++) {
            const slot = this.slots[i];
            if (slot && slot.blockId === blockId && slot.count < this.maxStackSize) {
                const space = this.maxStackSize - slot.count;
                const add = Math.min(space, remaining);
                slot.count += add;
                remaining -= add;
            }
        }

        for (let i = 0; i < this.slots.length && remaining > 0; i++) {
            if (!this.slots[i]) {
                const add = Math.min(this.maxStackSize, remaining);
                this.slots[i] = {
                    blockId,
                    count: add
                };
                remaining -= add;
            }
        }

        return remaining === 0;
    }

    removeItem(slotIndex, count = 1) {
        if (slotIndex < 0 || slotIndex >= this.slots.length) return false;

        const slot = this.slots[slotIndex];
        if (!slot) return false;

        if (slot.count <= count) {
            this.slots[slotIndex] = null;
            return slot.count;
        }

        slot.count -= count;
        return count;
    }

    getSlot(index) {
        if (index < 0 || index >= this.slots.length) return null;
        return this.slots[index];
    }

    setSlot(index, blockId, count = 1) {
        if (index < 0 || index >= this.slots.length) return false;

        if (blockId === null) {
            this.slots[index] = null;
        } else {
            this.slots[index] = {
                blockId,
                count: Math.min(count, this.maxStackSize)
            };
        }
        return true;
    }

    swapSlots(index1, index2) {
        if (index1 < 0 || index1 >= this.slots.length) return false;
        if (index2 < 0 || index2 >= this.slots.length) return false;

        const temp = this.slots[index1];
        this.slots[index1] = this.slots[index2];
        this.slots[index2] = temp;
        return true;
    }

    moveItem(fromIndex, toIndex, count = null) {
        const fromSlot = this.getSlot(fromIndex);
        if (!fromSlot) return false;

        const moveCount = Math.min(fromSlot.count, count || fromSlot.count);
        const toSlot = this.getSlot(toIndex);

        if (!toSlot) {
            this.setSlot(toIndex, fromSlot.blockId, moveCount);
            this.removeItem(fromIndex, moveCount);
            return true;
        }

        if (toSlot.blockId === fromSlot.blockId) {
            const space = this.maxStackSize - toSlot.count;
            const toMove = Math.min(space, moveCount);
            toSlot.count += toMove;
            this.removeItem(fromIndex, toMove);
            return true;
        }

        return false;
    }

    getSelectedItem() {
        return this.getSlot(this.selectedSlot);
    }

    selectSlot(index) {
        if (index >= 0 && index < this.hotbarSize) {
            this.selectedSlot = index;
            return true;
        }
        return false;
    }

    getItemCount(blockId) {
        let count = 0;
        for (const slot of this.slots) {
            if (slot && slot.blockId === blockId) {
                count += slot.count;
            }
        }
        return count;
    }

    getEmptySlotCount() {
        return this.slots.filter(slot => slot === null).length;
    }

    isFull() {
        return this.getEmptySlotCount() === 0;
    }

    isEmpty() {
        return this.slots.every(slot => slot === null);
    }

    clear() {
        this.slots.fill(null);
        this.selectedSlot = 0;
    }

    getInventoryState() {
        return this.slots.map(slot => slot ? { ...slot } : null);
    }

    loadInventoryState(state) {
        for (let i = 0; i < Math.min(state.length, this.slots.length); i++) {
            this.slots[i] = state[i] ? { ...state[i] } : null;
        }
    }

    getSlotDisplay(index) {
        const slot = this.getSlot(index);
        if (!slot) return '(empty)';

        const blockName = BLOCK_NAMES[slot.blockId] || 'Unknown';
        return `${blockName} x${slot.count}`;
    }
}
