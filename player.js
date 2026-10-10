import { BLOCKS, isBlockSolid } from './blocks.js';

const PLAYER_HEIGHT = 1.8;
const PLAYER_WIDTH = 0.6;
const PLAYER_SPEED = 0.1;
const PLAYER_SPRINT_SPEED = 0.15;
const PLAYER_CROUCH_SPEED = 0.05;
const GRAVITY = 0.02;
const JUMP_POWER = 0.5;
const WATER_SLOWDOWN = 0.4;

export class Player {
    constructor(world) {
        this.world = world;
        this.position = { x: 0, y: 100, z: 0 };
        this.velocity = { x: 0, y: 0, z: 0 };
        this.rotation = { x: 0, y: 0 };
        this.lastPos = { x: 0, y: 0, z: 0 };

        this.isOnGround = false;
        this.canJump = false;
        this.isSprinting = false;
        this.isCrouching = false;
        this.lastStepTime = 0;

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
        this.lastPos.x = this.position.x;
        this.lastPos.y = this.position.y;
        this.lastPos.z = this.position.z;

        this.handleMovement();
        this.applyPhysics();
        this.checkCollisions();
        this.checkWater();
        this.emitStepSounds();
    }

    emitStepSounds() {
        if (!this.isOnGround) return;

        const dist = Math.sqrt(
            (this.position.x - this.lastPos.x) ** 2 +
            (this.position.z - this.lastPos.z) ** 2
        );

        const stepInterval = this.isSprinting ? 200 : 300;
        const now = performance.now();

        if (dist > 0.05 && now - this.lastStepTime > stepInterval) {
            if (this.onStep) this.onStep();
            this.lastStepTime = now;
        }
    }

    checkWater() {
        const eyePos = this.getEyePosition();
        const block = this.world.getBlock(Math.floor(eyePos.x), Math.floor(eyePos.y), Math.floor(eyePos.z));

        if (block === BLOCKS.WATER) {
            this.velocity.x *= WATER_SLOWDOWN;
            this.velocity.z *= WATER_SLOWDOWN;
            if (this.velocity.y < 0) {
                this.velocity.y *= 0.8;
            }
        }
    }

    handleMovement() {
        let moveX = 0;
        let moveZ = 0;

        const isMoving = this.keys['w'] || this.keys['s'] || this.keys['a'] || this.keys['d'];

        let speed = PLAYER_SPEED;
        if (this.isSprinting) {
            speed = PLAYER_SPRINT_SPEED;
        } else if (this.isCrouching) {
            speed = PLAYER_CROUCH_SPEED;
        }

        if (this.keys['w']) moveZ -= speed;
        if (this.keys['s']) moveZ += speed;
        if (this.keys['a']) moveX -= speed;
        if (this.keys['d']) moveX += speed;

        const cosY = Math.cos(this.rotation.y);
        const sinY = Math.sin(this.rotation.y);

        this.velocity.x = moveX * cosY - moveZ * sinY;
        this.velocity.z = moveX * sinY + moveZ * cosY;

        if (this.isCrouching && this.keys['shift'] && !isMoving) {
            this.isCrouching = false;
        } else if (!this.isCrouching && this.keys['shift'] && isMoving) {
            this.isSprinting = true;
        }
    }

    applyPhysics() {
        if (!this.isOnGround) {
            this.velocity.y -= GRAVITY;
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
                if (isBlockSolid(block)) {
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
        let lastTouchX = 0;
        let lastTouchY = 0;

        document.addEventListener('mousemove', (e) => {
            if (document.pointerLockElement === document.body) {
                this.rotation.y -= e.movementX * this.mouseSensitivity;
                this.rotation.x -= e.movementY * this.mouseSensitivity;
                this.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.rotation.x));
            }
        });

        document.addEventListener('touchmove', (e) => {
            if (e.touches.length === 1) {
                const touch = e.touches[0];
                const deltaX = touch.clientX - lastTouchX;
                const deltaY = touch.clientY - lastTouchY;

                this.rotation.y -= deltaX * this.mouseSensitivity * 0.5;
                this.rotation.x -= deltaY * this.mouseSensitivity * 0.5;
                this.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.rotation.x));

                lastTouchX = touch.clientX;
                lastTouchY = touch.clientY;
            }
        }, { passive: false });

        document.addEventListener('touchstart', (e) => {
            if (e.touches.length === 1) {
                const touch = e.touches[0];
                lastTouchX = touch.clientX;
                lastTouchY = touch.clientY;
            }
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
