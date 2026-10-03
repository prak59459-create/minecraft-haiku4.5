class FirstPersonCamera {
    constructor(camera) {
        this.camera = camera;
        this.targetPosition = camera.position.clone();
        this.targetRotation = new THREE.Euler(0, 0, 0, 'YXZ');
        this.smoothness = 0.1;
        this.bobAmount = 0.05;
        this.bobSpeed = 5;
        this.time = 0;
        this.isMoving = false;
    }

    update(playerPosition, pitch, yaw, isMoving) {
        this.time += 1 / 60;
        this.isMoving = isMoving;

        const headPosition = playerPosition.clone();
        headPosition.y += 1.7;

        this.targetPosition.lerp(headPosition, this.smoothness);

        const bobOffset = this.isMoving ?
            Math.sin(this.time * this.bobSpeed) * this.bobAmount : 0;

        this.camera.position.copy(this.targetPosition);
        this.camera.position.y += bobOffset;

        this.targetRotation.order = 'YXZ';
        this.targetRotation.x = pitch;
        this.targetRotation.y = yaw;

        this.camera.rotation.copy(this.targetRotation);
    }

    setMoving(isMoving) {
        this.isMoving = isMoving;
    }
}

class CameraCollisionDetector {
    constructor(world) {
        this.world = world;
        this.rayLength = 0.5;
    }

    checkCollision(position, direction) {
        const rayStart = position.clone();
        const rayEnd = position.clone().addScaledVector(direction, this.rayLength);

        for (let i = 0; i <= 10; i++) {
            const testPos = new THREE.Vector3().lerpVectors(rayStart, rayEnd, i / 10);
            const x = Math.floor(testPos.x);
            const y = Math.floor(testPos.y);
            const z = Math.floor(testPos.z);

            const block = this.world.getBlock(x, y, z);
            if (block !== BLOCK_TYPES.AIR) {
                return true;
            }
        }

        return false;
    }

    adjustCameraPosition(position, direction, minDistance = 0.3) {
        let distance = 0;
        const step = 0.01;

        while (distance < minDistance) {
            const testPos = position.clone().addScaledVector(direction, distance);
            if (!this.checkCollision(testPos, direction)) {
                return testPos;
            }
            distance += step;
        }

        return position.clone().addScaledVector(direction, minDistance);
    }
}
