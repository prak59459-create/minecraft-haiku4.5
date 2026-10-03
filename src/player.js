import * as THREE from 'three';
import { PLAYER, CHUNK_HEIGHT } from './config.js';
import { BLOCK } from './block-types.js';
import { moveAxis, aabbOverlapsSolid } from './physics.js';

const MAX_STEP = 0.4;

export class Player {
    constructor(camera, world) {
        this.camera = camera;
        this.world = world;
        this.position = new THREE.Vector3();
        this.velocity = new THREE.Vector3();
        this.yaw = 0;
        this.pitch = 0;
        this.onGround = false;
        this.inWater = false;
        this.sprinting = false;
        this.crouching = false;
        this.eyeHeight = PLAYER.eyeHeight;
    }

    // Searches outward for a column whose surface is open ground (not water or a tree canopy).
    spawnAt(x, z) {
        for (let r = 0; r < 24; r++) {
            for (let dz = -r; dz <= r; dz++) {
                for (let dx = -r; dx <= r; dx++) {
                    if (Math.max(Math.abs(dx), Math.abs(dz)) !== r) continue;
                    const bx = Math.floor(x) + dx;
                    const bz = Math.floor(z) + dz;
                    let y = CHUNK_HEIGHT - 1;
                    while (y > 0 && this.world.getBlock(bx, y, bz) === BLOCK.AIR) y--;
                    const surface = this.world.getBlock(bx, y, bz);
                    if (surface === BLOCK.GRASS || surface === BLOCK.SAND) {
                        this.position.set(bx + 0.5, y + 1.01, bz + 0.5);
                        this.velocity.set(0, 0, 0);
                        return;
                    }
                }
            }
        }
        this.position.set(x, CHUNK_HEIGHT, z);
    }

    look(dx, dy) {
        this.yaw -= dx * PLAYER.mouseSensitivity;
        this.pitch -= dy * PLAYER.mouseSensitivity;
        const limit = Math.PI / 2 - 0.001;
        this.pitch = Math.max(-limit, Math.min(limit, this.pitch));
    }

    getEyePosition(target = new THREE.Vector3()) {
        return target.set(this.position.x, this.position.y + this.eyeHeight, this.position.z);
    }

    getLookDirection(target = new THREE.Vector3()) {
        const cp = Math.cos(this.pitch);
        return target.set(-Math.sin(this.yaw) * cp, Math.sin(this.pitch), -Math.cos(this.yaw) * cp);
    }

    intersectsBlock(bx, by, bz) {
        const hw = PLAYER.width / 2;
        const p = this.position;
        return p.x + hw > bx && p.x - hw < bx + 1
            && p.y + PLAYER.height > by && p.y < by + 1
            && p.z + hw > bz && p.z - hw < bz + 1;
    }

    update(dt, input) {
        const forward = (input.isDown('KeyW') ? 1 : 0) - (input.isDown('KeyS') ? 1 : 0);
        const strafe = (input.isDown('KeyD') ? 1 : 0) - (input.isDown('KeyA') ? 1 : 0);
        this.crouching = input.isDown('KeyC');
        this.sprinting = !this.crouching && forward > 0 && (input.isDown('ShiftLeft') || input.isDown('ShiftRight'));

        const p = this.position;
        const feetBlock = this.world.getBlock(Math.floor(p.x), Math.floor(p.y + 0.4), Math.floor(p.z));
        this.inWater = feetBlock === BLOCK.WATER;

        const sin = Math.sin(this.yaw);
        const cos = Math.cos(this.yaw);
        let wishX = -sin * forward + cos * strafe;
        let wishZ = -cos * forward - sin * strafe;
        const len = Math.hypot(wishX, wishZ);
        if (len > 0) {
            wishX /= len;
            wishZ /= len;
        }

        let speed = this.crouching ? PLAYER.crouchSpeed : this.sprinting ? PLAYER.sprintSpeed : PLAYER.walkSpeed;
        if (this.inWater) speed *= 0.6;
        const accel = this.onGround || this.inWater ? 14 : 3;
        const blend = Math.min(1, accel * dt);
        this.velocity.x += (wishX * speed - this.velocity.x) * blend;
        this.velocity.z += (wishZ * speed - this.velocity.z) * blend;

        if (this.inWater) {
            this.velocity.y -= PLAYER.gravity * 0.25 * dt;
            this.velocity.y *= Math.max(0, 1 - 2 * dt);
            if (input.isDown('Space')) this.velocity.y = Math.min(this.velocity.y + 20 * dt, 3.5);
        } else {
            this.velocity.y -= PLAYER.gravity * dt;
            if (input.isDown('Space') && this.onGround) this.velocity.y = PLAYER.jumpSpeed;
        }
        this.velocity.y = Math.max(-PLAYER.maxFallSpeed, this.velocity.y);

        this.move(dt);

        const targetEye = this.crouching ? PLAYER.crouchEyeHeight : PLAYER.eyeHeight;
        this.eyeHeight += (targetEye - this.eyeHeight) * Math.min(1, 15 * dt);

        this.camera.position.copy(this.getEyePosition());
        this.camera.rotation.set(this.pitch, this.yaw, 0, 'YXZ');
    }

    move(dt) {
        const hw = PLAYER.width / 2;
        const h = PLAYER.height;
        const v = this.velocity;
        const p = this.position;
        const steps = Math.max(1, Math.ceil((Math.max(Math.abs(v.x), Math.abs(v.y), Math.abs(v.z)) * dt) / MAX_STEP));
        const sdt = dt / steps;
        this.onGround = false;

        for (let i = 0; i < steps; i++) {
            if (moveAxis(this.world, p, hw, h, 'y', v.y * sdt)) {
                if (v.y < 0) this.onGround = true;
                v.y = 0;
            }

            // While crouching on the ground, refuse horizontal moves that would leave the player unsupported.
            for (const axis of ['x', 'z']) {
                const prev = p[axis];
                if (moveAxis(this.world, p, hw, h, axis, v[axis] * sdt)) v[axis] = 0;
                if (this.crouching && this.onGround && !this.hasSupport()) {
                    p[axis] = prev;
                    v[axis] = 0;
                }
            }
        }
    }

    hasSupport() {
        const hw = PLAYER.width / 2;
        const p = this.position;
        return aabbOverlapsSolid(this.world, p.x - hw, p.y - 0.1, p.z - hw, p.x + hw, p.y, p.z + hw);
    }
}
