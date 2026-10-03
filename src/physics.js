import { isBlockSolid, BLOCK_TYPES } from './blocks.js';

export class Physics {
    constructor(world) {
        this.world = world;
        this.gravity = -0.08;
        this.playerHeight = 1.8;
        this.playerWidth = 0.6;
        this.inWater = false;
        this.waterDrag = 0.8;
    }

    isBlockAtPosition(x, y, z) {
        const blockType = this.world.getBlockAt(x, y, z);
        return isBlockSolid(blockType);
    }

    isBlockWater(x, y, z) {
        const blockType = this.world.getBlockAt(x, y, z);
        return blockType === BLOCK_TYPES.WATER;
    }

    checkCollision(pos, width, height) {
        const corners = [
            [pos.x - width / 2, pos.y, pos.z - width / 2],
            [pos.x + width / 2, pos.y, pos.z - width / 2],
            [pos.x - width / 2, pos.y, pos.z + width / 2],
            [pos.x + width / 2, pos.y, pos.z + width / 2],
            [pos.x - width / 2, pos.y + height, pos.z - width / 2],
            [pos.x + width / 2, pos.y + height, pos.z - width / 2],
            [pos.x - width / 2, pos.y + height, pos.z + width / 2],
            [pos.x + width / 2, pos.y + height, pos.z + width / 2],
        ];

        for (const [cx, cy, cz] of corners) {
            const bx = Math.floor(cx);
            const by = Math.floor(cy);
            const bz = Math.floor(cz);

            if (this.isBlockAtPosition(bx, by, bz)) {
                return true;
            }
        }

        return false;
    }

    checkCollisionAxis(pos, vel, width, height, axis) {
        const newPos = pos.clone();
        newPos[axis] += vel[axis];

        if (this.checkCollision(newPos, width, height)) {
            return false;
        }

        return true;
    }

    isOnGround(pos, width, height) {
        const below = pos.clone();
        below.y -= 0.1;

        for (let dx = -width / 2; dx <= width / 2; dx += 0.3) {
            for (let dz = -width / 2; dz <= width / 2; dz += 0.3) {
                const bx = Math.floor(pos.x + dx);
                const by = Math.floor(below.y);
                const bz = Math.floor(pos.z + dz);

                if (this.isBlockAtPosition(bx, by, bz)) {
                    return true;
                }
            }
        }

        return false;
    }

    update(player, dt) {
        const width = this.playerWidth;
        const height = this.playerHeight;

        this.inWater = this.isBlockWater(
            Math.floor(player.position.x),
            Math.floor(player.position.y + height * 0.5),
            Math.floor(player.position.z)
        );

        if (this.inWater) {
            player.velocity.y += 0.04;
            player.velocity.y *= 0.98;
        } else {
            player.velocity.y += this.gravity;
        }

        player.velocity.y = Math.max(player.velocity.y, -0.5);

        const moveSpeed = player.isSprinting ? 0.15 : (player.isCrouching ? 0.04 : 0.1);
        const maxSpeed = player.isSprinting ? 0.3 : (player.isCrouching ? 0.08 : 0.2);

        const moveDir = {
            x: 0,
            y: 0,
            z: 0,
        };

        if (player.input.forward) moveDir.z -= 1;
        if (player.input.backward) moveDir.z += 1;
        if (player.input.left) moveDir.x -= 1;
        if (player.input.right) moveDir.x += 1;

        if (moveDir.x !== 0 || moveDir.z !== 0) {
            const length = Math.sqrt(moveDir.x ** 2 + moveDir.z ** 2);
            moveDir.x /= length;
            moveDir.z /= length;

            const cosYaw = Math.cos(player.euler.order === 'YXZ' ? player.euler.y : -player.euler.y);
            const sinYaw = Math.sin(player.euler.order === 'YXZ' ? player.euler.y : -player.euler.y);

            const forward = {
                x: sinYaw,
                z: cosYaw,
            };

            const right = {
                x: cosYaw,
                z: -sinYaw,
            };

            const accel = {
                x: (forward.x * moveDir.z + right.x * moveDir.x) * moveSpeed,
                z: (forward.z * moveDir.z + right.z * moveDir.x) * moveSpeed,
            };

            player.velocity.x += accel.x;
            player.velocity.z += accel.z;
        } else {
            player.velocity.x *= 0.9;
            player.velocity.z *= 0.9;
        }

        const speed = Math.sqrt(player.velocity.x ** 2 + player.velocity.z ** 2);
        if (speed > maxSpeed) {
            const scale = maxSpeed / speed;
            player.velocity.x *= scale;
            player.velocity.z *= scale;
        }

        if (this.checkCollisionAxis(player.position, player.velocity, width, height, 'x')) {
            player.position.x += player.velocity.x;
        } else {
            player.velocity.x = 0;
        }

        if (this.checkCollisionAxis(player.position, player.velocity, width, height, 'z')) {
            player.position.z += player.velocity.z;
        } else {
            player.velocity.z = 0;
        }

        if (this.checkCollisionAxis(player.position, player.velocity, width, height, 'y')) {
            player.position.y += player.velocity.y;
        } else {
            player.velocity.y = 0;
        }

        if (this.isOnGround(player.position, width, height)) {
            player.onGround = true;
            if (player.input.jump) {
                player.velocity.y = 0.42;
                player.onGround = false;
            }
        } else {
            player.onGround = false;
        }

        player.position.y = Math.max(player.position.y, 0);
    }
}
