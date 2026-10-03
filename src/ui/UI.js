import { BlockType } from '../world/BlockType.js';

export class UI {
    constructor(player, inputManager = null) {
        this.player = player;
        this.inputManager = inputManager;
        this.frameCount = 0;
        this.lastFrameTime = Date.now();
        this.fps = 0;
        this.lastSelectedSlot = -1;

        this.initElements();
    }

    initElements() {
        this.fpsElement = document.getElementById('fps');
        this.posElement = document.getElementById('pos');
        this.chunksElement = document.getElementById('chunks');
        this.timeElement = document.getElementById('time');
        this.lightElement = document.getElementById('lightLevel');
    }

    update(player, chunkManager, lighting) {
        this.updateFPS();
        this.updatePosition(player);
        this.updateChunkInfo(chunkManager);
        if (this.lastSelectedSlot !== player.selectedSlot) {
            this.updateBlockSelector();
            this.lastSelectedSlot = player.selectedSlot;
        }
        this.updateEnvironment(lighting);
    }

    updateFPS() {
        this.frameCount++;
        const now = Date.now();
        if (now - this.lastFrameTime >= 1000) {
            this.fps = this.frameCount;
            this.frameCount = 0;
            this.lastFrameTime = now;
        }
        if (this.fpsElement) {
            this.fpsElement.textContent = this.fps;
        }
    }

    updatePosition(player) {
        if (this.posElement) {
            const pos = player.camera.position;
            this.posElement.textContent = `${pos.x.toFixed(1)}, ${pos.y.toFixed(1)}, ${pos.z.toFixed(1)}`;
        }
    }

    updateChunkInfo(chunkManager) {
        if (this.chunksElement) {
            this.chunksElement.textContent = chunkManager.loadedChunks.size;
        }
    }

    updateBlockSelector() {
        const slots = document.querySelectorAll('.blockSlot');
        slots.forEach((slot, i) => {
            slot.classList.toggle('selected', i === this.player.selectedSlot);
        });
    }

    updateEnvironment(lighting) {
        if (this.timeElement) {
            const hours = Math.floor(lighting.timeOfDay * 24);
            const minutes = Math.floor((lighting.timeOfDay * 24 - hours) * 60);
            this.timeElement.textContent = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
        }

        if (this.lightElement) {
            const lightPercent = Math.round(lighting.lightLevel * 100);
            this.lightElement.textContent = `${lightPercent}%`;
        }
    }
}
