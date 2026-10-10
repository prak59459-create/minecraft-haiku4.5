import { BLOCKS, isBlockSolid } from './blocks.js';

const PLAYER_HEIGHT = 1.8;
const PLAYER_WIDTH = 0.6;
const PLAYER_SPEED = 0.11;
const PLAYER_SPRINT_SPEED = 0.16;
const PLAYER_CROUCH_SPEED = 0.05;
const GRAVITY = 0.022;
const JUMP_POWER = 0.54;

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
        let shiftPressed = false;

        document.addEventListener('keydown', (e) => {
            const key = e.key.toLowerCase();
            this.keys[key] = true;

            if (e.key === ' ') {
                e.preventDefault();
                if (this.isOnGround) {
                    this.velocity.y = JUMP_POWER;
                    this.isOnGround = false;
                    if (this.onJump) this.onJump();
                }
            }

            if (key === 'shift' && !shiftPressed) {
                shiftPressed = true;
                this.isCrouching = !this.isCrouching;
            }
        });

        document.addEventListener('keyup', (e) => {
            const key = e.key.toLowerCase();
            this.keys[key] = false;
            if (key === 'shift') {
                shiftPressed = false;
            }
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
        const speed = this.isCrouching ? PLAYER_CROUCH_SPEED : PLAYER_SPEED;

        if (this.keys['w']) moveZ -= speed;
        if (this.keys['s']) moveZ += speed;
        if (this.keys['a']) moveX -= speed;
        if (this.keys['d']) moveX += speed;

        const cosY = Math.cos(this.rotation.y);
        const sinY = Math.sin(this.rotation.y);

        this.velocity.x = moveX * cosY - moveZ * sinY;
        this.velocity.z = moveX * sinY + moveZ * cosY;

        this.isSprinting = !this.isCrouching && isMoving && this.isOnGround;
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
        const checkAngles = [0, Math.PI / 4, Math.PI / 2, 3 * Math.PI / 4, Math.PI, 5 * Math.PI / 4, 3 * Math.PI / 2, 7 * Math.PI / 4];

        this.isOnGround = false;

        const checkPoints = [
            { dy: 0.1, radius: radius * 0.95 },
            { dy: height * 0.5, radius: radius * 0.9 },
            { dy: height * 0.95, radius: radius * 0.85 }
        ];

        for (const point of checkPoints) {
            for (const angle of checkAngles) {
                const cx = this.position.x + Math.cos(angle) * point.radius;
                const cy = this.position.y + point.dy;
                const cz = this.position.z + Math.sin(angle) * point.radius;

                const block = this.world.getBlock(Math.floor(cx), Math.floor(cy), Math.floor(cz));
                if (isBlockSolid(block)) {
                    const moveLen = Math.sqrt(this.velocity.x ** 2 + this.velocity.z ** 2);
                    if (moveLen > 0.01) {
                        const scale = 1.2 / moveLen;
                        this.position.x -= this.velocity.x * scale;
                        this.position.z -= this.velocity.z * scale;
                    }
                    break;
                }
            }
        }

        if (this.velocity.y < 0) {
            let onGround = false;
            for (const angle of checkAngles) {
                const cx = this.position.x + Math.cos(angle) * radius * 0.85;
                const cy = this.position.y - 0.05;
                const cz = this.position.z + Math.sin(angle) * radius * 0.85;

                if (isBlockSolid(this.world.getBlock(Math.floor(cx), Math.floor(cy), Math.floor(cz)))) {
                    onGround = true;
                    break;
                }
            }

            if (onGround) {
                this.isOnGround = true;
                this.velocity.y = 0;
                this.position.y = Math.floor(this.position.y) + 0.1;
            }
        }

        if (this.velocity.y > 0) {
            for (const angle of checkAngles) {
                const cx = this.position.x + Math.cos(angle) * radius * 0.9;
                const cy = this.position.y + height + 0.05;
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
        this.setupMouseControls();
    }

    setupMouseControls() {
        document.addEventListener('mousemove', (e) => {
            if (document.pointerLockElement !== document.body) return;

            this.targetRotation.y -= e.movementX * this.mouseSensitivity;
            this.targetRotation.x -= e.movementY * this.mouseSensitivity;

            this.targetRotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.targetRotation.x));

            this.rotation.x = this.targetRotation.x;
            this.rotation.y = this.targetRotation.y;
        });

        document.addEventListener('click', () => {
            if (document.pointerLockElement !== document.body) {
                document.body.requestPointerLock();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && document.pointerLockElement === document.body) {
                document.exitPointerLock();
            }
        });
    }

    updateFromPlayer(player) {
        player.rotation.x = this.rotation.x;
        player.rotation.y = this.rotation.y;
    }
}
