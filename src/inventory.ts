import { BlockType } from './blocks.js';

interface InventorySlot {
    type: BlockType;
    count: number;
}

export class Inventory {
    slots: InventorySlot[] = [];
    selectedSlot: number = 0;
    maxSlots: number = 9;
    maxStackSize: number = 64;

    constructor() {
        for (let i = 0; i < this.maxSlots; i++) {
            this.slots.push({ type: BlockType.AIR, count: 0 });
        }
        this.slots[0] = { type: BlockType.GRASS, count: this.maxStackSize };
        this.slots[1] = { type: BlockType.DIRT, count: this.maxStackSize };
        this.slots[2] = { type: BlockType.STONE, count: this.maxStackSize };
        this.slots[3] = { type: BlockType.WOOD, count: this.maxStackSize };
        this.slots[4] = { type: BlockType.LEAVES, count: this.maxStackSize };
        this.slots[5] = { type: BlockType.SAND, count: this.maxStackSize };
    }

    getSelected(): InventorySlot {
        return this.slots[this.selectedSlot];
    }

    canUseSelected(): boolean {
        const slot = this.getSelected();
        return slot.count > 0 && slot.type !== BlockType.AIR;
    }

    useSelected(): void {
        const slot = this.slots[this.selectedSlot];
        if (slot.count > 0) {
            slot.count--;
            if (slot.count === 0) {
                slot.type = BlockType.AIR;
            }
        }
    }

    addBlock(type: BlockType, count: number = 1): boolean {
        for (let i = 0; i < this.maxSlots; i++) {
            const slot = this.slots[i];
            if ((slot.type === type || slot.count === 0) && slot.count < this.maxStackSize) {
                const toAdd = Math.min(count, this.maxStackSize - slot.count);
                slot.type = type;
                slot.count += toAdd;
                count -= toAdd;
                if (count === 0) return true;
            }
        }
        return count === 0;
    }

    selectSlot(index: number): void {
        if (index >= 0 && index < this.maxSlots) {
            this.selectedSlot = index;
        }
    }

    getSlotInfo(index: number): string {
        if (index < 0 || index >= this.maxSlots) return '';
        const slot = this.slots[index];
        if (slot.count === 0) return 'Empty';
        return `${slot.type} x${slot.count}`;
    }
}
