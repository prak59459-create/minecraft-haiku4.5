export class Input {
    constructor(player, world) {
        this.player = player;
        this.world = world;
        this.pointerLocked = false;

        this.keys = {
            w: false,
            a: false,
            s: false,
            d: false,
            shift: false,
            space: false,
            control: false
        };

        this.setupEventListeners();
        this.setupHotbar();
    }

    setupEventListeners() {
        document.addEventListener('keydown', (e) => this.onKeyDown(e));
        document.addEventListener('keyup', (e) => this.onKeyUp(e));
        document.addEventListener('mousemove', (e) => this.onMouseMove(e));
        document.addEventListener('mousedown', (e) => this.onMouseDown(e));
        document.addEventListener('wheel', (e) => this.onScroll(e));
    }

    setupHotbar() {
        const hotbar = document.getElementById('hotbar');
        hotbar.innerHTML = '';
        this.player.blockInventory.forEach((block, index) => {
            const slot = document.createElement('div');
            slot.className = 'hotbar-slot';
            if (index === this.player.selectedBlock) slot.classList.add('selected');
            slot.textContent = index + 1;
            slot.style.cursor = 'pointer';
            slot.addEventListener('click', () => this.selectBlock(index));
            hotbar.appendChild(slot);
        });
    }

    selectBlock(index) {
        document.querySelectorAll('.hotbar-slot').forEach(slot => slot.classList.remove('selected'));
        document.querySelectorAll('.hotbar-slot')[index].classList.add('selected');
        this.player.selectBlock(index);
    }

    onKeyDown(e) {
        const key = e.key.toLowerCase();
        if (key === 'w') this.keys.w = true;
        if (key === 'a') this.keys.a = true;
        if (key === 's') this.keys.s = true;
        if (key === 'd') this.keys.d = true;
        if (key === 'shift') this.keys.shift = true;
        if (key === ' ') {
            e.preventDefault();
            this.keys.space = true;
        }
        if (key === 'control') this.keys.control = true;

        if (key >= '1' && key <= '9') {
            const index = parseInt(key) - 1;
            this.selectBlock(Math.min(index, this.player.blockInventory.length - 1));
        }
    }

    onKeyUp(e) {
        const key = e.key.toLowerCase();
        if (key === 'w') this.keys.w = false;
        if (key === 'a') this.keys.a = false;
        if (key === 's') this.keys.s = false;
        if (key === 'd') this.keys.d = false;
        if (key === 'shift') this.keys.shift = false;
        if (key === ' ') this.keys.space = false;
        if (key === 'control') this.keys.control = false;
    }

    onMouseMove(e) {
        if (!this.pointerLocked) return;
        this.player.rotate(e.movementX, e.movementY);
    }

    onMouseDown(e) {
        if (!this.pointerLocked) return;

        if (e.button === 0) {
            this.onLeftClick();
        } else if (e.button === 2) {
            this.onRightClick();
        }
    }

    onScroll(e) {
        e.preventDefault();
        const direction = e.deltaY > 0 ? 1 : -1;
        const newIndex = this.player.selectedBlock + direction;
        this.selectBlock(newIndex);
    }

    onLeftClick() {
        const raycast = this.world.rayCastFromPlayer(this.player);
        if (raycast) {
            this.world.destroyBlock(raycast.chunk, raycast.localPos);
        }
    }

    onRightClick() {
        const raycast = this.world.rayCastFromPlayer(this.player);
        if (raycast) {
            const newPos = raycast.worldPos.add(raycast.normal);
            const blockType = this.player.blockInventory[this.player.selectedBlock].type;
            this.world.placeBlock(newPos, blockType);
        }
    }

    update(deltaTime) {
        const targetVelocity = new THREE.Vector3();

        const forward = this.player.getForwardDirection();
        const right = this.player.getRightDirection();

        forward.y = 0;
        right.y = 0;

        if (this.keys.w) targetVelocity.addScaledVector(forward, 1);
        if (this.keys.s) targetVelocity.addScaledVector(forward, -1);
        if (this.keys.d) targetVelocity.addScaledVector(right, 1);
        if (this.keys.a) targetVelocity.addScaledVector(right, -1);

        if (targetVelocity.length() > 0) {
            targetVelocity.normalize();
            const speed = this.keys.shift ? this.player.sprintSpeed : this.player.speed;
            targetVelocity.multiplyScalar(speed);
        }

        this.player.velocity.x = targetVelocity.x;
        this.player.velocity.z = targetVelocity.z;

        if (this.keys.space && this.player.isGrounded) {
            this.player.velocity.y = this.player.jumpPower;
            this.player.isGrounded = false;
        }

        this.player.isSprinting = this.keys.shift && (this.keys.w || this.keys.s);
        this.player.isCrouching = this.keys.control;
    }
}

import * as THREE from 'three';
