import * as THREE from 'three';

export class Physics {
    constructor(world, player) {
        this.world = world;
        this.player = player;
        this.playerWidth = 0.6;
        this.playerHeight = 1.8;
        this.playerDepth = 0.6;
    }

    getPlayerAABB() {
        return {
            minX: this.player.position.x - this.playerWidth / 2,
            maxX: this.player.position.x + this.playerWidth / 2,
            minY: this.player.position.y,
            maxY: this.player.position.y + this.playerHeight,
            minZ: this.player.position.z - this.playerDepth / 2,
            maxZ: this.player.position.z + this.playerDepth / 2
        };
    }

    blockAABB(x, y, z) {
        return {
            minX: x,
            maxX: x + 1,
            minY: y,
            maxY: y + 1,
            minZ: z,
            maxZ: z + 1
        };
    }

    AABBCollides(a, b) {
        return !(a.maxX <= b.minX || a.minX >= b.maxX ||
                 a.maxY <= b.minY || a.minY >= b.maxY ||
                 a.maxZ <= b.minZ || a.minZ >= b.maxZ);
    }

    checkGroundCollision() {
        const aabb = this.getPlayerAABB();
        const minX = Math.floor(aabb.minX);
        const maxX = Math.ceil(aabb.maxX);
        const minZ = Math.floor(aabb.minZ);
        const maxZ = Math.ceil(aabb.maxZ);

        // Check blocks below player
        for (let x = minX; x < maxX; x++) {
            for (let z = minZ; z < maxZ; z++) {
                const blockType = this.world.getBlockType(x, Math.floor(aabb.minY) - 1, z);
                if (blockType !== 0 && this.world.blockTypes[blockType]?.solid) {
                    return true;
                }
            }
        }
        return false;
    }

    resolveCollisions() {
        const aabb = this.getPlayerAABB();
        const minX = Math.floor(aabb.minX) - 1;
        const maxX = Math.ceil(aabb.maxX) + 1;
        const minY = Math.floor(aabb.minY) - 1;
        const maxY = Math.ceil(aabb.maxY) + 1;
        const minZ = Math.floor(aabb.minZ) - 1;
        const maxZ = Math.ceil(aabb.maxZ) + 1;

        // Resolve X collisions
        for (let x = minX; x < maxX; x++) {
            for (let y = minY; y < maxY; y++) {
                for (let z = minZ; z < maxZ; z++) {
                    const blockType = this.world.getBlockType(x, y, z);
                    if (blockType === 0 || !this.world.blockTypes[blockType]?.solid) continue;

                    const block = this.blockAABB(x, y, z);

                    if (this.AABBCollides(aabb, block)) {
                        // Resolve collision
                        const overlap = {
                            x: Math.min(aabb.maxX - block.minX, block.maxX - aabb.minX),
                            y: Math.min(aabb.maxY - block.minY, block.maxY - aabb.minY),
                            z: Math.min(aabb.maxZ - block.minZ, block.maxZ - aabb.minZ)
                        };

                        if (overlap.x < overlap.y && overlap.x < overlap.z) {
                            // X collision
                            if (aabb.minX + aabb.maxX < block.minX + block.maxX) {
                                this.player.position.x = block.minX - this.playerWidth / 2;
                            } else {
                                this.player.position.x = block.maxX + this.playerWidth / 2;
                            }
                            this.player.velocity.x = 0;
                        } else if (overlap.z < overlap.y) {
                            // Z collision
                            if (aabb.minZ + aabb.maxZ < block.minZ + block.maxZ) {
                                this.player.position.z = block.minZ - this.playerDepth / 2;
                            } else {
                                this.player.position.z = block.maxZ + this.playerDepth / 2;
                            }
                            this.player.velocity.z = 0;
                        } else {
                            // Y collision
                            if (aabb.minY + aabb.maxY < block.minY + block.maxY) {
                                this.player.position.y = block.minY - this.playerHeight;
                                this.player.velocity.y = 0;
                                this.player.isGrounded = true;
                            } else {
                                this.player.position.y = block.maxY;
                                this.player.velocity.y = 0;
                            }
                        }
                    }
                }
            }
        }
    }

    update(deltaTime) {
        if (!this.player.isFlying) {
            this.player.isGrounded = this.checkGroundCollision();
            this.resolveCollisions();
        } else {
            // In flying mode, no collision detection
            this.player.position.add(this.player.velocity.clone().multiplyScalar(deltaTime));
        }
    }
}
