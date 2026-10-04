import * as THREE from 'three';
import { BLOCK_TYPES, TRANSPARENT_BLOCKS } from './blocks.js';

export class Physics {
    constructor(world) {
        this.world = world;
    }

    isBlockSolid(x, y, z) {
        const block = this.world.getBlock(Math.floor(x), Math.floor(y), Math.floor(z));
        return block && block !== BLOCK_TYPES.AIR && !TRANSPARENT_BLOCKS.has(block);
    }

    getCollisionBox(x, y, z) {
        return {
            x: Math.floor(x),
            y: Math.floor(y),
            z: Math.floor(z),
            minX: Math.floor(x),
            minY: Math.floor(y),
            minZ: Math.floor(z),
            maxX: Math.floor(x) + 1,
            maxY: Math.floor(y) + 1,
            maxZ: Math.floor(z) + 1
        };
    }

    checkCollision(x, y, z, width, height) {
        const halfWidth = width / 2;

        const corners = [
            [x - halfWidth, y, z - halfWidth],
            [x + halfWidth, y, z - halfWidth],
            [x - halfWidth, y, z + halfWidth],
            [x + halfWidth, y, z + halfWidth],
            [x - halfWidth, y + height, z - halfWidth],
            [x + halfWidth, y + height, z - halfWidth],
            [x - halfWidth, y + height, z + halfWidth],
            [x + halfWidth, y + height, z + halfWidth],
        ];

        for (let [cx, cy, cz] of corners) {
            if (this.isBlockSolid(cx, cy, cz)) {
                return true;
            }
        }
        return false;
    }

    update(player, world, deltaTime) {
        const stepSize = 0.1;
        const steps = Math.ceil(Math.abs(player.velocity.y) * deltaTime / stepSize);

        for (let i = 0; i < steps; i++) {
            const dy = player.velocity.y * deltaTime / steps;

            let newY = player.position.y + dy;

            if (!this.checkCollision(player.position.x, newY, player.position.z, player.width, player.height)) {
                player.position.y = newY;
            } else {
                if (player.velocity.y < 0) {
                    player.position.y = Math.floor(player.position.y) + 1;
                    player.velocity.y = 0;
                    player.isOnGround = true;
                } else {
                    player.position.y = Math.floor(player.position.y);
                    player.velocity.y = 0;
                }
            }
        }

        const moveSteps = Math.ceil(Math.max(Math.abs(player.velocity.x), Math.abs(player.velocity.z)) * deltaTime / stepSize);

        for (let i = 0; i < moveSteps; i++) {
            const dx = player.velocity.x * deltaTime / moveSteps;
            const dz = player.velocity.z * deltaTime / moveSteps;

            let newX = player.position.x + dx;
            let newZ = player.position.z + dz;

            if (this.checkCollision(newX, player.position.y, player.position.z, player.width, player.height)) {
                newX = player.position.x;
            }

            if (this.checkCollision(player.position.x, player.position.y, newZ, player.width, player.height)) {
                newZ = player.position.z;
            }

            player.position.x = newX;
            player.position.z = newZ;
        }
    }
}
