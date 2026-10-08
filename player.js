import { BLOCKS, isBlockSolid } from './blocks.js';

const PLAYER_HEIGHT = 1.8;
const PLAYER_WIDTH = 0.6;
const PLAYER_SPEED = 0.1;
const PLAYER_SPRINT_SPEED = 0.15;
const PLAYER_CROUCH_SPEED = 0.05;
const GRAVITY = 0.02;
const JUMP_POWER = 0.5;

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

        const isMoving = this.keys['w'] || this.keys['s'] || this.keys['a'] || this.keys['d'];
        const shiftPressed = this.keys['shift'];

        if (this.keys['w']) moveZ -= 1;
        if (this.keys['s']) moveZ += 1;
        if (this.keys['a']) moveX -= 1;
        if (this.keys['d']) moveX += 1;

        const speed = shiftPressed ? (this.isCrouching ? PLAYER_CROUCH_SPEED : PLAYER_SPRINT_SPEED) : PLAYER_SPEED;

        const cosY = Math.cos(this.rotation.y);
        const sinY = Math.sin(this.rotation.y);

        if (moveX !== 0 || moveZ !== 0) {
            const len = Math.sqrt(moveX * moveX + moveZ * moveZ);
            moveX /= len;
            moveZ /= len;
        }

        this.velocity.x = moveX * cosY * speed - moveZ * sinY * speed;
        this.velocity.z = moveX * sinY * speed + moveZ * cosY * speed;

        this.isCrouching = shiftPressed && isMoving;
        this.isSprinting = shiftPressed && !this.isCrouching && isMoving;
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
        this.targetRotation = { x: 0, y: 0 };
        this.mouseSensitivity = 0.003;
        this.smoothing = 0.95;
        this.setupMouseControls();
    }

    setupMouseControls() {
        document.addEventListener('mousemove', (e) => {
            if (document.pointerLockElement !== document.body) return;

            this.targetRotation.y -= e.movementX * this.mouseSensitivity;
            this.targetRotation.x -= e.movementY * this.mouseSensitivity;

            this.targetRotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.targetRotation.x));
        });

        document.addEventListener('click', () => {
            if (document.pointerLockElement !== document.body) {
                document.body.requestPointerLock();
            }
        });
    }

    updateFromPlayer(player) {
        this.rotation.x += (this.targetRotation.x - this.rotation.x) * (1 - this.smoothing);
        this.rotation.y += (this.targetRotation.y - this.rotation.y) * (1 - this.smoothing);

        player.rotation.x = this.rotation.x;
        player.rotation.y = this.rotation.y;
    }
}
