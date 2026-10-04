import * as THREE from 'three';
import { BLOCK_TYPES } from './blocks.js';

export class Player {
    constructor(camera) {
        this.camera = camera;
        this.position = new THREE.Vector3(0, 64, 0);
        this.velocity = new THREE.Vector3();
        this.direction = new THREE.Vector3();

        this.euler = new THREE.Euler(0, 0, 0, 'YXZ');
        this.pitch = 0;
        this.yaw = 0;

        this.speed = 4.3;
        this.sprintSpeed = 5.6;
        this.currentSpeed = this.speed;
        this.jumpForce = 8;
        this.gravity = 20;

        this.isOnGround = false;
        this.isMoving = false;
        this.isSprinting = false;
        this.isCrouching = false;

        this.eyeHeight = 1.62;
        this.height = 1.8;
        this.width = 0.6;

        this.selectedBlockIndex = 0;
        this.selectedBlockType = BLOCK_TYPES.DIRT;
        this.inventory = [
            BLOCK_TYPES.GRASS,
            BLOCK_TYPES.DIRT,
            BLOCK_TYPES.STONE,
            BLOCK_TYPES.COBBLESTONE,
            BLOCK_TYPES.SAND,
            BLOCK_TYPES.GLASS,
            BLOCK_TYPES.WOOD,
            BLOCK_TYPES.PLANKS,
            BLOCK_TYPES.BRICK
        ];

        this.isDestroyingBlock = false;
        this.isPlacingBlock = false;
        this.destroyProgress = 0;
        this.destroyTarget = null;
        this.destroyTime = 0;
        this.blockDestroyTimes = {
            [BLOCK_TYPES.GRASS]: 0.8,
            [BLOCK_TYPES.DIRT]: 0.8,
            [BLOCK_TYPES.STONE]: 3.0,
            [BLOCK_TYPES.WOOD]: 1.5,
            [BLOCK_TYPES.LEAVES]: 0.6,
            [BLOCK_TYPES.WATER]: 0,
            [BLOCK_TYPES.SAND]: 0.8,
            [BLOCK_TYPES.GRAVEL]: 0.8,
            [BLOCK_TYPES.GLASS]: 0.6,
            [BLOCK_TYPES.OAK_LOG]: 2.0,
            [BLOCK_TYPES.BEDROCK]: 999
        };

        this.keys = {};
    }

    handleKey(code, isPressed) {
        this.keys[code] = isPressed;

        if (code === 'KeyJ' && isPressed) {
            this.position.y += 30;
        }
    }

    handleMouseMove(dx, dy) {
        const sensitivity = 0.004;
        this.yaw -= dx * sensitivity;
        this.pitch -= dy * sensitivity;

        this.pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.pitch));

        this.euler.setFromQuaternion(new THREE.Quaternion());
        this.euler.setFromEuler(new THREE.Euler(this.pitch, this.yaw, 0, 'YXZ'));
    }

    selectBlock(index) {
        if (index >= 0 && index < this.inventory.length) {
            this.selectedBlockIndex = index;
            this.selectedBlockType = this.inventory[index];
        }
    }

    selectNextBlock() {
        this.selectedBlockIndex = (this.selectedBlockIndex + 1) % this.inventory.length;
        this.selectedBlockType = this.inventory[this.selectedBlockIndex];
    }

    selectPrevBlock() {
        this.selectedBlockIndex = (this.selectedBlockIndex - 1 + this.inventory.length) % this.inventory.length;
        this.selectedBlockType = this.inventory[this.selectedBlockIndex];
    }

    update(deltaTime, world) {
        const forward = new THREE.Vector3();
        const right = new THREE.Vector3();

        this.euler.order = 'YXZ';
        this.euler.setFromEuler(new THREE.Euler(this.pitch, this.yaw, 0));
        this.camera.quaternion.setFromEuler(this.euler);

        forward.setFromMatrixColumn(this.camera.matrix, 0).negate();
        right.setFromMatrixColumn(this.camera.matrix, 0);
        forward.y = 0;
        right.y = 0;
        forward.normalize();
        right.normalize();

        let moveX = 0;
        let moveZ = 0;

        if (this.keys['KeyW']) moveZ -= 1;
        if (this.keys['KeyS']) moveZ += 1;
        if (this.keys['KeyA']) moveX -= 1;
        if (this.keys['KeyD']) moveX += 1;

        this.direction.copy(right).multiplyScalar(moveX)
            .addScaledVector(forward, moveZ);

        if (this.direction.length() > 0) {
            this.isMoving = true;
        } else {
            this.isMoving = false;
        }

        this.isSprinting = (this.keys['ShiftLeft'] || this.keys['ShiftRight']) && this.isMoving;
        this.currentSpeed = this.isSprinting ? this.sprintSpeed : this.speed;

        if (this.isMoving) {
            this.direction.normalize();
            this.velocity.x += this.direction.x * this.currentSpeed * 0.2;
            this.velocity.z += this.direction.z * this.currentSpeed * 0.2;
        } else {
            this.velocity.x *= 0.85;
            this.velocity.z *= 0.85;
        }

        const maxSpeed = this.currentSpeed * 1.5;
        const currentSpeed = Math.sqrt(this.velocity.x ** 2 + this.velocity.z ** 2);
        if (currentSpeed > maxSpeed) {
            const scale = maxSpeed / currentSpeed;
            this.velocity.x *= scale;
            this.velocity.z *= scale;
        }

        if (this.keys['Space'] && this.isOnGround) {
            this.velocity.y = this.jumpForce;
            this.isOnGround = false;
        }

        this.velocity.y -= this.gravity * deltaTime;

        this.position.addScaledVector(this.velocity, deltaTime);
        this.isOnGround = false;
    }
}
