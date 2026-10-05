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
        }

        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
        this.position.z += this.velocity.z;
    }

    checkCollisions() {
        const radius = PLAYER_WIDTH / 2;
        const height = PLAYER_HEIGHT;

        this.isOnGround = false;

        const cos45 = 0.707;
        const checkDirs = [
            { x: 1, z: 0 }, { x: cos45, z: cos45 }, { x: 0, z: 1 }, { x: -cos45, z: cos45 },
            { x: -1, z: 0 }, { x: -cos45, z: -cos45 }, { x: 0, z: -1 }, { x: cos45, z: -cos45 }
        ];

        if (this.velocity.x !== 0 || this.velocity.z !== 0) {
            for (let h = 0.1; h < height; h += height * 0.4) {
                for (const dir of checkDirs) {
                    const cx = this.position.x + dir.x * radius * 0.9;
                    const cy = this.position.y + h;
                    const cz = this.position.z + dir.z * radius * 0.9;

                    if (isBlockSolid(this.world.getBlock(Math.floor(cx), Math.floor(cy), Math.floor(cz)))) {
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
        }

        if (this.velocity.y < 0) {
            const checkDirs2 = [{ x: 1, z: 0 }, { x: 0, z: 1 }, { x: -1, z: 0 }, { x: 0, z: -1 }];
            for (const dir of checkDirs2) {
                const cx = this.position.x + dir.x * radius * 0.8;
                const cy = this.position.y - 0.01;
                const cz = this.position.z + dir.z * radius * 0.8;

                if (isBlockSolid(this.world.getBlock(Math.floor(cx), Math.floor(cy), Math.floor(cz)))) {
                    this.isOnGround = true;
                    this.velocity.y = 0;
                    break;
                }
            }
        }

        if (this.velocity.y > 0) {
            const checkDirs2 = [{ x: 1, z: 0 }, { x: 0, z: 1 }, { x: -1, z: 0 }, { x: 0, z: -1 }];
            for (const dir of checkDirs2) {
                const cx = this.position.x + dir.x * radius * 0.9;
                const cy = this.position.y + height + 0.01;
                const cz = this.position.z + dir.z * radius * 0.9;

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
