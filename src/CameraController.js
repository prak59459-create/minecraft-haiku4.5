import * as THREE from 'three';

export class CameraController {
    constructor(camera, settings) {
        this.camera = camera;
        this.settings = settings;
        this.euler = new THREE.Euler(0, 0, 0, 'YXZ');
        this.pitch = 0;
        this.yaw = 0;

        this.updateFOV();
    }

    updateFOV() {
        this.camera.fov = this.settings.fov;
        this.camera.updateProjectionMatrix();
    }

    setFOV(fov) {
        this.settings.setFOV(fov);
        this.updateFOV();
    }

    rotateMouse(movementX, movementY, sensitivity) {
        this.yaw -= movementX * sensitivity;
        this.pitch -= movementY * sensitivity;

        this.pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.pitch));

        this.euler.setFromQuaternion(this.camera.quaternion);
        this.euler.rotateY(-movementX * sensitivity);
        this.euler.rotateX(-movementY * sensitivity);

        this.euler.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.euler.x));

        this.camera.quaternion.setFromEuler(this.euler);
    }

    getForwardDirection() {
        const forward = new THREE.Vector3(0, 0, -1);
        forward.applyQuaternion(this.camera.quaternion);
        forward.y = 0;
        forward.normalize();
        return forward;
    }

    getRightDirection() {
        const right = new THREE.Vector3(1, 0, 0);
        right.applyQuaternion(this.camera.quaternion);
        right.y = 0;
        right.normalize();
        return right;
    }

    setPosition(position) {
        this.camera.position.copy(position);
    }

    getPosition() {
        return this.camera.position.clone();
    }
}
