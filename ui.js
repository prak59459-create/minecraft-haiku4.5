import { BLOCK_NAMES, BLOCKS } from './blocks.js';

export class UI {
    constructor() {
        this.selectedBlock = 0;
        this.blocks = [BLOCKS.STONE, BLOCKS.GRASS, BLOCKS.DIRT, BLOCKS.COBBLESTONE, BLOCKS.OAK_LOG, BLOCKS.OAK_LEAVES, BLOCKS.SAND, BLOCKS.WATER, BLOCKS.GRAVEL];
        this.fpsCounter = 0;
        this.lastTime = performance.now();
        this.frameCount = 0;
        this.setupInventoryUI();
    }

    setupInventoryUI() {
        const slots = document.querySelectorAll('.inventory-slot');
        slots.forEach((slot, index) => {
            slot.addEventListener('click', () => {
                this.selectBlock(index);
            });
            slot.addEventListener('touchstart', (e) => {
                e.preventDefault();
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

    getSelectedBlockType() {
        return this.blocks[this.selectedBlock];
    }

    toggleHelp() {
        const helpEl = document.getElementById('help');
        helpEl.classList.toggle('show');
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
