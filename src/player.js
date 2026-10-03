import * as THREE from 'three';
import { BLOCK_TYPES } from './blocks.js';

export class Player {
    constructor(world) {
        this.world = world;
        this.position = new THREE.Vector3(0, 70, 0);
        this.velocity = new THREE.Vector3(0, 0, 0);
        this.euler = new THREE.Euler(0, 0, 0, 'YXZ');

        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.copy(this.position);
        this.camera.position.y += 1.6;

        this.input = {
            forward: false,
            backward: false,
            left: false,
            right: false,
            jump: false,
        };

        this.onGround = false;
        this.isSprinting = false;
        this.isCrouching = false;
        this.selectedBlock = BLOCK_TYPES.GRASS;
        this.selectedHotbarIndex = 0;

        this.setupControls();
        this.raycaster = new THREE.Raycaster();
    }

    setupControls() {
        const onKeyDown = (e) => {
            const key = e.key.toLowerCase();
            switch (key) {
                case 'w': this.input.forward = true; break;
                case 'a': this.input.left = true; break;
                case 's': this.input.backward = true; break;
                case 'd': this.input.right = true; break;
                case ' ':
                    e.preventDefault();
                    this.input.jump = true;
                    break;
                case 'shift':
                    this.isSprinting = true;
                    break;
            }

            if (key >= '1' && key <= '9') {
                const index = parseInt(key) - 1;
                this.selectHotbarSlot(index);
            }
        };

        const onKeyUp = (e) => {
            const key = e.key.toLowerCase();
            switch (key) {
                case 'w': this.input.forward = false; break;
                case 'a': this.input.left = false; break;
                case 's': this.input.backward = false; break;
                case 'd': this.input.right = false; break;
                case ' ':
                    e.preventDefault();
                    this.input.jump = false;
                    break;
                case 'shift':
                    this.isSprinting = false;
                    break;
            }
        };

        window.addEventListener('keydown', onKeyDown);
        window.addEventListener('keyup', onKeyUp);
    }

    selectHotbarSlot(index) {
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

        if (index >= 0 && index < hotbarBlocks.length) {
            this.selectedHotbarIndex = index;
            this.selectedBlock = hotbarBlocks[index];
        }
    }

    updateCamera() {
        this.camera.position.copy(this.position);
        this.camera.position.y += 1.6;
        this.camera.quaternion.setFromEuler(this.euler);
    }

    getRaycast(distance = 10) {
        const origin = this.camera.position.clone();
        origin.y -= 1.6;

        const direction = new THREE.Vector3();
        this.camera.getWorldDirection(direction);

        this.raycaster.set(origin, direction);

        const blockPositions = [];
        const minX = Math.floor(this.position.x - distance);
        const maxX = Math.floor(this.position.x + distance);
        const minY = Math.max(0, Math.floor(this.position.y - distance));
        const maxY = Math.min(256, Math.floor(this.position.y + distance));
        const minZ = Math.floor(this.position.z - distance);
        const maxZ = Math.floor(this.position.z + distance);

        for (let x = minX; x <= maxX; x++) {
            for (let y = minY; y <= maxY; y++) {
                for (let z = minZ; z <= maxZ; z++) {
                    const blockType = this.world.getBlockAt(x, y, z);
                    if (blockType !== BLOCK_TYPES.AIR) {
                        const box = new THREE.Box3(
                            new THREE.Vector3(x, y, z),
                            new THREE.Vector3(x + 1, y + 1, z + 1)
                        );
                        const intersection = this.raycaster.ray.intersectBox(box);
                        if (intersection) {
                            blockPositions.push({
                                pos: new THREE.Vector3(x, y, z),
                                dist: origin.distanceTo(intersection),
                            });
                        }
                    }
                }
            }
        }

        blockPositions.sort((a, b) => a.dist - b.dist);
        return blockPositions[0] || null;
    }

    destroyBlock() {
        const hit = this.getRaycast(5);
        if (hit) {
            const x = hit.pos.x;
            const y = hit.pos.y;
            const z = hit.pos.z;
            this.world.setBlockAt(x, y, z, BLOCK_TYPES.AIR);
        }
    }

    placeBlock() {
        const hit = this.getRaycast(5);
        if (hit && this.selectedBlock !== BLOCK_TYPES.AIR) {
            const x = hit.pos.x;
            const y = hit.pos.y;
            const z = hit.pos.z;

            const direction = hit.pos.clone().sub(this.camera.position);
            const face = this.getFaceHit(direction);

            let placeX = x;
            let placeY = y;
            let placeZ = z;

            switch (face) {
                case 'top': placeY++; break;
                case 'bottom': placeY--; break;
                case 'front': placeZ++; break;
                case 'back': placeZ--; break;
                case 'right': placeX++; break;
                case 'left': placeX--; break;
            }

            const playerBox = new THREE.Box3(
                new THREE.Vector3(this.position.x - 0.3, this.position.y, this.position.z - 0.3),
                new THREE.Vector3(this.position.x + 0.3, this.position.y + 1.8, this.position.z + 0.3)
            );

            const placeBox = new THREE.Box3(
                new THREE.Vector3(placeX, placeY, placeZ),
                new THREE.Vector3(placeX + 1, placeY + 1, placeZ + 1)
            );

            if (!playerBox.intersectsBox(placeBox)) {
                this.world.setBlockAt(placeX, placeY, placeZ, this.selectedBlock);
            }
        }
    }

    getFaceHit(direction) {
        const absX = Math.abs(direction.x);
        const absY = Math.abs(direction.y);
        const absZ = Math.abs(direction.z);

        if (absX > absY && absX > absZ) {
            return direction.x > 0 ? 'right' : 'left';
        } else if (absY > absZ) {
            return direction.y > 0 ? 'top' : 'bottom';
        } else {
            return direction.z > 0 ? 'front' : 'back';
        }
    }
}
