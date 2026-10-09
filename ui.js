import { BLOCK_NAMES } from './blocks.js';

export class Inventory {
    constructor() {
        this.maxSlots = 9;
        this.slots = new Array(this.maxSlots).fill(null).map(() => ({ blockId: 0, count: 0 }));
        this.initializeDefaultSlots();
    }

    initializeDefaultSlots() {
        const defaultBlocks = [1, 2, 3, 4, 5, 6, 7, 8, 9];
        for (let i = 0; i < defaultBlocks.length; i++) {
            this.slots[i] = { blockId: defaultBlocks[i], count: 64 };
        }
    }

    getSlot(index) {
        if (index < 0 || index >= this.maxSlots) return null;
        return this.slots[index];
    }

    setSlot(index, blockId, count = 1) {
        if (index < 0 || index >= this.maxSlots) return false;
        this.slots[index] = { blockId, count: Math.max(0, count) };
        return true;
    }

    addBlock(blockId, count = 1) {
        for (let i = 0; i < this.maxSlots; i++) {
            if (this.slots[i].blockId === blockId && this.slots[i].count < 64) {
                const available = 64 - this.slots[i].count;
                const toAdd = Math.min(available, count);
                this.slots[i].count += toAdd;
                count -= toAdd;
                if (count === 0) return true;
            }
        }
        for (let i = 0; i < this.maxSlots; i++) {
            if (this.slots[i].blockId === 0) {
                const toAdd = Math.min(64, count);
                this.slots[i] = { blockId, count: toAdd };
                count -= toAdd;
                if (count === 0) return true;
            }
        }
        return count === 0;
    }

    removeBlock(index, count = 1) {
        if (index < 0 || index >= this.maxSlots) return false;
        if (this.slots[index].count >= count) {
            this.slots[index].count -= count;
            if (this.slots[index].count === 0) {
                this.slots[index].blockId = 0;
            }
            return true;
        }
        return false;
    }
}

export class UI {
    constructor() {
        this.inventory = new Inventory();
        this.selectedSlot = 0;
        this.fpsCounter = 0;
        this.lastTime = performance.now();
        this.setupInventoryUI();
    }

    setupInventoryUI() {
        const slots = document.querySelectorAll('.inventory-slot');
        slots.forEach((slot, index) => {
            slot.addEventListener('click', () => {
                this.selectSlot(index);
            });
        });

        document.addEventListener('keydown', (e) => {
            const num = parseInt(e.key);
            if (num >= 1 && num <= 9) {
                this.selectSlot(num - 1);
            }
        });

        document.addEventListener('wheel', (e) => {
            e.preventDefault();
            const direction = e.deltaY > 0 ? 1 : -1;
            let newIndex = this.selectedSlot + direction;
            if (newIndex < 0) newIndex = 8;
            if (newIndex > 8) newIndex = 0;
            this.selectSlot(newIndex);
        }, { passive: false });

        this.updateInventoryDisplay();
    }

    selectSlot(index) {
        if (index < 0 || index > 8) return;

        const slots = document.querySelectorAll('.inventory-slot');
        slots.forEach(slot => slot.classList.remove('selected'));
        if (slots[index]) {
            slots[index].classList.add('selected');
        }

        this.selectedSlot = index;
    }

    updateInventoryDisplay() {
        const slots = document.querySelectorAll('.inventory-slot');
        slots.forEach((slot, index) => {
            const item = this.inventory.getSlot(index);
            if (item && item.blockId > 0) {
                const label = slot.querySelector('.slot-label') || this.createSlotLabel(slot);
                label.textContent = item.count > 1 ? item.count.toString() : '';
            }
        });
    }

    createSlotLabel(slot) {
        const label = document.createElement('div');
        label.className = 'slot-label';
        label.style.position = 'absolute';
        label.style.bottom = '2px';
        label.style.right = '2px';
        label.style.fontSize = '10px';
        label.style.color = 'white';
        slot.appendChild(label);
        return label;
    }

    getSelectedBlock() {
        const item = this.inventory.getSlot(this.selectedSlot);
        return item ? item.blockId : 1;
    }

    removeBlock() {
        return this.inventory.removeBlock(this.selectedSlot, 1);
    }

    addBlock(blockId) {
        return this.inventory.addBlock(blockId, 1);
    }

    setSlot(index, blockId, count = 1) {
        return this.inventory.setSlot(index, blockId, count);
    }

    updateHUD(playerPos, selectedBlockId, fps) {
        const coordsEl = document.getElementById('coords');
        const fpsEl = document.getElementById('fps');
        const blockEl = document.getElementById('blockInfo');

        const item = this.inventory.getSlot(this.selectedSlot);
        const displayBlock = item && item.blockId > 0 ? item.blockId : selectedBlockId;
        const countText = item && item.blockId > 0 && item.count > 1 ? ` x${item.count}` : '';

        coordsEl.textContent = `X: ${playerPos.x.toFixed(1)} Y: ${playerPos.y.toFixed(1)} Z: ${playerPos.z.toFixed(1)}`;
        fpsEl.textContent = `FPS: ${fps}`;
        blockEl.textContent = (BLOCK_NAMES[displayBlock] || 'Air') + countText;
    }

    updateFPS() {
        const now = performance.now();
        const delta = now - this.lastTime;
        this.lastTime = now;

        if (delta > 0) {
            this.fpsCounter = Math.round(1000 / delta);
        }

        return this.fpsCounter;
    }

    toggleHelp() {
        const help = document.getElementById('help');
        if (help) {
            help.classList.toggle('show');
        }
    }
}
