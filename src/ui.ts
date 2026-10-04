import { BlockType, getBlockName, getBlockColor } from './blocks.js';

const SELECTABLE_BLOCKS: BlockType[] = [
    BlockType.GRASS,
    BlockType.DIRT,
    BlockType.STONE,
    BlockType.WOOD,
    BlockType.LEAVES,
    BlockType.SAND,
    BlockType.GRAVEL,
    BlockType.COAL_ORE,
    BlockType.IRON_ORE
];

export class BlockSelector {
    selected: number = 0;
    blocks: BlockType[] = SELECTABLE_BLOCKS;

    constructor() {
        this.updateDisplay();
        this.setupKeyBindings();
    }

    updateDisplay(): void {
        const selector = document.getElementById('blockSelector');
        if (!selector) return;

        selector.innerHTML = '';
        for (let i = 0; i < this.blocks.length; i++) {
            const slot = document.createElement('div');
            slot.className = 'blockSlot' + (i === this.selected ? ' active' : '');
            slot.textContent = String(i + 1);
            slot.title = getBlockName(this.blocks[i]);
            slot.addEventListener('click', () => this.selectBlock(i));
            selector.appendChild(slot);
        }

        this.updateInfo();
    }

    selectBlock(index: number): void {
        if (index >= 0 && index < this.blocks.length) {
            this.selected = index;
            this.updateDisplay();
        }
    }

    getSelectedBlock(): BlockType {
        return this.blocks[this.selected];
    }

    private setupKeyBindings(): void {
        document.addEventListener('keydown', (e) => {
            const key = parseInt(e.key);
            if (key >= 1 && key <= 9) {
                this.selectBlock(key - 1);
            }
        });
    }

    private updateInfo(): void {
        const selected = document.getElementById('selectedBlock');
        if (selected) {
            selected.textContent = getBlockName(this.blocks[this.selected]);
        }
    }
}

export class HUD {
    lastTime: number = performance.now();
    frames: number = 0;

    update(player: any, world: any): void {
        const now = performance.now();
        const delta = (now - this.lastTime) / 1000;
        this.lastTime = now;

        this.frames++;
        if (this.frames % 30 === 0) {
            const fps = Math.round(1 / delta);
            const fpsEl = document.getElementById('fps');
            if (fpsEl) fpsEl.textContent = String(fps);
        }

        const posEl = document.getElementById('pos');
        if (posEl) {
            posEl.textContent = `${player.position.x.toFixed(1)}, ${player.position.y.toFixed(1)}, ${player.position.z.toFixed(1)}`;
        }

        const chunkEl = document.getElementById('chunk');
        if (chunkEl) {
            const cx = Math.floor(player.position.x / 16);
            const cz = Math.floor(player.position.z / 16);
            chunkEl.textContent = `${cx}, ${cz}`;
        }

        const hit = this.raycast(player);
        const blockEl = document.getElementById('targetBlock');
        if (blockEl) {
            blockEl.textContent = hit ? getBlockName(world.getBlock(hit.x, hit.y, hit.z)) : 'None';
        }

        this.updateTimeOfDay();
    }

    private raycast(player: any): { x: number, y: number, z: number } | null {
        const direction = new THREE.Vector3(0, 0, -1);
        direction.applyAxisAngle(new THREE.Vector3(1, 0, 0), player.pitch);
        direction.applyAxisAngle(new THREE.Vector3(0, 1, 0), player.yaw);

        let pos = player.position.clone();
        pos.y -= 1.7 / 2;

        for (let i = 0; i < 100; i++) {
            pos.addScaledVector(direction, 0.1);
            const block = player.world.getBlock(Math.floor(pos.x), Math.floor(pos.y), Math.floor(pos.z));
            if (block !== 0 && block !== 6) {
                return {
                    x: Math.floor(pos.x),
                    y: Math.floor(pos.y),
                    z: Math.floor(pos.z)
                };
            }
        }
        return null;
    }

    private updateTimeOfDay(): void {
        const timeEl = document.getElementById('timeOfDay');
        if (!timeEl) return;

        const t = (Date.now() / 1000 / 20) % 1;
        let time = '';
        if (t < 0.33) time = 'Day';
        else if (t < 0.5) time = 'Sunset';
        else if (t < 0.83) time = 'Night';
        else time = 'Sunrise';

        timeEl.textContent = time;
    }
}

import * as THREE from 'three';
