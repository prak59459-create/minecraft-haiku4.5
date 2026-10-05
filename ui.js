import { BLOCK_NAMES } from './blocks.js';

export class UI {
    constructor() {
        this.selectedBlock = 0;
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
    }

    updateHUD(playerPos, selectedBlock, fps, player) {
        const coordsEl = document.getElementById('coords');
        const fpsEl = document.getElementById('fps');
        const blockEl = document.getElementById('blockInfo');

        coordsEl.textContent = `X: ${playerPos.x.toFixed(1)} Y: ${playerPos.y.toFixed(1)} Z: ${playerPos.z.toFixed(1)}`;
        fpsEl.textContent = `FPS: ${fps}`;
        blockEl.textContent = BLOCK_NAMES[selectedBlock] || 'Air';

        if (player) {
            const healthPercent = (player.health / player.maxHealth) * 100;
            const staminaPercent = (player.stamina / player.maxStamina) * 100;

            let healthBar = document.getElementById('healthBar');
            if (!healthBar) {
                healthBar = document.createElement('div');
                healthBar.id = 'healthBar';
                healthBar.style.cssText = 'position: absolute; bottom: 80px; left: 10px; width: 100px; height: 8px; background: rgba(0,0,0,0.5); border: 1px solid white;';
                document.getElementById('ui').appendChild(healthBar);
            }
            healthBar.style.backgroundImage = `linear-gradient(to right, #ff4444 ${healthPercent}%, rgba(0,0,0,0.3) ${healthPercent}%)`;

            let staminaBar = document.getElementById('staminaBar');
            if (!staminaBar) {
                staminaBar = document.createElement('div');
                staminaBar.id = 'staminaBar';
                staminaBar.style.cssText = 'position: absolute; bottom: 65px; left: 10px; width: 100px; height: 8px; background: rgba(0,0,0,0.5); border: 1px solid white;';
                document.getElementById('ui').appendChild(staminaBar);
            }
            staminaBar.style.backgroundImage = `linear-gradient(to right, #44ff44 ${staminaPercent}%, rgba(0,0,0,0.3) ${staminaPercent}%)`;
        }
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
