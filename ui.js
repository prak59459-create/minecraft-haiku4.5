import { BLOCK_NAMES } from './blocks.js';

export class UI {
    constructor() {
        this.selectedBlock = 0;
        this.blocks = [1, 2, 3, 4, 5, 6, 7, 8, 9];
        this.fpsCounter = 0;
        this.lastTime = performance.now();
        this.fpsHistory = [];
        this.maxFpsHistory = 60;
        this.setupInventoryUI();
    }

    setupInventoryUI() {
        const slots = document.querySelectorAll('.inventory-slot');
        slots.forEach((slot, index) => {
            const blockId = parseInt(slot.dataset.block);
            slot.addEventListener('click', () => {
                this.selectBlock(index);
            });
            slot.addEventListener('mouseenter', () => {
                this.showTooltip(slot, BLOCK_NAMES[blockId]);
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

    showTooltip(slot, blockName) {
        if (!slot.querySelector('.tooltip')) {
            const tooltip = document.createElement('div');
            tooltip.className = 'tooltip';
            tooltip.textContent = blockName;
            tooltip.style.position = 'absolute';
            tooltip.style.bottom = '50px';
            tooltip.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
            tooltip.style.color = 'white';
            tooltip.style.padding = '4px 8px';
            tooltip.style.borderRadius = '3px';
            tooltip.style.fontSize = '12px';
            tooltip.style.whiteSpace = 'nowrap';
            tooltip.style.pointerEvents = 'none';
            slot.style.position = 'relative';
            slot.appendChild(tooltip);
            setTimeout(() => tooltip.remove(), 2000);
        }
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

        coordsEl.textContent = `X: ${playerPos.x.toFixed(1)} Y: ${playerPos.y.toFixed(1)} Z: ${playerPos.z.toFixed(1)} | C: [${chunkX}, ${chunkZ}]`;
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
