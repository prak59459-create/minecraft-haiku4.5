import * as THREE from 'three';

export class Physics {
    constructor() {
        this.gravity = -9.81 * 5;
        this.friction = 0.8;
        this.airResistance = 0.99;
        this.playerRadius = 0.3;
        this.playerHeight = 1.62;
    }

    update(player, world, deltaTime) {
        player.acceleration.y = this.gravity;
        player.velocity.y += player.acceleration.y * deltaTime;
        player.velocity.y *= this.airResistance;

        player.velocity.x *= this.friction;
        player.velocity.z *= this.friction;

        const newPos = player.position.clone().add(player.velocity.clone().multiplyScalar(deltaTime));
        player.isGrounded = false;

        if (newPos.y <= this.playerRadius && player.velocity.y <= 0) {
            newPos.y = this.playerRadius;
            player.velocity.y = 0;
            player.isGrounded = true;
        } else {
            this.checkVerticalCollisions(player, world, newPos);
        }

        player.position.copy(newPos);
    }

    checkVerticalCollisions(player, world, newPos) {
        const checkPoints = [
            new THREE.Vector3(0, -this.playerRadius, 0),
            new THREE.Vector3(0.25, -this.playerRadius, 0),
            new THREE.Vector3(-0.25, -this.playerRadius, 0),
            new THREE.Vector3(0, -this.playerRadius, 0.25),
            new THREE.Vector3(0, -this.playerRadius, -0.25)
        ];

        for (const offset of checkPoints) {
            const checkPos = newPos.clone().add(offset);
            const block = world.getBlock(checkPos);

            if (block && block.type !== 'air' && block.type !== 'water') {
                if (player.velocity.y <= 0) {
                    newPos.y = Math.ceil(checkPos.y) + this.playerRadius;
                    player.velocity.y = 0;
                    player.isGrounded = true;
                }
            }
        }

        const headCheckPoints = [
            new THREE.Vector3(0, this.playerHeight, 0),
            new THREE.Vector3(0.2, this.playerHeight, 0),
            new THREE.Vector3(-0.2, this.playerHeight, 0)
        ];

        for (const offset of headCheckPoints) {
            const checkPos = newPos.clone().add(offset);
            const block = world.getBlock(checkPos);

            if (block && block.type !== 'air' && block.type !== 'water') {
                if (player.velocity.y > 0) {
                    player.velocity.y = 0;
                    newPos.y = Math.floor(checkPos.y) - this.playerHeight;
                }
            }
        }
    }
}
