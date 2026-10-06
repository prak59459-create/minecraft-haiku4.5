import { BLOCK_NAMES } from './blocks.js';

export class UI {
    constructor() {
        this.selectedBlock = 1;
        this.blocks = [1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 12, 13, 14, 15, 16];
        this.currentHotbarIndex = 0;
        this.fpsCounter = 0;
        this.lastTime = performance.now();
        this.setupInventoryUI();
    }

    setupInventoryUI() {
        const slots = document.querySelectorAll('.inventory-slot');
        slots.forEach((slot, index) => {
            if (index < this.blocks.length) {
                const blockId = this.blocks[index];
                slot.textContent = '';
                const numSpan = document.createElement('span');
                numSpan.className = 'slot-number';
                numSpan.textContent = String(index + 1);
                const blockDiv = document.createElement('div');
                blockDiv.className = 'slot-block';
                const colors = this.getBlockColor(blockId);
                blockDiv.style.backgroundColor = colors;
                slot.appendChild(numSpan);
                slot.appendChild(blockDiv);

                slot.addEventListener('click', () => {
                    this.selectBlock(index);
                });
            }
        });

        document.addEventListener('keydown', (e) => {
            const num = parseInt(e.key);
            if (num >= 1 && num <= 9) {
                this.selectBlock(Math.min(num - 1, this.blocks.length - 1));
            }
        });

        document.addEventListener('wheel', (e) => {
            if (e.target === document.body || e.target.id === 'gameCanvas') {
                e.preventDefault();
                const direction = e.deltaY > 0 ? 1 : -1;
                let newIndex = this.currentHotbarIndex + direction;
                if (newIndex < 0) newIndex = Math.min(8, this.blocks.length - 1);
                if (newIndex >= Math.min(9, this.blocks.length)) newIndex = 0;
                this.selectBlock(newIndex);
            }
        }, { passive: false });
    }

    getBlockColor(blockId) {
        const colors = {
            1: '#808080', 2: '#228B22', 3: '#8B7355', 4: '#696969',
            5: '#654321', 6: '#2D5016', 7: '#EDD5B1', 8: '#4A90E2',
            9: '#999999', 11: '#1A1A1A', 12: '#B8860B', 13: '#FFD700',
            14: '#00CED1', 15: '#F0F8FF', 16: '#87CEEB'
        };
        return colors[blockId] || '#808080';
    }

    selectBlock(index) {
        if (index < 0 || index >= this.blocks.length || index >= 9) return;

        const slots = document.querySelectorAll('.inventory-slot');
        slots.forEach(slot => slot.classList.remove('selected'));
        if (slots[index]) {
            slots[index].classList.add('selected');
        }

        this.currentHotbarIndex = index;
        this.selectedBlock = this.blocks[index];
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
