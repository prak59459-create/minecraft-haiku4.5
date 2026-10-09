import { BLOCKS, isBlockSolid } from './blocks.js';

const PLAYER_HEIGHT = 1.8;
const PLAYER_WIDTH = 0.6;
const PLAYER_SPEED = 0.1;
const PLAYER_SPRINT_SPEED = 0.15;
const PLAYER_CROUCH_SPEED = 0.05;
const PLAYER_SWIM_SPEED = 0.08;
const GRAVITY = 0.02;
const GRAVITY_IN_WATER = 0.008;
const JUMP_POWER = 0.5;
const SWIM_POWER = 0.15;

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
        this.isSwimming = false;
        this.isInWater = false;

        this.keys = {};
        this.lastJumpTime = 0;
        this.jumpCooldown = 100;

        this.setupKeyboardControls();
    }

    setupKeyboardControls() {
        document.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;

            if (e.key === ' ') {
                e.preventDefault();
                const now = Date.now();
                if (this.isOnGround && now - this.lastJumpTime > this.jumpCooldown) {
                    this.velocity.y = JUMP_POWER;
                    this.isOnGround = false;
                    this.lastJumpTime = now;
                    if (this.onJump) this.onJump();
                } else if (this.isInWater) {
                    this.velocity.y = Math.min(this.velocity.y + SWIM_POWER, 0.3);
                }
            }
        });

        document.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
        });
    }

    checkWaterCollision() {
        const px = this.position.x;
        const py = this.position.y + PLAYER_HEIGHT * 0.6;
        const pz = this.position.z;
        const block = this.world.getBlock(Math.floor(px), Math.floor(py), Math.floor(pz));
        return block === BLOCKS.WATER;
    }

    update() {
        this.isInWater = this.checkWaterCollision();
        this.handleMovement();
        this.applyPhysics();
        this.checkCollisions();
    }

    getMovementSpeed() {
        const moveX = this.velocity.x;
        const moveZ = this.velocity.z;
        return Math.sqrt(moveX * moveX + moveZ * moveZ);
    }

    isMoving() {
        return this.getMovementSpeed() > 0.01;
    }

    handleMovement() {
        let moveX = 0;
        let moveZ = 0;

        let speed;
        if (this.isInWater) {
            speed = PLAYER_SWIM_SPEED;
        } else {
            speed = this.keys['shift'] ? (this.isCrouching ? PLAYER_CROUCH_SPEED : PLAYER_SPRINT_SPEED) : PLAYER_SPEED;
        }

        if (this.keys['w']) moveZ -= speed;
        if (this.keys['s']) moveZ += speed;
        if (this.keys['a']) moveX -= speed;
        if (this.keys['d']) moveX += speed;

        const cosY = Math.cos(this.rotation.y);
        const sinY = Math.sin(this.rotation.y);

        this.velocity.x = moveX * cosY - moveZ * sinY;
        this.velocity.z = moveX * sinY + moveZ * cosY;

        this.isSprinting = this.keys['shift'] && !this.isCrouching && (this.keys['w'] || this.keys['s'] || this.keys['a'] || this.keys['d']) && !this.isInWater;
        this.isCrouching = this.keys['shift'] && (this.keys['w'] || this.keys['s'] || this.keys['a'] || this.keys['d']) && !this.isInWater;
    }

    applyPhysics() {
        if (!this.isOnGround && !this.isInWater) {
            this.velocity.y -= GRAVITY;
        } else if (this.isInWater) {
            this.velocity.y *= 0.95;
            this.velocity.y -= GRAVITY_IN_WATER;
        }

        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
        this.position.z += this.velocity.z;
    }

    checkCollisions() {
        const radius = PLAYER_WIDTH / 2;
        const height = PLAYER_HEIGHT;

        this.isOnGround = false;

        const checkPoints = [
            { dy: 0.1, radius: radius * 0.9 },
            { dy: height * 0.3, radius: radius * 0.9 },
            { dy: height * 0.6, radius: radius * 0.9 },
            { dy: height * 0.9, radius: radius * 0.7 }
        ];

        for (const point of checkPoints) {
            for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 8) {
                const cx = this.position.x + Math.cos(angle) * point.radius;
                const cy = this.position.y + point.dy;
                const cz = this.position.z + Math.sin(angle) * point.radius;

                const block = this.world.getBlock(Math.floor(cx), Math.floor(cy), Math.floor(cz));
                if (isBlockSolid(block) && block !== BLOCKS.WATER) {
                    const moveLen = Math.sqrt(this.velocity.x ** 2 + this.velocity.z ** 2);
                    if (moveLen > 0) {
                        const scale = 1.5 / moveLen;
                        this.position.x -= this.velocity.x * scale;
                        this.position.z -= this.velocity.z * scale;
                    }
                    break;
                }
            }
        }

        if (this.velocity.y < 0) {
            let onGround = false;
            for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 6) {
                const cx = this.position.x + Math.cos(angle) * radius * 0.8;
                const cy = this.position.y - 0.01;
                const cz = this.position.z + Math.sin(angle) * radius * 0.8;

                const block = this.world.getBlock(Math.floor(cx), Math.floor(cy), Math.floor(cz));
                if (isBlockSolid(block) && block !== BLOCKS.WATER) {
                    onGround = true;
                    break;
                }
            }

            if (onGround) {
                this.isOnGround = true;
                this.velocity.y = 0;
            }
        }

        if (this.velocity.y > 0 && !this.isInWater) {
            for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 6) {
                const cx = this.position.x + Math.cos(angle) * radius * 0.9;
                const cy = this.position.y + height + 0.01;
                const cz = this.position.z + Math.sin(angle) * radius * 0.9;

                const block = this.world.getBlock(Math.floor(cx), Math.floor(cy), Math.floor(cz));
                if (isBlockSolid(block)) {
                    this.velocity.y = 0;
                    break;
                }
            }
        }

        if (this.position.y < -10) {
            this.position.y = 100;
            this.velocity = { x: 0, y: 0, z: 0 };
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
        this.mouseSensitivity = 0.003;
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
