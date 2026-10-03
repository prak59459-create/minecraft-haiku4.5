import * as THREE from 'three';

export class Physics {
    constructor() {
        this.gravity = -9.81 * 5;
        this.friction = 0.95;
        this.airResistance = 0.98;
    }

    update(player, world, deltaTime) {
        player.acceleration.y = this.gravity;
        player.velocity.y += player.acceleration.y * deltaTime;
        player.velocity.y *= this.airResistance;

        player.velocity.x *= this.friction;
        player.velocity.z *= this.friction;

        const newPos = player.position.clone().add(player.velocity.clone().multiplyScalar(deltaTime));

        const playerRadius = 0.3;
        const playerHeight = 1.62;

        player.isGrounded = false;

        const checkY = newPos.y - playerRadius;
        if (checkY <= 0 && player.velocity.y <= 0) {
            newPos.y = playerRadius;
            player.velocity.y = 0;
            player.isGrounded = true;
        }

        const blockBelow = world.getBlock(new THREE.Vector3(newPos.x, newPos.y - playerRadius - 0.01, newPos.z));
        const blockAtFeet = world.getBlock(newPos);
        const blockAtHead = world.getBlock(newPos.clone().add(new THREE.Vector3(0, playerHeight, 0)));

        if (blockBelow && blockBelow.type !== 'water' && player.velocity.y <= 0) {
            newPos.y = Math.floor(newPos.y) + 1 + playerRadius;
            player.velocity.y = 0;
            player.isGrounded = true;
        }

        if (blockAtFeet && blockAtFeet.type !== 'water') {
            newPos.y = Math.floor(newPos.y) + 1 + playerRadius;
            player.velocity.y = 0;
        }

        if (blockAtHead && blockAtHead.type !== 'water') {
            player.velocity.y = Math.min(0, player.velocity.y);
            newPos.y = Math.floor(newPos.y + playerHeight) - playerHeight;
        }

        player.position.copy(newPos);
    }
}
