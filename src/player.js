class Player {
    constructor(position = new THREE.Vector3(0, 100, 0)) {
        this.position = position;
        this.velocity = new THREE.Vector3();
        this.acceleration = new THREE.Vector3();

        this.pitch = 0;
        this.yaw = 0;

        this.onGround = false;
        this.isSprinting = false;
        this.isCrouching = false;

        this.selectedBlock = BLOCK_TYPES.DIRT;
        this.selectedIndex = 0;

        this.cameraTarget = new THREE.Vector3();
        this.updateCameraTarget();
    }

    updateCameraTarget() {
        this.cameraTarget.set(
            this.position.x + Math.sin(this.yaw) * Math.cos(this.pitch),
            this.position.y + Math.sin(this.pitch),
            this.position.z + Math.cos(this.yaw) * Math.cos(this.pitch)
        );
    }

    move(direction, deltaTime) {
        const speed = this.isSprinting ? CONFIG.PLAYER_SPRINT_SPEED : CONFIG.PLAYER_SPEED;
        const targetVelocity = new THREE.Vector3();

        if (direction.forward) {
            targetVelocity.x += Math.sin(this.yaw) * speed;
            targetVelocity.z += Math.cos(this.yaw) * speed;
        }
        if (direction.backward) {
            targetVelocity.x -= Math.sin(this.yaw) * speed;
            targetVelocity.z -= Math.cos(this.yaw) * speed;
        }
        if (direction.left) {
            targetVelocity.x += Math.sin(this.yaw - Math.PI / 2) * speed;
            targetVelocity.z += Math.cos(this.yaw - Math.PI / 2) * speed;
        }
        if (direction.right) {
            targetVelocity.x += Math.sin(this.yaw + Math.PI / 2) * speed;
            targetVelocity.z += Math.cos(this.yaw + Math.PI / 2) * speed;
        }

        const acceleration = 0.8;
        const timeScale = Math.min(deltaTime * 60, 1);
        this.velocity.x += (targetVelocity.x - this.velocity.x) * acceleration * timeScale;
        this.velocity.z += (targetVelocity.z - this.velocity.z) * acceleration * timeScale;

        if (!direction.forward && !direction.backward && !direction.left && !direction.right) {
            this.velocity.x *= 0.85;
            this.velocity.z *= 0.85;
        }
    }

    jump() {
        if (this.onGround) {
            this.velocity.y = CONFIG.PLAYER_JUMP_FORCE;
            this.onGround = false;
        }
    }

    setSelectedBlock(index) {
        this.selectedIndex = Utils.clamp(index, 0, SELECTABLE_BLOCKS.length - 1);
        this.selectedBlock = SELECTABLE_BLOCKS[this.selectedIndex];
    }

    getEyePosition() {
        const eyeHeight = this.isCrouching ? 1.3 : 1.62;
        return new THREE.Vector3(
            this.position.x,
            this.position.y + eyeHeight,
            this.position.z
        );
    }

    getLookDirection() {
        return new THREE.Vector3(
            Math.sin(this.yaw) * Math.cos(this.pitch),
            Math.sin(this.pitch),
            Math.cos(this.yaw) * Math.cos(this.pitch)
        ).normalize();
    }
}
