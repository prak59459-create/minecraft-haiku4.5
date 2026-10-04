import * as THREE from 'three';
import { World } from './world.js';
import { ParticleSystem } from './particles.js';
import { AudioManager } from './audio.js';
import { Inventory } from './inventory.js';
import { BlockType, isSolid } from './blocks.js';

const PLAYER_HEIGHT = 1.7;
const PLAYER_WIDTH = 0.6;
const WALK_SPEED = 4.3;
const SPRINT_SPEED = 5.612;
const CROUCH_SPEED = 1.3;
const JUMP_FORCE = 12;
const GRAVITY = 24;
const MOUSE_SENSITIVITY = 0.003;

interface KeyState {
    [key: string]: boolean;
}

export class Player {
    camera: THREE.PerspectiveCamera;
    position: THREE.Vector3;
    velocity: THREE.Vector3 = new THREE.Vector3();
    keys: KeyState = {};
    world: World;
    particles: ParticleSystem;
    audio: AudioManager;
    inventory: Inventory;

    pitch: number = 0;
    yaw: number = 0;

    isGrounded: boolean = false;
    isSprinting: boolean = false;
    isCrouching: boolean = false;
    jumpCooldown: number = 0;
    lastStepTime: number = 0;

    constructor(camera: THREE.PerspectiveCamera, world: World, startPos: THREE.Vector3, particles: ParticleSystem, audio: AudioManager) {
        this.camera = camera;
        this.world = world;
        this.position = startPos.clone();
        this.particles = particles;
        this.audio = audio;
        this.inventory = new Inventory();
        this.camera.position.copy(this.position);
    }

    setupControls(): void {
        document.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;
            if (e.key === ' ') e.preventDefault();
        });
        document.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
        });
        document.addEventListener('mousemove', (e) => this.onMouseMove(e));
        document.addEventListener('mousedown', (e) => this.onMouseDown(e));
        document.addEventListener('mouseup', (e) => this.onMouseUp(e));
        document.addEventListener('wheel', (e) => this.onScroll(e));
    }

    private onMouseMove(e: MouseEvent): void {
        this.yaw -= e.movementX * MOUSE_SENSITIVITY;
        this.pitch -= e.movementY * MOUSE_SENSITIVITY;
        this.pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.pitch));

        this.camera.rotation.order = 'YXZ';
        this.camera.rotation.y = this.yaw;
        this.camera.rotation.x = this.pitch;
    }

    private onMouseDown(e: MouseEvent): void {
        if (e.button === 0) this.destroyBlock();
        if (e.button === 2) this.placeBlock();
    }

    private onMouseUp(e: MouseEvent): void {
    }

    private onScroll(e: WheelEvent): void {
        e.preventDefault();
        this.inventory.selectSlot((this.inventory.selectedSlot + (e.deltaY > 0 ? 1 : -1) + 9) % 9);
        this.updateInventoryDisplay();
    }

    private updateInventoryDisplay(): void {
        const selector = (window as any).blockSelector;
        if (selector) {
            selector.selectBlock(this.inventory.selectedSlot);
        }
    }

    private destroyBlock(): void {
        const hit = this.raycast();
        if (hit) {
            const blockType = this.world.getBlock(hit.x, hit.y, hit.z);
            if (blockType !== BlockType.AIR) {
                this.world.setBlock(hit.x, hit.y, hit.z, BlockType.AIR);
                this.particles.addDestructionParticles(hit.x, hit.y, hit.z, blockType);
                this.inventory.addBlock(blockType, 1);
                this.audio.playBlockBreak();
                this.updateNearbyChunks(hit.x, hit.y, hit.z);
            }
        }
    }

    private placeBlock(): void {
        const hit = this.raycast();
        if (hit) {
            const adj = this.getAdjacentBlock(hit);
            if (adj && !this.wouldCollide(adj.x, adj.y, adj.z)) {
                const blockType = this.inventory.getSelected().type;
                if (blockType !== BlockType.AIR && this.inventory.canUseSelected()) {
                    this.world.setBlock(adj.x, adj.y, adj.z, blockType);
                    this.inventory.useSelected();
                    this.audio.playBlockPlace();
                    this.updateNearbyChunks(adj.x, adj.y, adj.z);
                }
            }
        }
    }

    private raycast(): { x: number, y: number, z: number } | null {
        const direction = new THREE.Vector3(0, 0, -1);
        direction.applyAxisAngle(new THREE.Vector3(1, 0, 0), this.pitch);
        direction.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.yaw);

        let pos = this.position.clone();
        pos.y -= PLAYER_HEIGHT / 2;

        for (let i = 0; i < 100; i++) {
            pos.addScaledVector(direction, 0.1);
            const block = this.world.getBlock(Math.floor(pos.x), Math.floor(pos.y), Math.floor(pos.z));
            if (block !== BlockType.AIR && block !== BlockType.WATER) {
                return {
                    x: Math.floor(pos.x),
                    y: Math.floor(pos.y),
                    z: Math.floor(pos.z)
                };
            }
        }
        return null;
    }

    private getAdjacentBlock(hit: { x: number, y: number, z: number }): { x: number, y: number, z: number } | null {
        const direction = new THREE.Vector3(0, 0, -1);
        direction.applyAxisAngle(new THREE.Vector3(1, 0, 0), this.pitch);
        direction.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.yaw);

        let pos = this.position.clone();
        pos.y -= PLAYER_HEIGHT / 2;

        for (let i = 0; i < 100; i++) {
            pos.addScaledVector(direction, 0.1);
            if (pos.x < hit.x - 0.5 || pos.x > hit.x + 1.5 ||
                pos.y < hit.y - 0.5 || pos.y > hit.y + 1.5 ||
                pos.z < hit.z - 0.5 || pos.z > hit.z + 1.5) {
                return {
                    x: Math.floor(pos.x),
                    y: Math.floor(pos.y),
                    z: Math.floor(pos.z)
                };
            }
        }
        return null;
    }

    private updateNearbyChunks(x: number, y: number, z: number): void {
        for (let dx = -1; dx <= 1; dx++) {
            for (let dz = -1; dz <= 1; dz++) {
                const cx = Math.floor((x + dx * 16) / 16);
                const cz = Math.floor((z + dz * 16) / 16);
                const chunk = this.world.getChunk(cx, cz);
                if (chunk.mesh) {
                    this.updateChunkMesh(chunk);
                }
            }
        }
    }

    private updateChunkMesh(chunk: any): void {
        if (chunk.mesh) {
            (this.world as any).scene.remove(chunk.mesh);
            chunk.mesh.geometry.dispose();
            (chunk.mesh.material as THREE.Material).dispose();
        }
        chunk.mesh = this.world.buildMesh(chunk);
        chunk.mesh.position.set(chunk.x * 16, 0, chunk.z * 16);
        (this.world as any).scene.add(chunk.mesh);
    }

    private wouldCollide(x: number, y: number, z: number): boolean {
        const minX = this.position.x - PLAYER_WIDTH / 2;
        const maxX = this.position.x + PLAYER_WIDTH / 2;
        const minY = this.position.y - PLAYER_HEIGHT / 2;
        const maxY = this.position.y + PLAYER_HEIGHT / 2;
        const minZ = this.position.z - PLAYER_WIDTH / 2;
        const maxZ = this.position.z + PLAYER_WIDTH / 2;

        return !(maxX < x || minX > x + 1 || maxY < y || minY > y + 1 || maxZ < z || minZ > z + 1);
    }

    update(delta: number): void {
        this.isSprinting = this.keys['shift'] && !this.isCrouching && this.isGrounded;
        this.isCrouching = this.keys['control'] || this.keys['ctrl'];

        const moveSpeed = this.isSprinting ? SPRINT_SPEED : (this.isCrouching ? CROUCH_SPEED : WALK_SPEED);

        const forward = new THREE.Vector3();
        const right = new THREE.Vector3();

        forward.set(Math.sin(this.yaw), 0, -Math.cos(this.yaw));
        right.set(Math.cos(this.yaw), 0, Math.sin(this.yaw));

        const move = new THREE.Vector3();
        if (this.keys['w']) move.addScaledVector(forward, moveSpeed);
        if (this.keys['s']) move.addScaledVector(forward, -moveSpeed);
        if (this.keys['d']) move.addScaledVector(right, moveSpeed);
        if (this.keys['a']) move.addScaledVector(right, -moveSpeed);

        this.velocity.x = move.x;
        this.velocity.z = move.z;

        this.velocity.y -= GRAVITY * delta;

        if (this.isGrounded && (this.keys[' '] || this.keys['spacebar'])) {
            this.velocity.y = JUMP_FORCE;
            this.isGrounded = false;
            this.audio.playJump();
        }

        this.position.addScaledVector(this.velocity, delta);

        this.handleCollisions();
        this.camera.position.copy(this.position);
        this.world.updateChunksAround(this.position);

        const walkSpeed = new THREE.Vector2(this.velocity.x, this.velocity.z).length();
        const currentTime = performance.now();
        if (walkSpeed > 0.5 && this.isGrounded && currentTime - this.lastStepTime > 400) {
            this.audio.playStep();
            this.lastStepTime = currentTime;
        }
    }

    private handleCollisions(): void {
        const minX = this.position.x - PLAYER_WIDTH / 2;
        const maxX = this.position.x + PLAYER_WIDTH / 2;
        const minY = this.position.y - PLAYER_HEIGHT;
        const maxY = this.position.y;
        const minZ = this.position.z - PLAYER_WIDTH / 2;
        const maxZ = this.position.z + PLAYER_WIDTH / 2;

        const minBx = Math.floor(minX - 1);
        const maxBx = Math.ceil(maxX + 1);
        const minBy = Math.floor(minY - 1);
        const maxBy = Math.ceil(maxY + 1);
        const minBz = Math.floor(minZ - 1);
        const maxBz = Math.ceil(maxZ + 1);

        this.isGrounded = false;
        let groundDistance = Infinity;

        for (let bx = minBx; bx <= maxBx; bx++) {
            for (let by = minBy; by <= maxBy; by++) {
                for (let bz = minBz; bz <= maxBz; bz++) {
                    const block = this.world.getBlock(bx, by, bz);
                    if (!isSolid(block)) continue;

                    const bMinX = bx;
                    const bMaxX = bx + 1;
                    const bMinY = by;
                    const bMaxY = by + 1;
                    const bMinZ = bz;
                    const bMaxZ = bz + 1;

                    if (maxX <= bMinX || minX >= bMaxX || maxY <= bMinY || minY >= bMaxY || maxZ <= bMinZ || minZ >= bMaxZ) {
                        continue;
                    }

                    const overlapX = Math.min(maxX - bMinX, bMaxX - minX);
                    const overlapY = Math.min(maxY - bMinY, bMaxY - minY);
                    const overlapZ = Math.min(maxZ - bMinZ, bMaxZ - minZ);

                    if (overlapY < Math.min(overlapX, overlapZ)) {
                        if (this.velocity.y < 0) {
                            this.position.y += overlapY;
                            this.velocity.y = 0;
                            if (overlapY < 0.3) {
                                this.isGrounded = true;
                                groundDistance = Math.min(groundDistance, overlapY);
                            }
                        } else {
                            this.position.y -= overlapY;
                            this.velocity.y = 0;
                        }
                    } else if (overlapX < overlapZ) {
                        if (this.velocity.x > 0) {
                            this.position.x -= overlapX;
                        } else {
                            this.position.x += overlapX;
                        }
                        this.velocity.x = 0;
                    } else {
                        if (this.velocity.z > 0) {
                            this.position.z -= overlapZ;
                        } else {
                            this.position.z += overlapZ;
                        }
                        this.velocity.z = 0;
                    }
                }
            }
        }
    }

    selectBlock(index: number): void {
        this.inventory.selectSlot(index);
        this.updateInventoryDisplay();
    }

    getTargetBlock(): { x: number, y: number, z: number } | null {
        return this.raycast();
    }
}
