import * as THREE from 'three';
import { BLOCK_NAMES } from './blocks.js';

export class Player {
    constructor(camera) {
        this.camera = camera;
        this.position = new THREE.Vector3(50, 100, 50);
        this.velocity = new THREE.Vector3();
        this.direction = new THREE.Vector3();

        // Player settings
        this.speed = 20;
        this.sprintSpeed = 35;
        this.jumpForce = 15;
        this.gravity = 30;
        this.eyeHeight = 1.6;
        this.width = 0.6;
        this.height = 1.8;

        // Input
        this.keys = {};
        this.leftClickPressed = false;
        this.rightClickPressed = false;
        this.isSprinting = false;
        this.isJumping = false;
        this.isOnGround = false;

        // Block selection
        this.selectedBlockIndex = 0;
        this.selectedBlockType = 'grass';

        // Mouse look
        this.yaw = 0;
        this.pitch = 0;
        this.sensitivity = 0.003;

        this.setupEventListeners();
    }

    setupEventListeners() {
        // Keyboard
        window.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;

            // Block selection
            const num = parseInt(e.key);
            if (num >= 1 && num <= 9) {
                this.selectedBlockIndex = num - 1;
                this.selectedBlockType = BLOCK_NAMES[this.selectedBlockIndex % BLOCK_NAMES.length];
                document.getElementById('blockName').textContent = this.selectedBlockType;
            }
        });

        window.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
        });

        // Mouse look
        document.addEventListener('mousemove', (e) => {
            this.yaw -= e.movementX * this.sensitivity;
            this.pitch -= e.movementY * this.sensitivity;

            // Clamp pitch
            this.pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.pitch));
        });

        // Mouse clicks
        document.addEventListener('mousedown', (e) => {
            if (e.button === 0) this.leftClickPressed = true;
            if (e.button === 2) this.rightClickPressed = true;
        });

        document.addEventListener('mouseup', (e) => {
            if (e.button === 0) this.leftClickPressed = false;
            if (e.button === 2) this.rightClickPressed = false;
        });

        document.addEventListener('contextmenu', (e) => e.preventDefault());

        // Scroll wheel for block selection
        document.addEventListener('wheel', (e) => {
            e.preventDefault();
            this.selectedBlockIndex += e.deltaY > 0 ? 1 : -1;
            this.selectedBlockIndex = (this.selectedBlockIndex + BLOCK_NAMES.length) % BLOCK_NAMES.length;
            this.selectedBlockType = BLOCK_NAMES[this.selectedBlockIndex];
            document.getElementById('blockName').textContent = this.selectedBlockType;
        });

        // Pointer lock
        document.addEventListener('click', () => {
            document.body.requestPointerLock = document.body.requestPointerLock || document.body.mozRequestPointerLock;
            document.body.requestPointerLock();
        });
    }

    update(delta, world) {
        // Update camera rotation
        this.camera.rotation.order = 'YXZ';
        this.camera.rotation.y = this.yaw;
        this.camera.rotation.x = this.pitch;

        // Movement input
        this.direction.set(0, 0, 0);

        if (this.keys['w'] || this.keys['arrowup']) {
            this.direction.z -= 1;
        }
        if (this.keys['s'] || this.keys['arrowdown']) {
            this.direction.z += 1;
        }
        if (this.keys['a'] || this.keys['arrowleft']) {
            this.direction.x -= 1;
        }
        if (this.keys['d'] || this.keys['arrowright']) {
            this.direction.x += 1;
        }

        // Sprint/Crouch
        this.isSprinting = this.keys['shift'];
        const currentSpeed = this.isSprinting ? this.sprintSpeed : this.speed;

        if (this.direction.length() > 0) {
            this.direction.normalize();
            this.direction.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.yaw);
            this.direction.multiplyScalar(currentSpeed);
        }

        // Apply horizontal velocity
        this.velocity.x = this.direction.x;
        this.velocity.z = this.direction.z;

        // Gravity
        this.velocity.y -= this.gravity * delta;

        // Jump
        if ((this.keys[' '] || this.keys['spacebar']) && this.isOnGround) {
            this.velocity.y = this.jumpForce;
            this.isOnGround = false;
        }

        // Check collision and apply velocity
        const newPos = this.position.clone().add(this.velocity.clone().multiplyScalar(delta));

        this.isOnGround = false;

        // Simple collision detection
        if (!this.checkCollision(newPos, world)) {
            this.position.copy(newPos);
        } else {
            // Collision handling
            const horizPos = this.position.clone();
            horizPos.x += this.direction.x * delta;
            if (this.checkCollision(horizPos, world)) {
                this.position.z += this.direction.z * delta;
            } else {
                this.position.x = horizPos.x;
            }

            // Vertical collision
            const vertPos = this.position.clone();
            vertPos.y += this.velocity.y * delta;
            if (!this.checkCollision(vertPos, world)) {
                this.position.y = vertPos.y;
            } else {
                this.velocity.y = 0;
                this.isOnGround = true;
            }
        }

        // Keep player in bounds
        if (this.position.y < 0) {
            this.position.y = 100;
            this.velocity.y = 0;
        }
    }

    checkCollision(position, world) {
        const tolerance = 0.3;

        // Check surrounding blocks
        const minX = Math.floor(position.x - this.width / 2);
        const maxX = Math.floor(position.x + this.width / 2) + 1;
        const minY = Math.floor(position.y);
        const maxY = Math.floor(position.y + this.height) + 1;
        const minZ = Math.floor(position.z - this.width / 2);
        const maxZ = Math.floor(position.z + this.width / 2) + 1;

        for (let x = minX; x <= maxX; x++) {
            for (let y = minY; y <= maxY; y++) {
                for (let z = minZ; z <= maxZ; z++) {
                    const chunkX = Math.floor(x / 16);
                    const chunkZ = Math.floor(z / 16);
                    const chunk = world.chunks.get(`${chunkX},${chunkZ}`);

                    if (chunk) {
                        const block = chunk.getBlock(x - chunkX * 16, y, z - chunkZ * 16);
                        if (block && block !== 'water') {
                            return true;
                        }
                    }
                }
            }
        }

        return false;
    }
}
