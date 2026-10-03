import { BlockType } from '../world/BlockType.js';

export class Hotbar {
    constructor(inventory) {
        this.inventory = inventory;
        this.container = document.getElementById('blockSelector');
        this.slots = [];
        this.initSlots();
    }

    initSlots() {
        for (let i = 0; i < this.inventory.maxSlots; i++) {
            const slot = document.createElement('div');
            slot.className = 'blockSlot';
            slot.id = `hotbar-slot-${i}`;
            slot.textContent = i + 1;

            slot.addEventListener('click', () => {
                this.inventory.selectSlot(i);
                this.updateDisplay();
            });

            this.container.appendChild(slot);
            this.slots.push(slot);
        }
    }

    updateDisplay() {
        for (let i = 0; i < this.slots.length; i++) {
            const slot = this.slots[i];
            const item = this.inventory.slots[i];

            if (item) {
                const blockName = BlockType.getName(item.blockType);
                slot.textContent = `${i + 1}\n×${item.count}`;
                slot.title = blockName;
            } else {
                slot.textContent = i + 1;
                slot.title = 'Empty';
            }

            slot.classList.toggle('selected', i === this.inventory.selectedSlot);
        }
    }

    selectSlot(index) {
        this.inventory.selectSlot(index);
        this.updateDisplay();
    }
}
