import { BLOCK_NAMES } from './blocks.js';

export class UI {
    constructor() {
        this.selectedBlock = 1;
        this.blocks = [1, 2, 3, 4, 5, 6, 7, 8, 9];
        this.fpsCounter = 0;
        this.fpsHistory = [];
        this.maxHistory = 60;
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
    }

    updateHUD(playerPos, selectedBlock, fps) {
        const coordsEl = document.getElementById('coords');
        const fpsEl = document.getElementById('fps');
        const blockEl = document.getElementById('blockInfo');

        const chunkX = Math.floor(playerPos.x / 16);
        const chunkZ = Math.floor(playerPos.z / 16);

        coordsEl.textContent = `X: ${playerPos.x.toFixed(1)} Y: ${playerPos.y.toFixed(1)} Z: ${playerPos.z.toFixed(1)} [C: ${chunkX},${chunkZ}]`;
        fpsEl.textContent = `FPS: ${fps}`;
        blockEl.textContent = BLOCK_NAMES[selectedBlock] || 'Air';
    }

    updateFPS() {
        const now = performance.now();
        const delta = now - this.lastTime;
        this.lastTime = now;

        if (delta > 0) {
            this.fpsCounter = Math.round(1000 / delta);
            this.fpsHistory.push(this.fpsCounter);
            if (this.fpsHistory.length > this.maxHistory) {
                this.fpsHistory.shift();
            }
        }

        return this.fpsCounter;
    }

    getAverageFPS() {
        if (this.fpsHistory.length === 0) return this.fpsCounter;
        const sum = this.fpsHistory.reduce((a, b) => a + b, 0);
        return Math.round(sum / this.fpsHistory.length);
    }

    toggleHelp() {
        const help = document.getElementById('help');
        help.classList.toggle('show');
    }
}
