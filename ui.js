import { BLOCK_NAMES } from './blocks.js';

export class UI {
    constructor() {
        this.selectedBlock = 1;
        this.blocks = [1, 2, 3, 4, 5, 6, 7, 8, 9];
        this.fpsCounter = 0;
        this.lastTime = performance.now();
        this.frameCount = 0;
        this.fpsUpdateTime = 0;

        this.coordsEl = document.getElementById('coords');
        this.fpsEl = document.getElementById('fps');
        this.blockEl = document.getElementById('blockInfo');
        this.slots = Array.from(document.querySelectorAll('.inventory-slot'));

        this.setupInventoryUI();
    }

    setupInventoryUI() {
    }

    selectBlock(index) {
        if (index < 0 || index > 8 || index === this.selectedBlock) return;

        this.slots[this.selectedBlock].classList.remove('selected');
        this.slots[index].classList.add('selected');
        this.selectedBlock = index;
    }

    updateHUD(playerPos, selectedBlock, fps) {
        this.coordsEl.textContent = `X: ${playerPos.x.toFixed(1)} Y: ${playerPos.y.toFixed(1)} Z: ${playerPos.z.toFixed(1)}`;
        this.fpsEl.textContent = `FPS: ${fps}`;
        this.blockEl.textContent = BLOCK_NAMES[selectedBlock] || 'Air';
    }

    updateFPS() {
        const now = performance.now();
        this.frameCount++;

        if (now - this.fpsUpdateTime >= 500) {
            this.fpsCounter = Math.round((this.frameCount * 1000) / (now - this.fpsUpdateTime));
            this.fpsUpdateTime = now;
            this.frameCount = 0;
        }

        return this.fpsCounter;
    }

    toggleHelp() {
        const help = document.getElementById('help');
        help.classList.toggle('show');
    }
}
