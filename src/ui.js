import { BLOCK_NAMES } from './blocks.js';

export class UI {
    constructor(player, world) {
        this.player = player;
        this.world = world;
        this.fpsCounter = 0;
        this.frameCount = 0;
        this.lastTime = performance.now();

        this.initHotbar();
    }

    initHotbar() {
        const hotbarDiv = document.getElementById('hotbar');
        for (let i = 0; i < 9; i++) {
            const slot = document.createElement('div');
            slot.className = 'hotbar-slot';
            if (i === 0) slot.classList.add('active');

            const blockName = document.createElement('div');
            blockName.textContent = BLOCK_NAMES[this.player.inventory[i]].charAt(0);
            slot.appendChild(blockName);

            const keyLabel = document.createElement('span');
            keyLabel.textContent = (i + 1).toString();
            slot.appendChild(keyLabel);

            hotbarDiv.appendChild(slot);
        }
    }

    updateHotbar() {
        const slots = document.querySelectorAll('.hotbar-slot');
        slots.forEach((slot, index) => {
            if (index === this.player.selectedBlockIndex) {
                slot.classList.add('active');
            } else {
                slot.classList.remove('active');
            }
        });
    }

    update(player, world, camera) {
        this.frameCount++;
        const now = performance.now();

        if (now - this.lastTime >= 1000) {
            this.fpsCounter = this.frameCount;
            this.frameCount = 0;
            this.lastTime = now;
        }

        document.getElementById('fps').textContent = this.fpsCounter;
        document.getElementById('pos').textContent =
            `${player.position.x.toFixed(1)}, ${player.position.y.toFixed(1)}, ${player.position.z.toFixed(1)}`;
        document.getElementById('chunks').textContent = world.chunks.size;
        document.getElementById('blocks').textContent = world.chunks.size * 4096;

        this.updateHotbar();

        const selectedBlockName = BLOCK_NAMES[player.selectedBlockType];
        document.getElementById('selectedBlock').textContent = selectedBlockName;

        this.updateBlockHighlight(camera, world);
    }

    updateBlockHighlight(camera, world) {
        const raycaster = new THREE.Raycaster();
        const direction = new THREE.Vector3();
        camera.getWorldDirection(direction);
        raycaster.ray.origin.copy(camera.position);
        raycaster.ray.direction.copy(direction);

        const intersects = raycaster.intersectObjects(world.chunks, true);

        if (intersects.length > 0) {
            const point = intersects[0].point;
            const blockName = `${Math.floor(point.x)}, ${Math.floor(point.y)}, ${Math.floor(point.z)}`;
            document.getElementById('blockName').textContent = blockName;
            document.getElementById('blockName').style.display = 'block';
        } else {
            document.getElementById('blockName').style.display = 'none';
        }
    }
}

import * as THREE from 'three';
