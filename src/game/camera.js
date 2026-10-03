import * as THREE from 'three';

export class CameraController {
    constructor(camera) {
        this.camera = camera;
        this.targetPosition = new THREE.Vector3();
        this.targetRotation = new THREE.Euler();
        this.smoothness = 0.1;
        this.bobbing = 0;
        this.bobAmount = 0.05;
        this.bobSpeed = 0.1;
        this.headbobEnabled = true;
    }

    setPosition(position) {
        this.targetPosition.copy(position);
    }

    setRotation(euler) {
        this.targetRotation.copy(euler);
    }

    updateHeadbob(velocity, isGrounded) {
        if (!this.headbobEnabled || velocity === 0) return 0;

        if (isGrounded && velocity > 0) {
            this.bobbing += this.bobSpeed;
        } else {
            this.bobbing = 0;
        }

        return Math.sin(this.bobbing) * this.bobAmount;
    }

    update(playerPos, euler, velocity, isGrounded) {
        // Smooth position interpolation
        this.camera.position.lerp(playerPos, this.smoothness);

        // Add head bob for movement
        const bobOffset = this.updateHeadbob(velocity, isGrounded);
        this.camera.position.y += bobOffset;

        // Update rotation (no smoothing for instant response)
        this.camera.rotation.order = 'YXZ';
        this.camera.rotation.y = euler.y;
        this.camera.rotation.x = euler.x;
    }

    setHeadbobEnabled(enabled) {
        this.headbobEnabled = enabled;
    }
}
