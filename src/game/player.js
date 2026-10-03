import * as THREE from 'three';

export class Player {
    constructor(camera, domElement) {
        this.camera = camera;
        this.domElement = domElement;

        // Position and velocity
        this.position = new THREE.Vector3(0, 70, 0);
        this.velocity = new THREE.Vector3(0, 0, 0);

        // Physics
        this.gravity = 30;
        this.groundDrag = 0.8;
        this.airDrag = 0.99;
        this.jumpForce = 15;
        this.moveSpeed = 20;
        this.sprintSpeed = 30;
        this.crouchSpeed = 10;

        // State
        this.isGrounded = false;
        this.isSprinting = false;
        this.isCrouching = false;
        this.isFlying = false;
        this.canDoubleJump = true;

        // Input
        this.keys = {};
        this.mouseDown = { left: false, right: false };

        // Camera
        this.camera.position.copy(this.position);
        this.camera.position.y += 1.6; // eye height
        this.pitch = 0;
        this.yaw = 0;

        // Block selection
        this.selectedBlock = 1; // grass
        this.blockTypes = [1, 2, 3, 4, 5, 6]; // available blocks

        // Raycaster for block interaction
        this.raycaster = new THREE.Raycaster();
        this.raycaster.far = 5;
        this.blockTarget = null;
        this.blockTargetFace = null;

        this.setupControls();
    }

    setupControls() {
        // Keyboard
        document.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;

            // Number keys for block selection
            if (e.key >= '1' && e.key <= '9') {
                const idx = parseInt(e.key) - 1;
                if (idx < this.blockTypes.length) {
                    this.selectedBlock = this.blockTypes[idx];
                }
            }

            // E to open inventory
            if (e.key === 'e') {
                document.getElementById('inventory').classList.toggle('visible');
            }

            // F for flying (creative mode toggle)
            if (e.key === 'f') {
                this.isFlying = !this.isFlying;
                this.velocity.y = 0;
            }
        });

        document.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
        });

        // Mouse
        this.domElement.addEventListener('click', () => {
            this.domElement.requestPointerLock();
        });

        document.addEventListener('pointerlockchange', () => {
            if (document.pointerLockElement === this.domElement) {
                document.addEventListener('mousemove', (e) => this.onMouseMove(e));
            } else {
                document.removeEventListener('mousemove', (e) => this.onMouseMove(e));
            }
        });

        // Mouse buttons
        document.addEventListener('mousedown', (e) => {
            if (e.button === 0) this.mouseDown.left = true;
            if (e.button === 2) this.mouseDown.right = true;
        });

        document.addEventListener('mouseup', (e) => {
            if (e.button === 0) this.mouseDown.left = false;
            if (e.button === 2) this.mouseDown.right = false;
        });

        // Scroll wheel for block selection
        this.domElement.addEventListener('wheel', (e) => {
            e.preventDefault();
            const direction = e.deltaY > 0 ? 1 : -1;
            let currentIdx = this.blockTypes.indexOf(this.selectedBlock);
            currentIdx = (currentIdx + direction + this.blockTypes.length) % this.blockTypes.length;
            this.selectedBlock = this.blockTypes[currentIdx];
        }, { passive: false });
    }

    onMouseMove(e) {
        const sensitivity = 0.005;
        this.yaw -= e.movementX * sensitivity;
        this.pitch -= e.movementY * sensitivity;

        // Clamp pitch
        this.pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.pitch));
    }

    updateCamera() {
        // Update camera rotation
        this.camera.quaternion.order = 'YXZ';
        this.camera.rotation.order = 'YXZ';
        this.camera.rotation.y = this.yaw;
        this.camera.rotation.x = this.pitch;

        // Update camera position (eye height)
        const eyeHeight = this.isCrouching ? 1.2 : 1.6;
        this.camera.position.copy(this.position);
        this.camera.position.y += eyeHeight;
    }

    getForwardVector() {
        const forward = new THREE.Vector3();
        this.camera.getWorldDirection(forward);
        forward.y = 0;
        forward.normalize();
        return forward;
    }

    getRightVector() {
        const forward = this.getForwardVector();
        const right = new THREE.Vector3().crossVectors(forward, new THREE.Vector3(0, 1, 0));
        return right.normalize();
    }

    handleMovement(deltaTime) {
        if (this.isFlying) {
            this.handleFlyingMovement(deltaTime);
        } else {
            this.handleWalkingMovement(deltaTime);
        }
    }

    handleWalkingMovement(deltaTime) {
        const forward = this.getForwardVector();
        const right = this.getRightVector();

        let moveDirection = new THREE.Vector3();

        // Check input
        this.isSprinting = this.keys['shift'];
        this.isCrouching = this.keys['control'];

        const currentSpeed = this.isSprinting ? this.sprintSpeed : (this.isCrouching ? this.crouchSpeed : this.moveSpeed);

        if (this.keys['w']) moveDirection.addScaledVector(forward, currentSpeed);
        if (this.keys['s']) moveDirection.addScaledVector(forward, -currentSpeed);
        if (this.keys['a']) moveDirection.addScaledVector(right, -currentSpeed);
        if (this.keys['d']) moveDirection.addScaledVector(right, currentSpeed);

        // Apply horizontal movement
        this.velocity.x = moveDirection.x;
        this.velocity.z = moveDirection.z;

        // Apply gravity
        this.velocity.y -= this.gravity * deltaTime;

        // Jump
        if (this.keys[' '] && this.isGrounded) {
            this.velocity.y = this.jumpForce;
            this.isGrounded = false;
        }

        // Damping
        const dragFactor = this.isGrounded ? this.groundDrag : this.airDrag;
        this.velocity.x *= dragFactor;
        this.velocity.z *= dragFactor;
    }

    handleFlyingMovement(deltaTime) {
        const forward = this.getForwardVector();
        const right = this.getRightVector();
        const up = new THREE.Vector3(0, 1, 0);

        let moveDirection = new THREE.Vector3();
        const flySpeed = 40;

        if (this.keys['w']) moveDirection.addScaledVector(forward, flySpeed);
        if (this.keys['s']) moveDirection.addScaledVector(forward, -flySpeed);
        if (this.keys['a']) moveDirection.addScaledVector(right, -flySpeed);
        if (this.keys['d']) moveDirection.addScaledVector(right, flySpeed);
        if (this.keys[' ']) moveDirection.addScaledVector(up, flySpeed);
        if (this.keys['shift']) moveDirection.addScaledVector(up, -flySpeed);

        this.velocity.copy(moveDirection);
    }

    rayCast(world) {
        const direction = new THREE.Vector3();
        this.camera.getWorldDirection(direction);

        this.raycaster.set(this.camera.position, direction);

        // Create temporary meshes to check intersection
        const blockPositions = [];
        for (let x = -5; x <= 5; x++) {
            for (let y = -5; y <= 5; y++) {
                for (let z = -5; z <= 5; z++) {
                    const blockType = world.getBlockType(
                        Math.floor(this.position.x) + x,
                        Math.floor(this.position.y) + y,
                        Math.floor(this.position.z) + z
                    );
                    if (blockType !== 0 && world.blockTypes[blockType]?.solid) {
                        blockPositions.push({ x: Math.floor(this.position.x) + x, y: Math.floor(this.position.y) + y, z: Math.floor(this.position.z) + z });
                    }
                }
            }
        }

        let closest = null;
        let closestDist = this.raycaster.far;

        for (const pos of blockPositions) {
            const bbox = new THREE.Box3(
                new THREE.Vector3(pos.x, pos.y, pos.z),
                new THREE.Vector3(pos.x + 1, pos.y + 1, pos.z + 1)
            );

            const intersect = this.raycaster.ray.intersectBox(bbox, new THREE.Vector3());
            if (intersect) {
                const dist = this.raycaster.ray.origin.distanceTo(intersect);
                if (dist < closestDist) {
                    closestDist = dist;
                    closest = { pos, point: intersect };
                }
            }
        }

        this.blockTarget = closest;
    }

    handleBlockInteraction(world, particles, audio) {
        this.rayCast(world);

        if (!this.blockTarget) return;

        const pos = this.blockTarget.pos;
        const blockType = world.getBlockType(pos.x, pos.y, pos.z);
        const blockColor = world.blockTypes[blockType]?.color || 0xffffff;

        if (this.mouseDown.left) {
            // Destroy block
            world.setBlockType(pos.x, pos.y, pos.z, 0);
            if (particles) particles.createBlockDestructionParticles(pos.x, pos.y, pos.z, blockColor);
            if (audio) audio.playBlockBreak();
            this.mouseDown.left = false;
        }

        if (this.mouseDown.right) {
            // Place block
            const point = this.blockTarget.point;
            const normal = new THREE.Vector3();

            // Determine which face was hit
            const dx = Math.abs(point.x - (pos.x + 0.5)) - 0.5;
            const dy = Math.abs(point.y - (pos.y + 0.5)) - 0.5;
            const dz = Math.abs(point.z - (pos.z + 0.5)) - 0.5;

            if (dx > dy && dx > dz) normal.x = point.x > pos.x + 0.5 ? 1 : -1;
            else if (dy > dz) normal.y = point.y > pos.y + 0.5 ? 1 : -1;
            else normal.z = point.z > pos.z + 0.5 ? 1 : -1;

            const newX = pos.x + normal.x;
            const newY = pos.y + normal.y;
            const newZ = pos.z + normal.z;

            // Check collision with player
            if (!(Math.abs(newX - this.position.x) < 1 && Math.abs(newY - this.position.y) < 2 && Math.abs(newZ - this.position.z) < 1)) {
                world.setBlockType(newX, newY, newZ, this.selectedBlock);
                if (audio) audio.playBlockPlace();
            }

            this.mouseDown.right = false;
        }
    }

    update(deltaTime) {
        this.handleMovement(deltaTime);

        // Position update
        this.position.add(this.velocity.clone().multiplyScalar(deltaTime));

        // Update camera
        this.updateCamera();
    }
}
