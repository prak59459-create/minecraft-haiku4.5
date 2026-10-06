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
            const blockId = parseInt(slot.dataset.block);
            slot.addEventListener('click', () => {
                this.selectBlock(index);
            });
        });

        document.addEventListener('keydown', (e) => {
            const num = parseInt(e.key);
            if (num >= 1 && num <= 9) {
                this.selectBlock(num - 1);
            }
        });

        document.addEventListener('wheel', (e) => {
            e.preventDefault();
            const direction = e.deltaY > 0 ? 1 : -1;
            let newIndex = this.selectedBlock + direction;
            if (newIndex < 0) newIndex = 8;
            if (newIndex > 8) newIndex = 0;
            this.selectBlock(newIndex);
        }, { passive: false });
    }

    selectBlock(index) {
        if (index < 0 || index > 8) return;

        const slots = document.querySelectorAll('.inventory-slot');
        slots.forEach(slot => slot.classList.remove('selected'));
        slots[index].classList.add('selected');

        this.selectedBlock = index;
        this.showSelectionFeedback(index);
    }

    showSelectionFeedback(index) {
        const blockId = this.blocks[index];
        const blockName = BLOCK_NAMES[blockId];
        const message = document.createElement('div');
        message.style.cssText = `
            position: fixed;
            bottom: 90px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0, 0, 0, 0.5);
            color: rgba(255, 255, 255, 0.9);
            padding: 5px 10px;
            border-radius: 3px;
            font-size: 12px;
            font-family: 'Courier New', monospace;
            pointer-events: none;
            animation: fadeInOut 0.5s ease-in-out;
            z-index: 15;
        `;
        message.textContent = `Selected: ${blockName}`;
        document.body.appendChild(message);
        setTimeout(() => message.remove(), 500);
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
