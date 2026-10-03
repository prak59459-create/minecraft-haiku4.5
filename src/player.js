import * as THREE from 'three';

export class Player {
    constructor() {
        this.position = new THREE.Vector3(10, 70, 10);
        this.velocity = new THREE.Vector3();
        this.acceleration = new THREE.Vector3();

        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.copy(this.position);

        this.euler = new THREE.Euler(0, 0, 0, 'YXZ');
        this.pitch = 0;
        this.yaw = 0;

        this.speed = 20;
        this.sprintSpeed = 30;
        this.jumpPower = 15;
        this.isSprinting = false;
        this.isGrounded = false;
        this.isCrouching = false;

        this.selectedBlock = 0;
        this.blockInventory = [
            { type: 'grass', name: 'grass' },
            { type: 'dirt', name: 'dirt' },
            { type: 'stone', name: 'stone' },
            { type: 'wood', name: 'wood' },
            { type: 'leaves', name: 'leaves' },
            { type: 'water', name: 'water' },
            { type: 'sand', name: 'sand' },
            { type: 'gravel', name: 'gravel' },
            { type: 'cobblestone', name: 'cobblestone' }
        ];

        this.eyeHeight = 1.62;
    }

    selectBlock(index) {
        this.selectedBlock = Math.min(8, Math.max(0, index));
    }

    update(deltaTime, world) {
        this.camera.position.copy(this.position);
        this.camera.position.y += this.eyeHeight;

        this.euler.setFromQuaternion(this.camera.quaternion);
        this.camera.quaternion.setFromEuler(this.euler);
    }

    rotate(dx, dy) {
        const sensitivity = 0.001;
        this.yaw -= dx * sensitivity;
        this.pitch -= dy * sensitivity;

        this.pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.pitch));

        this.camera.quaternion.setFromEuler(new THREE.Euler(this.pitch, this.yaw, 0, 'YXZ'));
    }

    getForwardDirection() {
        const direction = new THREE.Vector3(0, 0, -1);
        direction.applyQuaternion(this.camera.quaternion);
        return direction;
    }

    getRightDirection() {
        const direction = new THREE.Vector3(1, 0, 0);
        direction.applyQuaternion(this.camera.quaternion);
        return direction;
    }

    getHeadRaycast() {
        return {
            origin: this.position.clone().add(new THREE.Vector3(0, this.eyeHeight, 0)),
            direction: this.getForwardDirection()
        };
    }
}
