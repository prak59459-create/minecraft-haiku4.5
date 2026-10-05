export class Inventory {
    constructor(maxSlots = 36, maxStackSize = 64) {
        this.maxSlots = maxSlots;
        this.maxStackSize = maxStackSize;
        this.items = Array(maxSlots).fill(null).map(() => ({
            blockId: 0,
            count: 0
        }));
        this.selectedSlot = 0;
    }

    addItem(blockId, count = 1) {
        let remaining = count;

        for (let i = 0; i < this.maxSlots && remaining > 0; i++) {
            const slot = this.items[i];
            if (slot.blockId === blockId && slot.count < this.maxStackSize) {
                const canAdd = Math.min(remaining, this.maxStackSize - slot.count);
                slot.count += canAdd;
                remaining -= canAdd;
            }
        }

        for (let i = 0; i < this.maxSlots && remaining > 0; i++) {
            const slot = this.items[i];
            if (slot.blockId === 0) {
                const canAdd = Math.min(remaining, this.maxStackSize);
                slot.blockId = blockId;
                slot.count = canAdd;
                remaining -= canAdd;
            }
        }

        return remaining === 0;
    }

    removeItem(blockId, count = 1) {
        let remaining = count;

        for (let i = 0; i < this.maxSlots && remaining > 0; i++) {
            const slot = this.items[i];
            if (slot.blockId === blockId) {
                const canRemove = Math.min(remaining, slot.count);
                slot.count -= canRemove;
                remaining -= canRemove;

                if (slot.count === 0) {
                    slot.blockId = 0;
                }
            }
        }

        return remaining === 0;
    }

    getItemCount(blockId) {
        return this.items.reduce((total, slot) => {
            return total + (slot.blockId === blockId ? slot.count : 0);
        }, 0);
    }

    hasItem(blockId, count = 1) {
        return this.getItemCount(blockId) >= count;
    }

    getSelectedItem() {
        return this.items[this.selectedSlot];
    }

    selectSlot(slotIndex) {
        if (slotIndex >= 0 && slotIndex < this.maxSlots) {
            this.selectedSlot = slotIndex;
            return true;
        }
        return false;
    }

    clearSlot(slotIndex) {
        if (slotIndex >= 0 && slotIndex < this.maxSlots) {
            this.items[slotIndex] = { blockId: 0, count: 0 };
            return true;
        }
        return false;
    }

    clear() {
        this.items = Array(this.maxSlots).fill(null).map(() => ({
            blockId: 0,
            count: 0
        }));
        this.selectedSlot = 0;
    }

    isFull() {
        return this.items.every(slot => slot.count === this.maxStackSize);
    }

    isEmpty() {
        return this.items.every(slot => slot.count === 0);
    }

    getLoadout() {
        return this.items.map(slot => ({
            blockId: slot.blockId,
            count: slot.count
        }));
    }

    loadFromData(data) {
        if (Array.isArray(data) && data.length === this.maxSlots) {
            this.items = data.map(item => ({
                blockId: item.blockId || 0,
                count: item.count || 0
            }));
        }
    }

    getMetrics() {
        let totalItems = 0;
        let occupiedSlots = 0;

        for (const slot of this.items) {
            totalItems += slot.count;
            if (slot.count > 0) occupiedSlots++;
        }

        return {
            totalItems,
            occupiedSlots,
            emptySlots: this.maxSlots - occupiedSlots,
            capacity: this.maxSlots * this.maxStackSize
        };
    }
}

export class InventoryUI {
    constructor(inventory, containerId = 'inventory') {
        this.inventory = inventory;
        this.container = document.getElementById(containerId);
        this.slots = [];
        this.initializeUI();
    }

    initializeUI() {
        const slots = this.container.querySelectorAll('.inventory-slot');
        slots.forEach((slotEl, index) => {
            const slot = {
                element: slotEl,
                index: index
            };

            slotEl.addEventListener('click', () => {
                this.selectSlot(index);
            });

            this.slots.push(slot);
        });
    }

    selectSlot(index) {
        if (this.inventory.selectSlot(index)) {
            this.updateSelection();
        }
    }

    updateSelection() {
        this.slots.forEach(slot => {
            slot.element.classList.remove('selected');
        });

        if (this.slots[this.inventory.selectedSlot]) {
            this.slots[this.inventory.selectedSlot].element.classList.add('selected');
        }
    }

    updateDisplay() {
        this.slots.forEach((slot, index) => {
            const item = this.inventory.items[index];
            const blockColorEl = slot.element.querySelector('.slot-block');
            const countEl = slot.element.querySelector('.slot-count');

            if (item.count > 0) {
                blockColorEl.style.opacity = '1';
                if (countEl) {
                    countEl.textContent = item.count > 1 ? item.count : '';
                    countEl.style.display = item.count > 1 ? 'block' : 'none';
                }
            } else {
                blockColorEl.style.opacity = '0.3';
                if (countEl) {
                    countEl.style.display = 'none';
                }
            }
        });

        this.updateSelection();
    }

    getSelectedBlockId() {
        const item = this.inventory.getSelectedItem();
        return item.blockId;
    }
}
