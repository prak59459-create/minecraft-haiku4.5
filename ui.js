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
                this.selectBlock(index);
            });
            slot.addEventListener('pointerenter', () => {
                if (document.pointerLockElement === document.body) {
                    slot.style.opacity = '0.7';
                }
            });
            slot.addEventListener('pointerleave', () => {
                slot.style.opacity = '1';
            });
        });

        document.addEventListener('keydown', (e) => {
            const num = parseInt(e.key);
            if (num >= 1 && num <= 9 && document.pointerLockElement === document.body) {
                this.selectBlock(num - 1);
            }
        });

        document.addEventListener('wheel', (e) => {
            if (document.pointerLockElement === document.body) {
                e.preventDefault();
                const direction = e.deltaY > 0 ? 1 : -1;
                let newIndex = this.selectedBlock + direction;
                if (newIndex < 0) newIndex = 8;
                if (newIndex > 8) newIndex = 0;
                this.selectBlock(newIndex);
            }
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

        const px = Math.floor(playerPos.x * 10) / 10;
        const py = Math.floor(playerPos.y * 10) / 10;
        const pz = Math.floor(playerPos.z * 10) / 10;

        coordsEl.textContent = `X: ${px} Y: ${py} Z: ${pz}`;
        fpsEl.textContent = `FPS: ${fps}`;
        blockEl.textContent = `[${selectedBlock}] ${BLOCK_NAMES[selectedBlock] || 'Air'}`;

        const slots = document.querySelectorAll('.inventory-slot');
        slots.forEach((slot, i) => {
            if (i === this.selectedBlock) {
                slot.classList.add('selected');
            } else {
                slot.classList.remove('selected');
            }
        });
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
