import { BLOCKS, isBlockSolid } from './blocks.js';

export class Player {
    constructor(world, config = {}) {
        this.world = world;
        this.config = config;

        this.PLAYER_HEIGHT = config.height || 1.8;
        this.PLAYER_WIDTH = config.width || 0.6;
        this.PLAYER_SPEED = config.speed || 0.1;
        this.PLAYER_SPRINT_SPEED = config.sprintSpeed || 0.15;
        this.PLAYER_CROUCH_SPEED = config.crouchSpeed || 0.05;
        this.GRAVITY = config.gravity || 0.02;
        this.JUMP_POWER = config.jumpPower || 0.5;

        this.position = this.findSpawnPosition();
        this.velocity = { x: 0, y: 0, z: 0 };
        this.rotation = { x: 0, y: 0 };

        this.isOnGround = false;
        this.canJump = false;
        this.isSprinting = false;
        this.isCrouching = false;

        this.keys = {};
        this.setupKeyboardControls();
    }

    findSpawnPosition() {
        for (let y = 200; y > 50; y--) {
            const blockAtY = this.world.getBlock(0, y, 0);
            if (isBlockSolid(blockAtY)) {
                return { x: 0.5, y: y + 2, z: 0.5 };
            }
        }
        return { x: 0, y: 100, z: 0 };
    }

    setupKeyboardControls() {
        document.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;

            if (e.key === ' ') {
                e.preventDefault();
                if (this.isOnGround) {
                    this.velocity.y = this.JUMP_POWER;
                    this.isOnGround = false;
                    if (this.onJump) this.onJump();
                }
            }
        });

        document.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
        });
    }

    update() {
        this.handleMovement();
        this.applyPhysics();
        this.checkCollisions();
    }

    handleMovement() {
        let moveX = 0;
        let moveZ = 0;

        const speed = this.keys['shift'] ? (this.isCrouching ? this.PLAYER_CROUCH_SPEED : this.PLAYER_SPRINT_SPEED) : this.PLAYER_SPEED;

        if (this.keys['w']) moveZ -= speed;
        if (this.keys['s']) moveZ += speed;
        if (this.keys['a']) moveX -= speed;
        if (this.keys['d']) moveX += speed;

        const cosY = Math.cos(this.rotation.y);
        const sinY = Math.sin(this.rotation.y);

        this.velocity.x = moveX * cosY - moveZ * sinY;
        this.velocity.z = moveX * sinY + moveZ * cosY;

        this.isSprinting = this.keys['shift'] && !this.isCrouching && (this.keys['w'] || this.keys['s'] || this.keys['a'] || this.keys['d']);
        this.isCrouching = this.keys['shift'] && (this.keys['w'] || this.keys['s'] || this.keys['a'] || this.keys['d']);
    }

    applyPhysics() {
        if (!this.isOnGround) {
            this.velocity.y -= this.GRAVITY;
        }

        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
        this.position.z += this.velocity.z;
    }

    checkCollisions() {
        const radius = this.PLAYER_WIDTH / 2;
        const height = this.PLAYER_HEIGHT;

        this.isOnGround = false;

        const checkPoints = [
            { dy: 0.1, radius: radius * 0.85 },
            { dy: height * 0.3, radius: radius * 0.9 },
            { dy: height * 0.5, radius: radius * 0.9 },
            { dy: height * 0.8, radius: radius * 0.75 }
        ];

        for (const point of checkPoints) {
            let collided = false;
            for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 6) {
                const cx = this.position.x + Math.cos(angle) * point.radius;
                const cy = this.position.y + point.dy;
                const cz = this.position.z + Math.sin(angle) * point.radius;

                const block = this.world.getBlock(Math.floor(cx), Math.floor(cy), Math.floor(cz));
                if (isBlockSolid(block)) {
                    collided = true;
                    break;
                }
            }

            if (collided) {
                const moveLen = Math.sqrt(this.velocity.x ** 2 + this.velocity.z ** 2);
                if (moveLen > 0.01) {
                    const scale = 1.2 / moveLen;
                    this.position.x -= this.velocity.x * scale;
                    this.position.z -= this.velocity.z * scale;
                }
                break;
            }
        }

        if (this.velocity.y < 0) {
            let onGround = false;
            for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 6) {
                const cx = this.position.x + Math.cos(angle) * radius * 0.8;
                const cy = this.position.y - 0.01;
                const cz = this.position.z + Math.sin(angle) * radius * 0.8;

                if (isBlockSolid(this.world.getBlock(Math.floor(cx), Math.floor(cy), Math.floor(cz)))) {
                    onGround = true;
                    break;
                }
            }

            if (onGround) {
                this.isOnGround = true;
                this.velocity.y = 0;
            }
        }

        if (this.velocity.y > 0) {
            for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 6) {
                const cx = this.position.x + Math.cos(angle) * radius * 0.9;
                const cy = this.position.y + height + 0.01;
                const cz = this.position.z + Math.sin(angle) * radius * 0.9;

                if (isBlockSolid(this.world.getBlock(Math.floor(cx), Math.floor(cy), Math.floor(cz)))) {
                    this.velocity.y = 0;
                    break;
                }
            }
        }

        if (this.position.y < -10) {
            this.position.y = 100;
            this.velocity.y = 0;
        }
    }

    getEyePosition() {
        return {
            x: this.position.x,
            y: this.position.y + this.PLAYER_HEIGHT * 0.85,
            z: this.position.z
        };
    }
}

export class Camera {
    constructor(mouseSensitivity = 0.003) {
        this.rotation = { x: 0, y: 0 };
        this.mouseSensitivity = mouseSensitivity;
        this.setupMouseControls();
    }

    setupMouseControls() {
        document.addEventListener('mousemove', (e) => {
            this.rotation.y -= e.movementX * this.mouseSensitivity;
            this.rotation.x -= e.movementY * this.mouseSensitivity;

            this.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.rotation.x));
        });

        document.addEventListener('click', () => {
            if (document.pointerLockElement !== document.body) {
                document.body.requestPointerLock();
            }
        });
    }

    updateFromPlayer(player) {
        player.rotation.x = this.rotation.x;
        player.rotation.y = this.rotation.y;
    }
}
