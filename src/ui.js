import { BLOCK_TYPES, BLOCK_DATA } from './blocks.js';

export class UI {
    constructor(player, world) {
        this.player = player;
        this.world = world;
        this.lastFpsTime = Date.now();
        this.frameCount = 0;
        this.fps = 60;
        this.maxFps = 0;
        this.minFps = 999;
        this.avgFpsBuffer = [];
        this.avgFpsBufferSize = 60;
    }

    initHotbar() {
        const hotbarBlocks = [
            BLOCK_TYPES.GRASS,
            BLOCK_TYPES.DIRT,
            BLOCK_TYPES.STONE,
            BLOCK_TYPES.WOOD,
            BLOCK_TYPES.SAND,
            BLOCK_TYPES.LEAVES,
            BLOCK_TYPES.GRAVEL,
            BLOCK_TYPES.LOG,
            BLOCK_TYPES.AIR,
        ];

        const hotbarEl = document.getElementById('hotbar');
        hotbarEl.innerHTML = '';

        for (let i = 0; i < hotbarBlocks.length; i++) {
            const blockType = hotbarBlocks[i];
            const blockName = BLOCK_DATA[blockType].name;
            const slot = document.createElement('div');
            slot.className = 'hotbar-slot';
            slot.textContent = blockName.substring(0, 3);
            slot.title = blockName;
            slot.id = `hotbar-${i}`;

            slot.addEventListener('click', () => {
                this.player.selectHotbarSlot(i);
            });

            hotbarEl.appendChild(slot);
        }
    }

    updateHotbar() {
        for (let i = 0; i < 9; i++) {
            const slot = document.getElementById(`hotbar-${i}`);
            if (slot) {
                if (i === this.player.selectedHotbarIndex) {
                    slot.classList.add('active');
                } else {
                    slot.classList.remove('active');
                }
            }
        }
    }

    updateDebugInfo() {
        const now = Date.now();
        this.frameCount++;

        if (now - this.lastFpsTime >= 1000) {
            this.fps = this.frameCount;
            this.frameCount = 0;
            this.lastFpsTime = now;

            this.avgFpsBuffer.push(this.fps);
            if (this.avgFpsBuffer.length > this.avgFpsBufferSize) {
                this.avgFpsBuffer.shift();
            }

            this.maxFps = Math.max(...this.avgFpsBuffer);
            this.minFps = Math.min(...this.avgFpsBuffer);
        }

        const fpsEl = document.getElementById('fps');
        if (fpsEl) {
            const avgFps = this.avgFpsBuffer.length > 0
                ? Math.round(this.avgFpsBuffer.reduce((a, b) => a + b) / this.avgFpsBuffer.length)
                : this.fps;
            fpsEl.textContent = `FPS: ${this.fps} (avg: ${avgFps} min: ${this.minFps})`;
        }

        const posEl = document.getElementById('position');
        if (posEl) {
            const x = this.player.position.x.toFixed(2);
            const y = this.player.position.y.toFixed(2);
            const z = this.player.position.z.toFixed(2);
            posEl.textContent = `X: ${x} Y: ${y} Z: ${z}`;
        }

        const chunksEl = document.getElementById('chunks');
        if (chunksEl) {
            const chunkCount = this.world.chunks.size;
            chunksEl.textContent = `Chunks: ${chunkCount}`;
        }

        const blocksEl = document.getElementById('blocks');
        if (blocksEl) {
            let blockCount = 0;
            for (const chunk of this.world.chunks.values()) {
                blockCount += chunk.blocks.size;
            }
            blocksEl.textContent = `Blocks: ${blockCount}`;
        }

        const debugEl = document.getElementById('debug');
        if (debugEl) {
            debugEl.textContent = `Seed: ${this.world.seed}`;
        }
    }

    showHelpText() {
        const helpEl = document.getElementById('helpText');
        if (helpEl) {
            helpEl.classList.add('show');
            setTimeout(() => {
                helpEl.classList.remove('show');
            }, 3000);
        }
    }

    updateBlockInfo() {
        const hit = this.player.getRaycast(5);
        const blockInfoEl = document.getElementById('blockInfo');

        if (hit && blockInfoEl) {
            const blockType = this.player.world.getBlockAt(hit.pos.x, hit.pos.y, hit.pos.z);
            const blockName = BLOCK_DATA[blockType]?.name || 'Unknown';
            blockInfoEl.textContent = blockName;
            blockInfoEl.classList.add('active');
        } else if (blockInfoEl) {
            blockInfoEl.classList.remove('active');
        }
    }

    update() {
        this.updateDebugInfo();
        this.updateHotbar();
        this.updateBlockInfo();
    }
}
