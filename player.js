import { BLOCKS, isBlockSolid } from './blocks.js';

const PLAYER_HEIGHT = 1.8;
const PLAYER_WIDTH = 0.6;
const PLAYER_SPEED = 0.1;
const PLAYER_SPRINT_SPEED = 0.15;
const PLAYER_CROUCH_SPEED = 0.05;
const GRAVITY = 0.02;
const JUMP_POWER = 0.5;
const AIR_FRICTION = 0.98;
const GROUND_FRICTION = 0.95;
const STEP_HEIGHT = 0.6;

export class Player {
    constructor(world) {
        this.world = world;
        this.position = { x: 0, y: 100, z: 0 };
        this.velocity = { x: 0, y: 0, z: 0 };
        this.rotation = { x: 0, y: 0 };

        this.isOnGround = false;
        this.canJump = false;
        this.isSprinting = false;
        this.isCrouching = false;

        this.keys = {};
        this.setupKeyboardControls();
    }

    setupKeyboardControls() {
        document.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;

            if (e.key === ' ') {
                e.preventDefault();
                if (this.isOnGround) {
                    this.velocity.y = JUMP_POWER;
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

        const speed = this.keys['shift'] ? (this.isCrouching ? PLAYER_CROUCH_SPEED : PLAYER_SPRINT_SPEED) : PLAYER_SPEED;

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
            this.velocity.y -= GRAVITY;
            this.velocity.x *= AIR_FRICTION;
            this.velocity.z *= AIR_FRICTION;
        } else {
            this.velocity.x *= GROUND_FRICTION;
            this.velocity.z *= GROUND_FRICTION;
        }

        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
        this.position.z += this.velocity.z;
    }

    checkCollisions() {
        const radius = PLAYER_WIDTH / 2;
        const height = PLAYER_HEIGHT;

        this.isOnGround = false;

        const horizontalCheckPoints = [
            { dy: 0.1, radius: radius * 0.9 },
            { dy: height * 0.3, radius: radius * 0.9 },
            { dy: height * 0.6, radius: radius * 0.9 },
            { dy: height * 0.9, radius: radius * 0.7 }
        ];

        for (const point of horizontalCheckPoints) {
            for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 8) {
                const cx = this.position.x + Math.cos(angle) * point.radius;
                const cy = this.position.y + point.dy;
                const cz = this.position.z + Math.sin(angle) * point.radius;

                const block = this.world.getBlock(Math.floor(cx), Math.floor(cy), Math.floor(cz));
                if (isBlockSolid(block)) {
                    const moveLen = Math.sqrt(this.velocity.x ** 2 + this.velocity.z ** 2);
                    if (moveLen > 0) {
                        if (this.isOnGround && point.dy < STEP_HEIGHT) {
                            this.position.y += STEP_HEIGHT;
                        } else {
                            const scale = 1.5 / moveLen;
                            this.position.x -= this.velocity.x * scale;
                            this.position.z -= this.velocity.z * scale;
                        }
                    }
                    break;
                }
            }
        }

        if (this.velocity.y < 0) {
            let onGround = false;
            const checkRadius = 8;
            for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / checkRadius) {
                const cx = this.position.x + Math.cos(angle) * radius * 0.7;
                const cz = this.position.z + Math.sin(angle) * radius * 0.7;

                for (let oy = -0.1; oy <= 0.1; oy += 0.05) {
                    const cy = this.position.y + oy;
                    if (isBlockSolid(this.world.getBlock(Math.floor(cx), Math.floor(cy), Math.floor(cz)))) {
                        onGround = true;
                        break;
                    }
                }
                if (onGround) break;
            }

            if (onGround) {
                this.isOnGround = true;
                this.velocity.y = 0;
            }
        }

        if (this.velocity.y > 0) {
            for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 6) {
                const cx = this.position.x + Math.cos(angle) * radius * 0.9;
                const cy = this.position.y + height + 0.1;
                const cz = this.position.z + Math.sin(angle) * radius * 0.9;

                if (isBlockSolid(this.world.getBlock(Math.floor(cx), Math.floor(cy), Math.floor(cz)))) {
                    this.velocity.y = Math.min(0, this.velocity.y);
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
            y: this.position.y + PLAYER_HEIGHT * 0.85,
            z: this.position.z
        };
    }
}

export class Camera {
    constructor() {
        this.rotation = { x: 0, y: 0 };
        this.mouseSensitivity = 0.0025;
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
