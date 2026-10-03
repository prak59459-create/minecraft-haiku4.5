class Player {
    constructor(scene, camera) {
        this.scene = scene;
        this.camera = camera;

        this.position = new THREE.Vector3(0, 80, 0);
        this.velocity = new THREE.Vector3(0, 0, 0);
        this.acceleration = new THREE.Vector3(0, 0, 0);

        this.camera.position.copy(this.position);

        this.speed = 0.15;
        this.sprintSpeed = 0.25;
        this.jumpForce = 0.6;
        this.gravity = 0.015;
        this.friction = 0.9;
        this.eyeHeight = 0.62;

        this.keys = {};
        this.isJumping = false;
        this.isSprinting = false;
        this.isCrouching = false;
        this.isFlying = false;

        this.direction = new THREE.Vector3();
        this.euler = new THREE.Euler(0, 0, 0, 'YXZ');
        this.quat = new THREE.Quaternion();

        this.mouseX = 0;
        this.mouseY = 0;
        this.minPolarAngle = 0;
        this.maxPolarAngle = Math.PI;
        this.pointerLocked = false;

        this.collisionRadius = 0.3;
        this.collisionHeight = 1.8;

        this.selectedBlockIndex = 0;
        this.selectedBlockType = 3;

        this.setupControls();
        this.setupPointerLock();
    }

    setupControls() {
        document.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;

            if (e.key === ' ') {
                e.preventDefault();
                if (!this.isJumping && !this.isFlying) {
                    this.velocity.y = this.jumpForce;
                    this.isJumping = true;
                }
            }

            if (e.key.toLowerCase() === 'f') {
                this.isFlying = !this.isFlying;
                if (this.isFlying) {
                    this.velocity.y = 0;
                }
            }
        });

        document.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
        });

        document.addEventListener('mousemove', (e) => {
            if (!this.pointerLocked) return;

            this.mouseX += e.movementX * 0.001;
            this.mouseY += e.movementY * 0.001;

            this.mouseY = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.mouseY));
        });

        document.addEventListener('wheel', (e) => {
            e.preventDefault();
            if (e.deltaY < 0) {
                this.selectedBlockIndex = (this.selectedBlockIndex - 1 + 9) % 9;
            } else {
                this.selectedBlockIndex = (this.selectedBlockIndex + 1) % 9;
            }
            this.updateSelectedBlock();
        }, { passive: false });

        document.addEventListener('keydown', (e) => {
            const num = parseInt(e.key);
            if (num >= 1 && num <= 9) {
                this.selectedBlockIndex = num - 1;
                this.updateSelectedBlock();
            }
        });
    }

    setupPointerLock() {
        document.addEventListener('click', () => {
            document.body.requestPointerLock = document.body.requestPointerLock || document.body.mozRequestPointerLock;
            document.body.requestPointerLock();
        });

        document.addEventListener('pointerlockchange', () => {
            this.pointerLocked = document.pointerLockElement === document.body;
            if (this.pointerLocked) {
                document.body.classList.add('locked');
            } else {
                document.body.classList.remove('locked');
            }
        });
    }

    update(world) {
        this.isSprinting = this.keys['shift'] && (this.keys['w'] || this.keys['a'] || this.keys['s'] || this.keys['d']);
        this.isCrouching = this.keys['control'] || this.keys['ctrl'];

        const moveSpeed = this.isSprinting ? this.sprintSpeed : this.speed;

        this.direction.set(0, 0, 0);

        if (this.keys['w']) this.direction.z -= moveSpeed;
        if (this.keys['s']) this.direction.z += moveSpeed;
        if (this.keys['a']) this.direction.x -= moveSpeed;
        if (this.keys['d']) this.direction.x += moveSpeed;

        this.direction.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.mouseX);

        if (this.isFlying) {
            if (this.keys[' ']) this.velocity.y = moveSpeed;
            if (this.keys['shift']) this.velocity.y = -moveSpeed;
            this.velocity.x = this.direction.x;
            this.velocity.z = this.direction.z;
        } else {
            this.velocity.x = this.direction.x;
            this.velocity.z = this.direction.z;
            this.velocity.y -= this.gravity;
            this.velocity.y = Math.max(this.velocity.y, -0.5);
        }

        const newPosition = this.position.clone().add(this.velocity);

        if (world && this.checkCollisions(newPosition, world)) {
            this.position.copy(newPosition);
        } else if (!world) {
            this.position.copy(newPosition);
        }

        this.camera.position.copy(this.position);
        this.camera.position.y += this.eyeHeight;

        this.euler.setFromQuaternion(this.camera.quaternion);
        this.euler.order = 'YXZ';
        this.euler.setFromVector3(new THREE.Vector3(this.mouseY, this.mouseX, 0));
        this.camera.quaternion.setFromEuler(this.euler);
    }

    checkCollisions(newPos, world) {
        const checkPoints = [
            newPos,
            newPos.clone().add(new THREE.Vector3(this.collisionRadius, 0, 0)),
            newPos.clone().add(new THREE.Vector3(-this.collisionRadius, 0, 0)),
            newPos.clone().add(new THREE.Vector3(0, 0, this.collisionRadius)),
            newPos.clone().add(new THREE.Vector3(0, 0, -this.collisionRadius)),
            newPos.clone().add(new THREE.Vector3(0, this.collisionHeight / 2, 0))
        ];

        for (const point of checkPoints) {
            const block = world.getBlockAt(point.x, point.y, point.z);
            if (block && block !== 0 && block !== 6) {
                return false;
            }
        }

        return true;
    }

    updateSelectedBlock() {
        const blocks = blockRegistry.getAll();
        if (this.selectedBlockIndex < blocks.length) {
            this.selectedBlockType = blocks[this.selectedBlockIndex].id;
        }
    }

    getRayCastTarget(world, maxDistance = 5) {
        const direction = new THREE.Vector3(0, 0, -1);
        direction.applyQuaternion(this.camera.quaternion);

        const raycaster = new THREE.Raycaster(this.camera.position, direction, 0, maxDistance);

        for (let i = 0; i < maxDistance * 2; i++) {
            const pos = this.camera.position.clone().add(direction.clone().multiplyScalar(i * 0.5));
            const block = world.getBlockAt(pos.x, pos.y, pos.z);

            if (block && block !== 0 && block !== 6) {
                return { position: pos, blockId: block };
            }
        }

        return null;
    }
}
