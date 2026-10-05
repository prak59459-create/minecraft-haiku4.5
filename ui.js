import { BLOCK_NAMES } from './blocks.js';

export class UI {
    constructor() {
        this.selectedBlock = 1;
        this.blocks = [1, 2, 3, 4, 5, 6, 7, 8, 9];
        this.fpsCounter = 0;
        this.lastTime = performance.now();
        this.setupInventoryUI();
    }

    setupInventoryUI() {
        const slots = document.querySelectorAll('.inventory-slot');
        slots.forEach((slot, index) => {
            slot.addEventListener('click', () => {
                this.selectInventorySlot(index);
            });
        });
    }

    selectInventorySlot(index) {
        if (index < 0 || index > 8) return;
        const slots = document.querySelectorAll('.inventory-slot');
        slots.forEach(slot => slot.classList.remove('selected'));
        if (slots[index]) {
            slots[index].classList.add('selected');
        }
        this.selectedBlock = index;
    }

    selectBlock(index) {
        this.selectInventorySlot(index);
    }

    updateHUD(playerPos, selectedBlock, fps) {
        const coordsEl = document.getElementById('coords');
        const fpsEl = document.getElementById('fps');
        const blockEl = document.getElementById('blockInfo');

        coordsEl.textContent = `X: ${playerPos.x.toFixed(1)} Y: ${playerPos.y.toFixed(1)} Z: ${playerPos.z.toFixed(1)}`;
        fpsEl.textContent = `FPS: ${fps}`;
        blockEl.textContent = BLOCK_NAMES[selectedBlock] || 'Air';
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
        help.classList.toggle('show');
    }
}
