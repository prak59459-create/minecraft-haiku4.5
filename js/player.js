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

        this.isInWater = false;
        this.swimSpeed = 5;
        this.waterDrag = 0.85;
        this.blockBreakCooldown = 0;
        this.breakDelay = 0.15;

        this.highlightedBlock = null;
        this.blockOutline = null;
        this.createBlockOutline();

        this.setupControls();
    }

    createBlockOutline() {
        const geometry = new THREE.BoxGeometry(1.01, 1.01, 1.01);
        const material = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            emissive: 0x00ff00,
            emissiveIntensity: 0.3,
            wireframe: false,
            transparent: true,
            opacity: 0.2
        });

        this.blockOutline = new THREE.Mesh(geometry, material);
        this.blockOutline.visible = false;
        game.scene.add(this.blockOutline);
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
        this.blockBreakCooldown -= deltaTime;

        // Check if in water
        this.isInWater = this.checkInWater();

        // Update block highlight
        this.updateBlockHighlight();

        // Movement
        const isSprinting = this.keys['shift'] && !this.isInWater;
        const moveSpeed = this.isInWater ? this.swimSpeed : (isSprinting ? this.sprintSpeed : this.speed);

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

            if (this.isInWater) {
                this.velocity.x = this.direction.x * moveSpeed;
                this.velocity.z = this.direction.z * moveSpeed;
                this.velocity.y = this.direction.y * moveSpeed;
            } else {
                this.velocity.x = this.direction.x * moveSpeed;
                this.velocity.z = this.direction.z * moveSpeed;
            }
        } else {
            const drag = this.isInWater ? this.waterDrag * 0.5 : 0.85;
            this.velocity.x *= drag;
            this.velocity.z *= drag;
        }

        // Gravity and water buoyancy
        if (!this.isOnGround && !this.isInWater) {
            this.velocity.y -= this.gravity * deltaTime;
        } else if (this.isInWater && !this.keys['w'] && !this.keys['s'] && !this.keys['a'] && !this.keys['d']) {
            this.velocity.y *= this.waterDrag;
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

    updateBlockHighlight() {
        const hit = this.raycast();
        if (hit && hit.distance < this.blockDistance) {
            const pos = hit.point;
            const normal = hit.normal;
            const blockPos = new THREE.Vector3(
                Math.round(pos.x - normal.x * 0.1),
                Math.round(pos.y - normal.y * 0.1),
                Math.round(pos.z - normal.z * 0.1)
            );

            this.blockOutline.position.copy(blockPos).add(new THREE.Vector3(0.5, 0.5, 0.5));
            this.blockOutline.visible = true;
        } else {
            this.blockOutline.visible = false;
        }
    }

    checkInWater() {
        const checkPos = this.position.clone();
        checkPos.y += this.eyeHeight * 0.5;
        const block = this.world.getBlock(Math.round(checkPos.x), Math.round(checkPos.y), Math.round(checkPos.z));
        return isBlockLiquid(block);
    }

    handleCollisions() {
        const radius = this.playerRadius;

        // Check vertical collisions (ground/ceiling)
        const groundCheckRadius = 0.2;
        let groundCollided = false;

        for (let dx = -groundCheckRadius; dx <= groundCheckRadius; dx += groundCheckRadius) {
            for (let dz = -groundCheckRadius; dz <= groundCheckRadius; dz += groundCheckRadius) {
                const checkX = Math.round(this.position.x + dx);
                const checkZ = Math.round(this.position.z + dz);

                // Check block below
                const blockBelow = this.world.getBlock(checkX, Math.floor(this.position.y - 0.01), checkZ);
                if (isBlockSolid(blockBelow) && !groundCollided) {
                    this.isOnGround = true;
                    this.velocity.y = Math.max(0, this.velocity.y);
                    this.position.y = Math.floor(this.position.y) + 0.5;
                    groundCollided = true;
                }

                // Check block above
                const blockAbove = this.world.getBlock(checkX, Math.ceil(this.position.y + this.playerHeight), checkZ);
                if (isBlockSolid(blockAbove) && this.velocity.y > 0) {
                    this.velocity.y = 0;
                }
            }
        }

        // Check horizontal collisions
        const horizontalCheckHeight = [0.3, 0.8, 1.2];

        for (let height of horizontalCheckHeight) {
            const checkY = this.position.y + height;

            // Check X axis
            for (let dz = -radius; dz <= radius; dz += radius) {
                const checkZ = Math.round(this.position.z + dz);

                if (this.velocity.x > 0) {
                    const block = this.world.getBlock(Math.ceil(this.position.x + radius), Math.round(checkY), checkZ);
                    if (isBlockSolid(block)) {
                        this.position.x = Math.floor(this.position.x) + (1 - radius);
                        this.velocity.x = 0;
                    }
                } else if (this.velocity.x < 0) {
                    const block = this.world.getBlock(Math.floor(this.position.x - radius), Math.round(checkY), checkZ);
                    if (isBlockSolid(block)) {
                        this.position.x = Math.ceil(this.position.x) + radius;
                        this.velocity.x = 0;
                    }
                }
            }

            // Check Z axis
            for (let dx = -radius; dx <= radius; dx += radius) {
                const checkX = Math.round(this.position.x + dx);

                if (this.velocity.z > 0) {
                    const block = this.world.getBlock(checkX, Math.round(checkY), Math.ceil(this.position.z + radius));
                    if (isBlockSolid(block)) {
                        this.position.z = Math.floor(this.position.z) + (1 - radius);
                        this.velocity.z = 0;
                    }
                } else if (this.velocity.z < 0) {
                    const block = this.world.getBlock(checkX, Math.round(checkY), Math.floor(this.position.z - radius));
                    if (isBlockSolid(block)) {
                        this.position.z = Math.ceil(this.position.z) + radius;
                        this.velocity.z = 0;
                    }
                }
            }
        }
    }
}
