import { BLOCKS, isBlockSolid } from './blocks.js';

const PLAYER_HEIGHT = 1.8;
const PLAYER_WIDTH = 0.6;
const PLAYER_SPEED = 0.12;
const PLAYER_SPRINT_SPEED = 0.18;
const PLAYER_CROUCH_SPEED = 0.06;
const GRAVITY = 0.018;
const JUMP_POWER = 0.48;
const AIR_RESISTANCE = 0.98;
const ACCELERATION = 1.2;

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
            this.velocity.x *= AIR_RESISTANCE;
            this.velocity.z *= AIR_RESISTANCE;
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
            { dy: 0.1, radius: radius * 0.8 },
            { dy: height * 0.5, radius: radius * 0.8 },
            { dy: height * 0.9, radius: radius * 0.7 }
        ];

        for (const point of checkPoints) {
            const angles = 6;
            for (let i = 0; i < angles; i++) {
                const angle = (i / angles) * Math.PI * 2;
                const cx = this.position.x + Math.cos(angle) * point.radius;
                const cy = this.position.y + point.dy;
                const cz = this.position.z + Math.sin(angle) * point.radius;

                const block = this.world.getBlock(Math.floor(cx), Math.floor(cy), Math.floor(cz));
                if (isBlockSolid(block)) {
                    const moveLen = Math.sqrt(this.velocity.x ** 2 + this.velocity.z ** 2);
                    if (moveLen > 0.001) {
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
            const angles = 4;
            for (let i = 0; i < angles && !onGround; i++) {
                const angle = (i / angles) * Math.PI * 2;
                const cx = this.position.x + Math.cos(angle) * radius * 0.7;
                const cy = this.position.y - 0.1;
                const cz = this.position.z + Math.sin(angle) * radius * 0.7;

                if (isBlockSolid(this.world.getBlock(Math.floor(cx), Math.floor(cy), Math.floor(cz)))) {
                    onGround = true;
                }
            }

            if (onGround) {
                this.isOnGround = true;
                this.velocity.y = 0;
            }
        }

        if (this.velocity.y > 0) {
            const angles = 4;
            for (let i = 0; i < angles; i++) {
                const angle = (i / angles) * Math.PI * 2;
                const cx = this.position.x + Math.cos(angle) * radius * 0.8;
                const cy = this.position.y + height + 0.1;
                const cz = this.position.z + Math.sin(angle) * radius * 0.8;

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
        const eyeHeight = PLAYER_HEIGHT * 0.85;
        return {
            x: Math.round(this.position.x * 100) / 100,
            y: Math.min(256, Math.max(0, this.position.y + eyeHeight)),
            z: Math.round(this.position.z * 100) / 100
        };
    }

    getGridPosition() {
        return {
            x: Math.floor(this.position.x),
            y: Math.floor(this.position.y),
            z: Math.floor(this.position.z)
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
