import * as THREE from 'three';

export class CameraController {
    constructor(camera) {
        this.camera = camera;
        this.bobAmount = 0.01;
        this.bobSpeed = 0.1;
        this.bobPhase = 0;
        this.isMoving = false;
        this.basePosition = camera.position.clone();
    }

    updateBob(isMoving, deltaTime = 0.016) {
        this.isMoving = isMoving;

        if (isMoving) {
            this.bobPhase += this.bobSpeed;

            const bobY = Math.sin(this.bobPhase) * this.bobAmount;
            const bobZ = Math.cos(this.bobPhase * 2) * this.bobAmount * 0.5;

            this.camera.position.y += bobY;
            this.camera.position.z += bobZ;
        }
    }

    resetPosition(position) {
        this.basePosition.copy(position);
        this.camera.position.copy(position);
        this.bobPhase = 0;
    }

    getFOV() {
        return this.camera.fov;
    }

    setFOV(fov) {
        this.camera.fov = Math.max(30, Math.min(120, fov));
        this.camera.updateProjectionMatrix();
    }

    zoom(direction) {
        const amount = 5;
        if (direction > 0) {
            this.setFOV(this.camera.fov - amount);
        } else {
            this.setFOV(this.camera.fov + amount);
        }
    }
}
