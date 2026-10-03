import { BLOCK_NAMES } from './blocks.js';

export class UI {
    constructor() {
        this.fpsDisplay = document.getElementById('fps');
        this.posDisplay = document.getElementById('pos');
        this.chunksDisplay = document.getElementById('chunks');
        this.blockNameDisplay = document.getElementById('blockName');
        this.inventoryContainer = document.getElementById('inventory');
        this.lastFpsUpdate = 0;

        this.setupInventory();
    }

    setupInventory() {
        for (let i = 0; i < 9; i++) {
            const slot = document.createElement('div');
            slot.className = 'inventory-slot';
            if (i === 0) slot.classList.add('selected');

            const blockName = BLOCK_NAMES[i];
            slot.textContent = blockName ? blockName.charAt(0).toUpperCase() : '-';
            slot.title = blockName || 'Empty';

            slot.addEventListener('click', () => {
                document.querySelectorAll('.inventory-slot').forEach(s => s.classList.remove('selected'));
                slot.classList.add('selected');
            });

            this.inventoryContainer.appendChild(slot);
        }
    }

    updateStats(stats) {
        this.fpsDisplay.textContent = stats.fps;
        this.posDisplay.textContent = `${Math.floor(stats.position.x)}, ${Math.floor(stats.position.y)}, ${Math.floor(stats.position.z)}`;
        this.chunksDisplay.textContent = stats.chunkCount;
    }

    updateSelectedBlock(blockType) {
        this.blockNameDisplay.textContent = blockType;
    }
}
