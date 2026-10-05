import { BLOCK_COLORS, BLOCK_NAMES } from './blocks.js';

export class Hotbar {
    constructor(inventory) {
        this.inventory = inventory;
        this.selectedSlot = 0;
        this.createUI();
    }

    createUI() {
        const existingHotbar = document.getElementById('hotbar');
        if (existingHotbar) {
            existingHotbar.remove();
        }

        const hotbar = document.createElement('div');
        hotbar.id = 'hotbar';
        hotbar.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            display: flex;
            gap: 5px;
            background: rgba(0, 0, 0, 0.6);
            padding: 10px;
            border: 2px solid rgba(255, 255, 255, 0.3);
            border-radius: 8px;
            z-index: 100;
        `;

        for (let i = 0; i < 9; i++) {
            const slot = document.createElement('div');
            slot.className = 'hotbar-slot';
            slot.dataset.slot = i;
            slot.style.cssText = `
                width: 50px;
                height: 50px;
                background: rgba(0, 0, 0, 0.7);
                border: 2px solid rgba(255, 255, 255, 0.2);
                border-radius: 4px;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                font-size: 11px;
                color: white;
                font-family: Arial, sans-serif;
                position: relative;
                transition: all 0.1s ease;
            `;

            const blockColorDiv = document.createElement('div');
            blockColorDiv.className = 'slot-color';
            blockColorDiv.style.cssText = `
                width: 40px;
                height: 40px;
                border-radius: 2px;
                margin-bottom: 2px;
            `;

            const countDiv = document.createElement('div');
            countDiv.className = 'slot-count';
            countDiv.style.cssText = `
                font-size: 10px;
                font-weight: bold;
            `;

            slot.appendChild(blockColorDiv);
            slot.appendChild(countDiv);

            slot.addEventListener('click', () => this.selectSlot(i));
            hotbar.appendChild(slot);
        }

        document.body.appendChild(hotbar);
        this.hotbarElement = hotbar;
        this.updateDisplay();
    }

    selectSlot(index) {
        if (index >= 0 && index < 9) {
            this.selectedSlot = index;
            this.inventory.selectQuickSlot(index);
            this.updateDisplay();
        }
    }

    updateDisplay() {
        const slots = this.hotbarElement.querySelectorAll('.hotbar-slot');

        slots.forEach((slotEl, index) => {
            const slotInfo = this.inventory.getSlotInfo(index);
            const colorDiv = slotEl.querySelector('.slot-color');
            const countDiv = slotEl.querySelector('.slot-count');

            const blockColor = BLOCK_COLORS[slotInfo.blockId] || 0x808080;
            const color = new THREE.Color(blockColor);
            colorDiv.style.backgroundColor = `rgb(${Math.round(color.r * 255)}, ${Math.round(color.g * 255)}, ${Math.round(color.b * 255)})`;

            countDiv.textContent = slotInfo.count > 0 ? slotInfo.count : '';

            if (index === this.selectedSlot) {
                slotEl.style.border = '2px solid #FFD700';
                slotEl.style.boxShadow = '0 0 10px rgba(255, 215, 0, 0.5)';
            } else {
                slotEl.style.border = '2px solid rgba(255, 255, 255, 0.2)';
                slotEl.style.boxShadow = 'none';
            }
        });
    }

    addItemToHotbar(blockId, count) {
        const added = this.inventory.addBlock(blockId, count);
        this.updateDisplay();
        return added;
    }

    removeItemFromSelected(count) {
        const success = this.inventory.removeBlock(this.selectedSlot, count);
        this.updateDisplay();
        return success;
    }

    getSelectedBlock() {
        return this.inventory.getSelectedBlock();
    }
}
