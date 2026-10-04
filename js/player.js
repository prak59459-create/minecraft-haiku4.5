class Player {
    constructor(camera, world) {
        this.camera = camera;
        this.world = world;
        this.position = new THREE.Vector3(0, 100, 0);
        this.velocity = new THREE.Vector3(0, 0, 0);

        this.keys = {};
        this.direction = new THREE.Vector3();
        this.rightVector = new THREE.Vector3();

        this.speed = 8;
        this.sprintSpeed = 13;
        this.jumpForce = 12;
        this.gravity = 26;
        this.isOnGround = false;

        this.playerHeight = 1.6;
        this.playerRadius = 0.3;
        this.eyeHeight = 1.5;

        this.deltaTime = 0;
        this.raycaster = new THREE.Raycaster();
        this.rayOrigin = new THREE.Vector3();
        this.rayDirection = new THREE.Vector3();
        this.selectedBlockType = 1;
        this.blockDistance = 6;

        this.setupControls();
    }

    setupControls() {
        document.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;

            if (e.key === ' ') {
                e.preventDefault();
                if (this.isOnGround) {
                    this.velocity.y = this.jumpForce;
                    this.isOnGround = false;
                }
            }
        });

        document.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
        });

        document.addEventListener('mousemove', (e) => {
            if (document.pointerLockElement === document.body) {
                this.camera.rotation.order = 'YXZ';
                this.camera.rotation.y -= e.movementX * 0.003;
                this.camera.rotation.x -= e.movementY * 0.003;
                this.camera.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.camera.rotation.x));
            }
        });

        document.addEventListener('click', () => {
            if (document.pointerLockElement !== document.body) {
                document.body.requestPointerLock();
            }
        });

        document.addEventListener('mousedown', (e) => {
            if (e.button === 0) { // Left click
                this.breakBlock();
            } else if (e.button === 2) { // Right click
                this.placeBlock();
            }
        });

        document.addEventListener('contextmenu', (e) => e.preventDefault());

        document.addEventListener('wheel', (e) => {
            e.preventDefault();
            this.selectedBlockType += e.deltaY > 0 ? 1 : -1;
            this.selectedBlockType = Math.max(1, Math.min(9, this.selectedBlockType));
            this.updateHotbar();
        });

        document.addEventListener('keydown', (e) => {
            const key = parseInt(e.key);
            if (key >= 1 && key <= 9) {
                this.selectedBlockType = key;
                this.updateHotbar();
            }
        });
    }

    updateHotbar() {
        document.querySelectorAll('.hotbar-slot').forEach((slot, idx) => {
            slot.classList.remove('selected');
            const blockNum = parseInt(slot.getAttribute('data-block'));
            if (blockNum === this.selectedBlockType) {
                slot.classList.add('selected');
                slot.textContent = BLOCKS[blockNum]?.name || 'Block';
            } else {
                slot.textContent = BLOCKS[blockNum]?.name.substring(0, 1) || '';
            }
        });
    }

    breakBlock() {
        const hit = this.raycast();
        if (hit) {
            const pos = hit.point;
            const normal = hit.normal;
            const blockPos = new THREE.Vector3(
                Math.round(pos.x - normal.x * 0.1),
                Math.round(pos.y - normal.y * 0.1),
                Math.round(pos.z - normal.z * 0.1)
            );

            const blockType = this.world.getBlock(blockPos.x, blockPos.y, blockPos.z);
            if (blockType !== 0) {
                this.world.setBlock(blockPos.x, blockPos.y, blockPos.z, 0);
                game.particles.createBlockBreakParticles(new THREE.Vector3(blockPos.x + 0.5, blockPos.y + 0.5, blockPos.z + 0.5), blockType);
            }
        }
    }

    placeBlock() {
        const hit = this.raycast();
        if (hit) {
            const pos = hit.point;
            const normal = hit.normal;
            const blockPos = new THREE.Vector3(
                Math.round(pos.x + normal.x * 0.6),
                Math.round(pos.y + normal.y * 0.6),
                Math.round(pos.z + normal.z * 0.6)
            );

            // Check collision with player
            const dist = this.position.distanceTo(blockPos);
            if (dist < 2) return;

            this.world.setBlock(blockPos.x, blockPos.y, blockPos.z, this.selectedBlockType);
        }
    }

    raycast() {
        this.rayOrigin.copy(this.camera.position);
        this.camera.getWorldDirection(this.rayDirection);

        const ray = new THREE.Ray(this.rayOrigin, this.rayDirection);
        let closestHit = null;
        let closestDist = Infinity;

        for (let mesh of game.world.meshes.children) {
            const intersects = ray.intersectObject(mesh, false);
            if (intersects.length > 0) {
                for (let intersection of intersects) {
                    if (intersection.distance < this.blockDistance && intersection.distance < closestDist) {
                        closestDist = intersection.distance;
                        closestHit = intersection;
                    }
                }
            }
        }

        return closestHit;
    }

    update(deltaTime) {
        this.deltaTime = deltaTime;

        // Movement
        const isSprinting = this.keys['shift'];
        const moveSpeed = isSprinting ? this.sprintSpeed : this.speed;

        this.direction.set(0, 0, 0);
        if (this.keys['w']) this.direction.z -= 1;
        if (this.keys['s']) this.direction.z += 1;
        if (this.keys['a']) this.direction.x -= 1;
        if (this.keys['d']) this.direction.x += 1;

        if (this.direction.length() > 0) {
            this.direction.normalize();

            // Rotate direction based on camera rotation
            const cameraDirection = new THREE.Euler(0, this.camera.rotation.y, 0);
            const rotationMatrix = new THREE.Matrix4().makeRotationFromEuler(cameraDirection);
            this.direction.applyMatrix4(rotationMatrix);

            this.velocity.x = this.direction.x * moveSpeed;
            this.velocity.z = this.direction.z * moveSpeed;
        } else {
            this.velocity.x *= 0.85;
            this.velocity.z *= 0.85;
        }

        // Gravity
        if (!this.isOnGround) {
            this.velocity.y -= this.gravity * deltaTime;
        }

        // Collision detection
        this.position.add(this.velocity.clone().multiplyScalar(deltaTime));
        this.isOnGround = false;

        // Check block collisions
        this.handleCollisions();

        // Update camera position
        this.camera.position.copy(this.position);
        this.camera.position.y += this.eyeHeight;

        // Clamp to world bounds
        if (this.position.y < 0) {
            this.position.y = 100;
            this.velocity.y = 0;
        }
    }

    handleCollisions() {
        const checkRadius = this.playerRadius;
        const checkPoints = [
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(checkRadius, 0, 0),
            new THREE.Vector3(-checkRadius, 0, 0),
            new THREE.Vector3(0, 0, checkRadius),
            new THREE.Vector3(0, 0, -checkRadius),
            new THREE.Vector3(checkRadius, 0, checkRadius),
            new THREE.Vector3(-checkRadius, 0, checkRadius),
            new THREE.Vector3(checkRadius, 0, -checkRadius),
            new THREE.Vector3(-checkRadius, 0, -checkRadius),
        ];

        // Check ground
        for (let point of checkPoints) {
            const checkPos = this.position.clone().add(point);
            const blockBelow = this.world.getBlock(
                Math.round(checkPos.x),
                Math.floor(checkPos.y - 0.1),
                Math.round(checkPos.z)
            );
            if (isBlockSolid(blockBelow)) {
                this.isOnGround = true;
                this.velocity.y = 0;
                this.position.y = Math.floor(checkPos.y) + 1;
                break;
            }
        }

        // Check head collision
        for (let point of checkPoints) {
            const checkPos = this.position.clone().add(point);
            const blockAbove = this.world.getBlock(
                Math.round(checkPos.x),
                Math.ceil(checkPos.y + this.playerHeight),
                Math.round(checkPos.z)
            );
            if (isBlockSolid(blockAbove) && this.velocity.y > 0) {
                this.velocity.y = 0;
            }
        }

        // Check horizontal collisions
        for (let point of checkPoints) {
            const checkPos = this.position.clone().add(point);
            checkPos.y += 0.5;

            const blockX = this.world.getBlock(
                Math.round(checkPos.x),
                Math.round(checkPos.y),
                Math.round(checkPos.z)
            );
            if (isBlockSolid(blockX)) {
                this.position.x = Math.round(checkPos.x) === Math.round(this.position.x + point.x) ?
                    Math.floor(this.position.x) + 0.5 : this.position.x;
                this.velocity.x = 0;
            }
        }
    }
}
