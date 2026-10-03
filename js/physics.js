class Physics {
    constructor(world) {
        this.world = world;
        this.gravity = new THREE.Vector3(0, -GRAVITY, 0);
    }

    getCollisionInfo(position, radius = 0.3) {
        const box = new THREE.Box3(
            position.clone().addScaledVector(new THREE.Vector3(1, 1, 1), -radius),
            position.clone().addScaledVector(new THREE.Vector3(1, 1, 1), radius)
        );

        const blocks = [];
        const minX = Math.floor(box.min.x);
        const maxX = Math.ceil(box.max.x);
        const minY = Math.floor(box.min.y);
        const maxY = Math.ceil(box.max.y);
        const minZ = Math.floor(box.min.z);
        const maxZ = Math.ceil(box.max.z);

        for (let x = minX; x <= maxX; x++) {
            for (let y = minY; y <= maxY; y++) {
                for (let z = minZ; z <= maxZ; z++) {
                    const block = this.world.getBlock(x, y, z);
                    if (block !== BLOCK_TYPES.AIR && block !== BLOCK_TYPES.WATER) {
                        const blockBox = new THREE.Box3(
                            new THREE.Vector3(x, y, z),
                            new THREE.Vector3(x + 1, y + 1, z + 1)
                        );
                        if (box.intersectsBox(blockBox)) {
                            blocks.push({
                                pos: new THREE.Vector3(x, y, z),
                                type: block
                            });
                        }
                    }
                }
            }
        }

        return blocks;
    }

    resolveCollisions(position, velocity, radius = 0.3) {
        const collisions = this.getCollisionInfo(position, radius);

        collisions.forEach(collision => {
            const blockBox = new THREE.Box3(
                collision.pos,
                collision.pos.clone().addScalar(1)
            );

            const playerBox = new THREE.Box3(
                position.clone().addScaledVector(new THREE.Vector3(1, 1, 1), -radius),
                position.clone().addScaledVector(new THREE.Vector3(1, 1, 1), radius)
            );

            const overlap = playerBox.clone();
            if (!overlap.intersectsBox(blockBox)) return;

            const closest = blockBox.clampPoint(position, new THREE.Vector3());
            const pushOut = position.clone().sub(closest).normalize();

            if (velocity.y < 0) {
                position.y = blockBox.max.y + radius;
                velocity.y = 0;
            } else if (velocity.y > 0) {
                position.y = blockBox.min.y - radius;
                velocity.y = 0;
            }

            if (velocity.x !== 0) {
                if (pushOut.x > 0) {
                    position.x = blockBox.max.x + radius;
                } else {
                    position.x = blockBox.min.x - radius;
                }
                velocity.x = 0;
            }

            if (velocity.z !== 0) {
                if (pushOut.z > 0) {
                    position.z = blockBox.max.z + radius;
                } else {
                    position.z = blockBox.min.z - radius;
                }
                velocity.z = 0;
            }
        });

        return collisions.length > 0 && velocity.y === 0;
    }

    isOnGround(position, radius = 0.3) {
        const checkPos = position.clone().sub(new THREE.Vector3(0, 0.05, 0));
        return this.getCollisionInfo(checkPos, radius).length > 0;
    }

    update(position, velocity) {
        velocity.add(this.gravity);
        velocity.y = Math.max(velocity.y, -0.5);

        position.add(velocity);

        const onGround = this.resolveCollisions(position, velocity, 0.3);

        return onGround;
    }
}
