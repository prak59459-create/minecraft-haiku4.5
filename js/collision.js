class CollisionBox {
    constructor(min, max) {
        this.min = min;
        this.max = max;
    }

    intersects(other) {
        return this.min.x <= other.max.x && this.max.x >= other.min.x &&
               this.min.y <= other.max.y && this.max.y >= other.min.y &&
               this.min.z <= other.max.z && this.max.z >= other.min.z;
    }

    containsPoint(point) {
        return point.x >= this.min.x && point.x <= this.max.x &&
               point.y >= this.min.y && point.y <= this.max.y &&
               point.z >= this.min.z && point.z <= this.max.z;
    }
}

class PhysicsEngine {
    constructor(world) {
        this.world = world;
        this.gravity = 0.015;
        this.friction = 0.9;
        this.drag = 0.98;
    }

    getBlockAABB(x, y, z) {
        const size = BLOCK_SIZE;
        const bx = Math.floor(x) * size;
        const by = Math.floor(y) * size;
        const bz = Math.floor(z) * size;

        return new CollisionBox(
            new THREE.Vector3(bx, by, bz),
            new THREE.Vector3(bx + size, by + size, bz + size)
        );
    }

    getPlayerAABB(pos, radius, height) {
        return new CollisionBox(
            new THREE.Vector3(pos.x - radius, pos.y, pos.z - radius),
            new THREE.Vector3(pos.x + radius, pos.y + height, pos.z + radius)
        );
    }

    checkCollisions(playerPos, radius, height) {
        const playerAABB = this.getPlayerAABB(playerPos, radius, height);

        const minChunkX = Math.floor((playerPos.x - radius) / CHUNK_SIZE);
        const maxChunkX = Math.floor((playerPos.x + radius) / CHUNK_SIZE);
        const minChunkZ = Math.floor((playerPos.z - radius) / CHUNK_SIZE);
        const maxChunkZ = Math.floor((playerPos.z + radius) / CHUNK_SIZE);

        const collisions = [];

        for (let cx = minChunkX; cx <= maxChunkX; cx++) {
            for (let cz = minChunkZ; cz <= maxChunkZ; cz++) {
                for (let bx = Math.floor(playerPos.x - radius); bx <= Math.floor(playerPos.x + radius); bx++) {
                    for (let by = Math.floor(playerPos.y - 1); by <= Math.floor(playerPos.y + height + 1); by++) {
                        for (let bz = Math.floor(playerPos.z - radius); bz <= Math.floor(playerPos.z + radius); bz++) {
                            const blockId = this.world.getBlockAt(bx, by, bz);
                            if (blockId !== 0 && blockId !== 6) {
                                const blockAABB = this.getBlockAABB(bx, by, bz);
                                if (playerAABB.intersects(blockAABB)) {
                                    collisions.push({
                                        block: blockAABB,
                                        pos: new THREE.Vector3(bx, by, bz)
                                    });
                                }
                            }
                        }
                    }
                }
            }
        }

        return collisions;
    }

    resolveCollisions(playerPos, velocity, radius, height) {
        const collisions = this.checkCollisions(playerPos, radius, height);

        if (collisions.length === 0) {
            return playerPos.clone().add(velocity);
        }

        const newPos = playerPos.clone();

        for (const collision of collisions) {
            const block = collision.block;
            const playerBB = this.getPlayerAABB(newPos, radius, height);

            if (!playerBB.intersects(block)) continue;

            const dx = Math.abs(playerBB.min.x + (playerBB.max.x - playerBB.min.x) / 2 -
                               block.min.x + (block.max.x - block.min.x) / 2);
            const dy = Math.abs(playerBB.min.y + (playerBB.max.y - playerBB.min.y) / 2 -
                               block.min.y + (block.max.y - block.min.y) / 2);
            const dz = Math.abs(playerBB.min.z + (playerBB.max.z - playerBB.min.z) / 2 -
                               block.min.z + (block.max.z - block.min.z) / 2);

            const minOverlap = Math.min(dx, dy, dz);

            if (minOverlap === dy) {
                if (newPos.y + height / 2 < block.min.y + BLOCK_SIZE / 2) {
                    newPos.y = block.min.y - height;
                    velocity.y = 0;
                } else {
                    newPos.y = block.max.y;
                    velocity.y = 0;
                }
            } else if (minOverlap === dx) {
                if (newPos.x < block.min.x + BLOCK_SIZE / 2) {
                    newPos.x = block.min.x - radius;
                } else {
                    newPos.x = block.max.x + radius;
                }
                velocity.x = 0;
            } else if (minOverlap === dz) {
                if (newPos.z < block.min.z + BLOCK_SIZE / 2) {
                    newPos.z = block.min.z - radius;
                } else {
                    newPos.z = block.max.z + radius;
                }
                velocity.z = 0;
            }
        }

        return newPos;
    }

    isOnGround(playerPos, radius, height) {
        const checkPos = playerPos.clone();
        checkPos.y -= 0.1;

        const collisions = this.checkCollisions(checkPos, radius, 0.1);
        return collisions.length > 0;
    }

    castRay(start, direction, maxDistance) {
        const step = 0.1;
        let distance = 0;
        const currentPos = start.clone();

        while (distance < maxDistance) {
            currentPos.add(direction.clone().multiplyScalar(step));
            distance += step;

            const blockId = this.world.getBlockAt(currentPos.x, currentPos.y, currentPos.z);
            if (blockId !== 0) {
                return {
                    hit: true,
                    position: currentPos,
                    blockId: blockId,
                    distance: distance
                };
            }
        }

        return { hit: false, distance: maxDistance };
    }
}
