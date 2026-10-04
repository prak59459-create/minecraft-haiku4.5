import { BLOCK_NAMES } from './blocks.js';

export class UI {
    constructor() {
        this.selectedBlock = 1;
        this.blocks = [1, 2, 3, 4, 5, 6, 7, 8, 9];
        this.fpsCounter = 0;
        this.lastTime = performance.now();
        this.showHud = true;
        this.notifications = [];
        this.setupInventoryUI();
        this.createNotificationContainer();
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

            if (e.key === 'F1') {
                e.preventDefault();
                this.toggleHud();
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

    createNotificationContainer() {
        const container = document.createElement('div');
        container.id = 'notification-container';
        container.style.cssText = `
            position: fixed;
            top: 100px;
            left: 10px;
            pointer-events: none;
            z-index: 5;
        `;
        document.body.appendChild(container);
    }

    selectBlock(index) {
        if (index < 0 || index > 8) return;

        const slots = document.querySelectorAll('.inventory-slot');
        slots.forEach(slot => slot.classList.remove('selected'));
        slots[index].classList.add('selected');

        this.selectedBlock = index;
    }

    addNotification(message, duration = 3000) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        notification.style.cssText = `
            background: rgba(0, 0, 0, 0.7);
            color: white;
            padding: 10px 15px;
            border-radius: 4px;
            margin-bottom: 5px;
            font-family: Arial, sans-serif;
            font-size: 12px;
        `;

        const container = document.getElementById('notification-container');
        if (container) {
            container.appendChild(notification);
            setTimeout(() => notification.remove(), duration);
        }
    }

    updateHUD(playerPos, selectedBlock, fps) {
        if (!this.showHud) return;

        const coordsEl = document.getElementById('coords');
        const fpsEl = document.getElementById('fps');
        const blockEl = document.getElementById('blockInfo');

        if (coordsEl) {
            coordsEl.textContent = `X: ${playerPos.x.toFixed(1)} Y: ${playerPos.y.toFixed(1)} Z: ${playerPos.z.toFixed(1)}`;
        }
        if (fpsEl) {
            fpsEl.textContent = `FPS: ${fps}`;
        }
        if (blockEl) {
            blockEl.textContent = BLOCK_NAMES[selectedBlock] || 'Air';
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

    toggleHud() {
        this.showHud = !this.showHud;
        const hud = document.getElementById('hud');
        const inventory = document.getElementById('inventory');
        const crosshair = document.getElementById('crosshair');

        if (hud) hud.style.display = this.showHud ? 'block' : 'none';
        if (inventory) inventory.style.display = this.showHud ? 'flex' : 'none';
        if (crosshair) crosshair.style.display = this.showHud ? 'block' : 'none';
    }

    toggleHelp() {
        const help = document.getElementById('help');
        if (help) help.classList.toggle('show');
    }

    showMessage(title, message, type = 'info') {
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.9);
            border: 2px solid #4A90E2;
            border-radius: 8px;
            padding: 20px 30px;
            color: white;
            z-index: 999;
            min-width: 300px;
            text-align: center;
            font-family: Arial, sans-serif;
        `;

        modal.innerHTML = `
            <h2 style="margin: 0 0 10px 0; font-size: 18px;">${title}</h2>
            <p style="margin: 0 0 15px 0; font-size: 14px;">${message}</p>
            <button onclick="this.parentElement.remove()" style="
                background: #4A90E2;
                color: white;
                border: none;
                padding: 8px 20px;
                border-radius: 4px;
                cursor: pointer;
                font-size: 12px;
            ">OK</button>
        `;

        document.body.appendChild(modal);
        return modal;
    }
}
