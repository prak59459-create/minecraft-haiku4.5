import { BLOCKS } from './blocks.js';

export class BlockHighlight {
    constructor(scene) {
        this.scene = scene;
        this.highlightedBlocks = new Map();
        this.breakProgress = new Map();
        this.breakTextures = [];

        this.createBreakStages();
    }

    createBreakStages() {
        const stages = 10;
        for (let i = 0; i < stages; i++) {
            const canvas = document.createElement('canvas');
            canvas.width = 16;
            canvas.height = 16;
            const ctx = canvas.getContext('2d');

            ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
            ctx.fillRect(0, 0, 16, 16);

            const progress = i / stages;
            const size = Math.ceil(16 * progress);
            ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
            ctx.fillRect(8 - size/2, 8 - size/2, size, size);

            const texture = new THREE.CanvasTexture(canvas);
            this.breakTextures.push(texture);
        }
    }

    addBlockDamage(x, y, z, damage) {
        const key = `${x},${y},${z}`;
        const current = this.breakProgress.get(key) || 0;
        const newProgress = Math.min(1, current + damage);

        this.breakProgress.set(key, newProgress);

        if (newProgress >= 1) {
            this.breakProgress.delete(key);
            return true;
        }
        return false;
    }

    getBlockDamage(x, y, z) {
        const key = `${x},${y},${z}`;
        return this.breakProgress.get(key) || 0;
    }

    clear() {
        this.breakProgress.clear();
        this.highlightedBlocks.clear();
    }

    update() {
        // Can add time-based damage effects here
    }
}
