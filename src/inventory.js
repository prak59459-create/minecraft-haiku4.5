export class Inventory {
    constructor() {
        this.maxSlots = 9;
        this.slots = [];
        this.selectedSlot = 0;

        this.initialize();
    }

    initialize() {
        this.slots = [
            { type: 'grass', name: 'grass', count: 64 },
            { type: 'dirt', name: 'dirt', count: 64 },
            { type: 'stone', name: 'stone', count: 64 },
            { type: 'wood', name: 'wood', count: 64 },
            { type: 'leaves', name: 'leaves', count: 32 },
            { type: 'water', name: 'water', count: 0 },
            { type: 'sand', name: 'sand', count: 32 },
            { type: 'gravel', name: 'gravel', count: 32 },
            { type: 'cobblestone', name: 'cobblestone', count: 32 }
        ];
    }

    getSelectedBlock() {
        return this.slots[this.selectedSlot];
    }

    selectSlot(index) {
        this.selectedSlot = Math.max(0, Math.min(this.maxSlots - 1, index));
    }

    addBlock(blockType, count = 1) {
        const slot = this.slots.find(s => s.type === blockType);
        if (slot) {
            slot.count = Math.min(64, slot.count + count);
            return true;
        }
        return false;
    }

    removeBlock(blockType, count = 1) {
        const slot = this.slots.find(s => s.type === blockType);
        if (slot && slot.count >= count) {
            slot.count -= count;
            return true;
        }
        return false;
    }

    canPlaceBlock() {
        const selected = this.getSelectedBlock();
        return selected && selected.count > 0;
    }

    placeBlock() {
        const selected = this.getSelectedBlock();
        if (selected && selected.count > 0) {
            selected.count--;
            return true;
        }
        return false;
    }

    breakBlock(blockType) {
        return this.addBlock(blockType, 1);
    }

    getSlotContents(index) {
        if (index >= 0 && index < this.maxSlots) {
            return this.slots[index];
        }
        return null;
    }
}
