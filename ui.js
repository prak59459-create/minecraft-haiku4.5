import { BLOCK_NAMES } from './blocks.js';

export class UI {
    constructor() {
        this.selectedIndex = 0;
        this.selectedBlock = 1;
        this.blocks = [];
        this.fpsCounter = 0;
        this.lastTime = performance.now();
        this.setupInventoryUI();
    }

    setupInventoryUI() {
        const slots = document.querySelectorAll('.inventory-slot');
        this.blocks = Array.from(slots).map(slot => parseInt(slot.dataset.block));
        this.selectedBlock = this.blocks[0];

        slots.forEach((slot, index) => {
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
            if (document.pointerLockElement !== document.body) return;
            e.preventDefault();
            const direction = e.deltaY > 0 ? 1 : -1;
            let newIndex = this.selectedIndex + direction;
            const slotCount = document.querySelectorAll('.inventory-slot').length;
            if (newIndex < 0) newIndex = slotCount - 1;
            if (newIndex >= slotCount) newIndex = 0;
            this.selectBlock(newIndex);
        }, { passive: false });
    }

    selectBlock(index) {
        const slots = document.querySelectorAll('.inventory-slot');
        if (index < 0 || index >= slots.length) return;

        slots.forEach(slot => slot.classList.remove('selected'));
        slots[index].classList.add('selected');

        this.selectedIndex = index;
        this.selectedBlock = this.blocks[index];
    }

    updateHUD(playerPos, selectedBlock, fps) {
        const coordsEl = document.getElementById('coords');
        const fpsEl = document.getElementById('fps');
        const blockEl = document.getElementById('blockInfo');

        const chunkX = Math.floor(playerPos.x / 16);
        const chunkZ = Math.floor(playerPos.z / 16);

        coordsEl.textContent = `${playerPos.x.toFixed(0)} / ${playerPos.y.toFixed(0)} / ${playerPos.z.toFixed(0)} (C: ${chunkX}, ${chunkZ})`;
        fpsEl.textContent = `FPS: ${fps}`;
        blockEl.textContent = BLOCK_NAMES[this.selectedBlock] || 'Air';
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
