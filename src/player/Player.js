import * as THREE from 'three';
import { BlockType } from '../world/BlockType.js';

export class Player {
    constructor(camera, chunkManager) {
        this.camera = camera;
        this.chunkManager = chunkManager;

        this.position = camera.position.clone();
        this.velocity = new THREE.Vector3();

        this.moveSpeed = 0.15;
        this.sprintSpeed = 0.3;
        this.jumpForce = 0.5;
        this.eyeHeight = 0.6;

        this.isOnGround = false;
        this.isJumping = false;
        this.isSprinting = false;
        this.isCrouching = false;

        this.selectedBlock = BlockType.DIRT;
        this.selectedSlot = 0;

        this.blocks = [
            BlockType.GRASS,
            BlockType.DIRT,
            BlockType.STONE,
            BlockType.WOOD,
            BlockType.LEAVES,
            BlockType.SAND,
            BlockType.GRAVEL,
            BlockType.COBBLESTONE,
            BlockType.COAL_ORE
        ];

        this.blockReachDistance = 5;
        this.lastClickTime = 0;
        this.clickDelay = 100;
    }

    selectBlock(index) {
        if (index >= 0 && index < this.blocks.length) {
            this.selectedSlot = index;
            this.selectedBlock = this.blocks[index];
        }
    }

    updatePhysics(gravity, chunkManager) {
        const moveDir = new THREE.Vector3();

        if (this.keys?.forward) moveDir.z -= 1;
        if (this.keys?.backward) moveDir.z += 1;
        if (this.keys?.left) moveDir.x -= 1;
        if (this.keys?.right) moveDir.x += 1;

        const speed = this.isSprinting ? this.sprintSpeed : this.moveSpeed;
        moveDir.normalize();
        moveDir.applyQuaternion(this.camera.quaternion);
        moveDir.y = 0;

        this.velocity.x = moveDir.x * speed;
        this.velocity.z = moveDir.z * speed;

        this.velocity.y -= gravity;
        this.velocity.y = Math.max(-0.5, this.velocity.y);

        this.position.add(this.velocity);
        this.checkCollisions();

        this.camera.position.copy(this.position);
    }

    checkCollisions() {
        const radius = 0.3;
        const height = 1.6;

        const checkPoints = [
            new THREE.Vector3(radius, 0, 0),
            new THREE.Vector3(-radius, 0, 0),
            new THREE.Vector3(0, 0, radius),
            new THREE.Vector3(0, 0, -radius),
            new THREE.Vector3(0, height - 0.1, 0)
        ];

        this.isOnGround = false;

        for (const offset of checkPoints) {
            const checkPos = this.position.clone().add(offset);
            const x = Math.floor(checkPos.x);
            const y = Math.floor(checkPos.y);
            const z = Math.floor(checkPos.z);

            const block = this.chunkManager.getBlock(x, y, z);
            if (block > 0 && block !== BlockType.WATER) {
                if (offset.y === 0) {
                    // Side collision
                    this.velocity.x = 0;
                    this.velocity.z = 0;
                    this.position.copy(checkPos.sub(offset));
                } else if (offset.y > 0) {
                    // Head collision
                    this.velocity.y = 0;
                    this.position.copy(checkPos.sub(offset));
                }
            }
        }

        // Check if standing on ground
        const belowPos = this.position.clone();
        belowPos.y -= 0.01;
        const bx = Math.floor(belowPos.x);
        const by = Math.floor(belowPos.y);
        const bz = Math.floor(belowPos.z);

        if (this.chunkManager.getBlock(bx, by, bz) > 0) {
            this.isOnGround = true;
            this.velocity.y = 0;
            this.isJumping = false;
        }
    }

    jump() {
        if (this.isOnGround && !this.isJumping) {
            this.velocity.y = this.jumpForce;
            this.isJumping = true;
            this.isOnGround = false;
        }
    }

    destroy() {
        const direction = new THREE.Vector3(0, 0, -1);
        direction.applyQuaternion(this.camera.quaternion);

        const hit = this.chunkManager.raycast(this.camera.position, direction, this.blockReachDistance);
        if (hit && Date.now() - this.lastClickTime > this.clickDelay) {
            this.chunkManager.setBlock(hit.blockPos.x, hit.blockPos.y, hit.blockPos.z, 0);
            this.lastClickTime = Date.now();
        }
    }

    place() {
        const direction = new THREE.Vector3(0, 0, -1);
        direction.applyQuaternion(this.camera.quaternion);

        const hit = this.chunkManager.raycast(this.camera.position, direction, this.blockReachDistance);
        if (hit && Date.now() - this.lastClickTime > this.clickDelay) {
            this.chunkManager.setBlock(hit.placePos.x, hit.placePos.y, hit.placePos.z, this.selectedBlock);
            this.lastClickTime = Date.now();
        }
    }

    getSelectedBlockName() {
        return BlockType.getName(this.selectedBlock);
    }
}
