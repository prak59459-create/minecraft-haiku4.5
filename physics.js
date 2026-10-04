export class PhysicsEngine {
    constructor(world) {
        this.world = world;
        this.gravity = 0.02;
        this.airResistance = 0.98;
        this.groundFriction = 0.9;
        this.terminalVelocity = 0.5;
    }

    applyGravity(velocity, isOnGround) {
        if (!isOnGround) {
            velocity.y -= this.gravity;
            if (velocity.y < -this.terminalVelocity) {
                velocity.y = -this.terminalVelocity;
            }
        }
        return velocity;
    }

    applyAirResistance(velocity, isOnGround) {
        const resistance = isOnGround ? this.groundFriction : this.airResistance;
        velocity.x *= resistance;
        velocity.z *= resistance;
        return velocity;
    }

    checkCollision(position, radius, checkY = true) {
        const checks = [];

        if (checkY) {
            for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 8) {
                const cx = position.x + Math.cos(angle) * radius;
                const cy = position.y + 0.1;
                const cz = position.z + Math.sin(angle) * radius;
                checks.push({ x: Math.floor(cx), y: Math.floor(cy), z: Math.floor(cz) });
            }
        }

        for (const check of checks) {
            const block = this.world.getBlock(check.x, check.y, check.z);
            if (this.isBlockSolid(block)) {
                return true;
            }
        }

        return false;
    }

    isBlockSolid(blockId) {
        return blockId !== 0 && blockId !== 8;
    }

    raycast(origin, direction, maxDistance = 100) {
        let distance = 0;
        const step = 0.1;

        while (distance < maxDistance) {
            const x = origin.x + direction.x * distance;
            const y = origin.y + direction.y * distance;
            const z = origin.z + direction.z * distance;

            const block = this.world.getBlock(
                Math.floor(x),
                Math.floor(y),
                Math.floor(z)
            );

            if (this.isBlockSolid(block)) {
                return {
                    hit: true,
                    position: { x, y, z },
                    distance,
                    blockPos: {
                        x: Math.floor(x),
                        y: Math.floor(y),
                        z: Math.floor(z)
                    }
                };
            }

            distance += step;
        }

        return { hit: false };
    }

    getGroundDistance(position, radius) {
        const checkDistance = 2;
        for (let d = 0; d <= checkDistance; d += 0.1) {
            if (this.checkCollision(
                { x: position.x, y: position.y - d, z: position.z },
                radius,
                false
            )) {
                return d;
            }
        }
        return -1;
    }

    calculateFriction(block) {
        const frictionMap = {
            1: 0.85,
            7: 0.92,
            8: 0.98,
            default: 0.9
        };
        return frictionMap[block] || frictionMap.default;
    }

    calculateAcceleration(input, friction = 0.9) {
        const acceleration = 0.15;
        input.x *= acceleration;
        input.z *= acceleration;
        return input;
    }
}
