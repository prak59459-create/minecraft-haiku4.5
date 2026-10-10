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
                const waterBlock = this.world.getBlock(Math.floor(this.position.x), Math.floor(this.position.y), Math.floor(this.position.z));
                if (waterBlock === 8) {
                    this.velocity.y = JUMP_POWER * 0.6;
                    if (this.onJump) this.onJump();
                } else if (this.isOnGround) {
                    this.velocity.y = JUMP_POWER;
                    this.isOnGround = false;
                    if (this.onJump) this.onJump();
                }
            }

            if (e.key === 'Control' || e.key === 'c' || e.key === 'C') {
                this.isCrouching = !this.isCrouching;
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

        if (this.keys['w']) moveZ -= 1;
        if (this.keys['s']) moveZ += 1;
        if (this.keys['a']) moveX -= 1;
        if (this.keys['d']) moveX += 1;

        let speed = PLAYER_SPEED;
        if (this.isCrouching) {
            speed = PLAYER_CROUCH_SPEED;
        } else if (this.keys['shift'] && isMoving) {
            speed = PLAYER_SPRINT_SPEED;
        }

        const cosY = Math.cos(this.rotation.y);
        const sinY = Math.sin(this.rotation.y);

        this.velocity.x = (moveX * cosY - moveZ * sinY) * speed;
        this.velocity.z = (moveX * sinY + moveZ * cosY) * speed;

        this.isSprinting = this.keys['shift'] && !this.isCrouching && isMoving;
    }

    applyPhysics() {
        const waterLevel = 62;
        const cy = Math.floor(this.position.y);
        const waterBlock = this.world.getBlock(Math.floor(this.position.x), cy, Math.floor(this.position.z));
        const inWater = waterBlock === 8;

        if (!this.isOnGround) {
            if (inWater) {
                this.velocity.y -= GRAVITY * 0.2;
                this.velocity.y = Math.max(this.velocity.y, -0.1);
            } else {
                this.velocity.y -= GRAVITY;
            }
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
            { dy: height * 0.5, radius: radius * 0.8 }
        ];

        const horizontalPoints = [
            { angle: 0, dy: height * 0.3 },
            { angle: Math.PI / 2, dy: height * 0.3 },
            { angle: Math.PI, dy: height * 0.3 },
            { angle: 3 * Math.PI / 2, dy: height * 0.3 }
        ];

        for (const pt of checkPoints) {
            for (const hp of horizontalPoints) {
                const cx = this.position.x + Math.cos(hp.angle) * pt.radius;
                const cy = this.position.y + pt.dy;
                const cz = this.position.z + Math.sin(hp.angle) * pt.radius;

                const block = this.world.getBlock(Math.floor(cx), Math.floor(cy), Math.floor(cz));
                if (isBlockSolid(block)) {
                    const moveLen = Math.sqrt(this.velocity.x ** 2 + this.velocity.z ** 2);
                    if (moveLen > 0.01) {
                        const scale = 1.5 / moveLen;
                        this.position.x -= this.velocity.x * scale;
                        this.position.z -= this.velocity.z * scale;
                    }
                    break;
                }
            }
        }

        if (this.velocity.y < 0) {
            const footPoints = [[0, radius * 0.8], [Math.PI / 2, radius * 0.8], [Math.PI, radius * 0.8], [3 * Math.PI / 2, radius * 0.8]];
            for (const [angle, r] of footPoints) {
                const cx = this.position.x + Math.cos(angle) * r;
                const cy = this.position.y - 0.01;
                const cz = this.position.z + Math.sin(angle) * r;

                if (isBlockSolid(this.world.getBlock(Math.floor(cx), Math.floor(cy), Math.floor(cz)))) {
                    this.isOnGround = true;
                    this.velocity.y = 0;
                    break;
                }
            }
        }

        if (this.velocity.y > 0) {
            const headPoints = [[0, radius * 0.8], [Math.PI / 2, radius * 0.8], [Math.PI, radius * 0.8], [3 * Math.PI / 2, radius * 0.8]];
            for (const [angle, r] of headPoints) {
                const cx = this.position.x + Math.cos(angle) * r;
                const cy = this.position.y + height + 0.01;
                const cz = this.position.z + Math.sin(angle) * r;

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
