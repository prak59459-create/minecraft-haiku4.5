import * as THREE from 'three';

export class Player {
    constructor(camera, world, inputManager, cameraController) {
        this.camera = camera;
        this.world = world;
        this.inputManager = inputManager;
        this.cameraController = cameraController;

        this.position = new THREE.Vector3(0, 80, 0);
        this.velocity = new THREE.Vector3(0, 0, 0);
        this.camera.position.copy(this.position);

        this.moveSpeed = 30;
        this.sprintMultiplier = 2;
        this.crouchMultiplier = 0.5;
        this.jumpForce = 15;
        this.gravity = 30;
        this.groundDrag = 0.9;
        this.airResistance = 0.99;

        this.isGrounded = false;
        this.isJumping = false;

        this.setupControls();
    }

    setupControls() {
        document.addEventListener('keydown', (e) => {
            if (e.key === ' ') {
                e.preventDefault();
                this.jump();
            }
        });

        document.addEventListener('mousemove', (e) => {
            const movementX = e.movementX || e.mozMovementX || e.webkitMovementX || 0;
            const movementY = e.movementY || e.mozMovementY || e.webkitMovementY || 0;

            const sensitivity = this.inputManager.getMouseSensitivity();
            this.cameraController.rotateMouse(movementX, movementY, sensitivity);
        });
    }

    update(deltaTime) {
        const moveDir = new THREE.Vector3(0, 0, 0);

        if (this.inputManager.isMovingForward()) moveDir.z -= 1;
        if (this.inputManager.isMovingBackward()) moveDir.z += 1;
        if (this.inputManager.isMovingLeft()) moveDir.x -= 1;
        if (this.inputManager.isMovingRight()) moveDir.x += 1;

        if (moveDir.length() > 0) {
            moveDir.normalize();

            const forward = this.cameraController.getForwardDirection();
            const right = this.cameraController.getRightDirection();

            const isSprinting = this.inputManager.isSprinting();
            const isCrouching = this.inputManager.isCrouching();
            const speedMult = isSprinting ? this.sprintMultiplier : 1;
            const crouchMult = isCrouching ? this.crouchMultiplier : 1;
            const speed = this.moveSpeed * speedMult * crouchMult;

            this.velocity.addScaledVector(forward, moveDir.z * speed * deltaTime);
            this.velocity.addScaledVector(right, moveDir.x * speed * deltaTime);
        }

        this.velocity.y -= this.gravity * deltaTime;
        this.position.addScaledVector(this.velocity, deltaTime);

        const groundLevel = this.getGroundLevel(this.position.x, this.position.z);
        const eyeHeight = 1.7;
        const minY = groundLevel + eyeHeight;

        if (this.position.y < minY) {
            this.position.y = minY;
            this.velocity.y = 0;
            this.isGrounded = true;
            this.isJumping = false;
        } else {
            this.isGrounded = false;
        }

        if (this.isGrounded) {
            this.velocity.x *= this.groundDrag;
            this.velocity.z *= this.groundDrag;
        } else {
            this.velocity.x *= this.airResistance;
            this.velocity.z *= this.airResistance;
        }

        this.cameraController.setPosition(this.position);
    }

    getGroundLevel(x, z) {
        let maxY = 0;
        for (let y = 0; y < 128; y++) {
            if (this.world.getBlock(Math.floor(x), y, Math.floor(z)) !== 0) {
                maxY = y + 1;
            }
        }
        return Math.max(0, maxY);
    }

    jump() {
        if (this.isGrounded) {
            this.velocity.y = this.jumpForce;
            this.isJumping = true;
        }
    }

    destroyBlock() {
        const origin = this.camera.position;
        const direction = new THREE.Vector3(0, 0, -1).applyQuaternion(this.camera.quaternion);

        const maxDistance = 10;
        const step = 0.1;

        for (let dist = 0; dist < maxDistance; dist += step) {
            const point = origin.clone().addScaledVector(direction, dist);
            const bx = Math.floor(point.x);
            const by = Math.floor(point.y);
            const bz = Math.floor(point.z);

            const blockId = this.world.getBlock(bx, by, bz);
            if (blockId !== 0) {
                this.world.setBlock(bx, by, bz, 0);
                break;
            }
        }
    }

    placeBlock(blockId) {
        const origin = this.camera.position;
        const direction = new THREE.Vector3(0, 0, -1).applyQuaternion(this.camera.quaternion);

        const maxDistance = 10;
        const step = 0.1;
        let lastAirBlock = null;

        for (let dist = 0; dist < maxDistance; dist += step) {
            const point = origin.clone().addScaledVector(direction, dist);
            const bx = Math.floor(point.x);
            const by = Math.floor(point.y);
            const bz = Math.floor(point.z);

            const blockIdAtPoint = this.world.getBlock(bx, by, bz);
            if (blockIdAtPoint !== 0 && lastAirBlock) {
                this.world.setBlock(lastAirBlock.x, lastAirBlock.y, lastAirBlock.z, blockId);
                break;
            }

            if (blockIdAtPoint === 0) {
                lastAirBlock = { x: bx, y: by, z: bz };
            }
        }
    }
}
