class Player {
    constructor() {
        this.position = new THREE.Vector3(0, 100, 0);
        this.velocity = new THREE.Vector3(0, 0, 0);
        this.acceleration = new THREE.Vector3(0, 0, 0);

        this.rotation = new THREE.Euler(0, 0, 0, 'YXZ');

        this.speed = 0.15;
        this.sprintSpeed = 0.25;
        this.jumpForce = 0.5;
        this.gravity = 0.02;

        this.keys = {};
        this.isSprinting = false;
        this.isJumping = false;
        this.isGrounded = false;

        this.raycast = null;
        this.selectedBlock = 1;

        this.lastClickTime = 0;
        this.clickCooldown = 200;

        this.setupControls();
    }

    setupControls() {
        document.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;

            if (e.key === ' ') {
                if (this.isGrounded) {
                    this.velocity.y = this.jumpForce;
                    this.isJumping = true;
                    this.isGrounded = false;
                }
                e.preventDefault();
            }
        });

        document.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
        });

        document.addEventListener('mousemove', (e) => {
            if (document.pointerLockElement) {
                this.rotation.setFromQuaternion(new THREE.Quaternion());

                const movementX = e.movementX || 0;
                const movementY = e.movementY || 0;

                this.rotation.setFromVector3(this.rotation.toVector3());
                this.rotation.y -= movementX * 0.005;
                this.rotation.x -= movementY * 0.005;

                this.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.rotation.x));
            }
        });

        document.addEventListener('click', () => {
            if (!document.pointerLockElement) {
                document.documentElement.requestPointerLock();
            } else {
                this.destroyBlock();
            }
        });

        document.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            if (document.pointerLockElement) {
                this.placeBlock();
            }
        });

        document.addEventListener('wheel', (e) => {
            e.preventDefault();
            const direction = e.deltaY > 0 ? 1 : -1;
            this.selectedBlock += direction;

            const maxBlock = Object.keys(BLOCKS).length - 1;
            if (this.selectedBlock < 1) this.selectedBlock = maxBlock;
            if (this.selectedBlock > maxBlock) this.selectedBlock = 1;

            this.updateBlockSelector();
        });

        // Number keys for block selection
        for (let i = 1; i <= 9; i++) {
            document.addEventListener('keydown', (e) => {
                if (e.key === i.toString()) {
                    this.selectedBlock = i;
                    this.updateBlockSelector();
                }
            });
        }
    }

    destroyBlock() {
        if (Date.now() - this.lastClickTime < this.clickCooldown) return;
        this.lastClickTime = Date.now();

        const intersection = this.rayCast(world);
        if (intersection) {
            world.setBlock(
                Math.floor(intersection.x),
                Math.floor(intersection.y),
                Math.floor(intersection.z),
                BLOCKS.AIR
            );
        }
    }

    placeBlock() {
        if (Date.now() - this.lastClickTime < this.clickCooldown) return;
        this.lastClickTime = Date.now();

        const intersection = this.rayCast(world);
        if (intersection) {
            const face = intersection.face;
            let x = Math.floor(intersection.x);
            let y = Math.floor(intersection.y);
            let z = Math.floor(intersection.z);

            // Place block next to the intersected face
            if (face === 'top') y++;
            else if (face === 'bottom') y--;
            else if (face === 'front') z++;
            else if (face === 'back') z--;
            else if (face === 'right') x++;
            else if (face === 'left') x--;

            world.setBlock(x, y, z, this.selectedBlock);
        }
    }

    rayCast(world) {
        const origin = this.position.clone();
        origin.y += 1.6; // Eye height

        const direction = new THREE.Vector3(0, 0, -1).applyEuler(this.rotation);

        const maxDistance = 5;
        const step = 0.1;
        let distance = 0;

        while (distance < maxDistance) {
            const pos = origin.clone().addScaledVector(direction, distance);
            const blockId = world.getBlock(Math.floor(pos.x), Math.floor(pos.y), Math.floor(pos.z));

            if (isBlockSolid(blockId)) {
                // Determine which face was hit
                const blockPos = new THREE.Vector3(Math.floor(pos.x), Math.floor(pos.y), Math.floor(pos.z));
                const relPos = pos.clone().sub(blockPos);

                let face = 'top';
                const dists = {
                    top: 1 - relPos.y,
                    bottom: relPos.y,
                    front: 1 - relPos.z,
                    back: relPos.z,
                    right: 1 - relPos.x,
                    left: relPos.x
                };

                let minDist = Infinity;
                for (const [f, d] of Object.entries(dists)) {
                    if (d > 0 && d < minDist) {
                        minDist = d;
                        face = f;
                    }
                }

                return { x: blockPos.x, y: blockPos.y, z: blockPos.z, face };
            }

            distance += step;
        }

        return null;
    }

    update(world) {
        // Movement
        const moveSpeed = this.keys['shift'] ? this.sprintSpeed : this.speed;
        const forward = new THREE.Vector3(0, 0, -1).applyEuler(this.rotation);
        const right = new THREE.Vector3(1, 0, 0).applyEuler(this.rotation);

        const moveDir = new THREE.Vector3();
        if (this.keys['w']) moveDir.addScaledVector(forward, moveSpeed);
        if (this.keys['s']) moveDir.addScaledVector(forward, -moveSpeed);
        if (this.keys['d']) moveDir.addScaledVector(right, moveSpeed);
        if (this.keys['a']) moveDir.addScaledVector(right, -moveSpeed);

        this.velocity.x = moveDir.x;
        this.velocity.z = moveDir.z;

        // Gravity
        this.velocity.y -= this.gravity;
        this.velocity.y = Math.max(-0.5, this.velocity.y);

        // Collision detection
        const nextPos = this.position.clone().add(this.velocity);

        // Check collision with blocks
        const playerRadius = 0.3;
        const playerHeight = 1.8;

        const checkCollision = (x, y, z) => {
            const blockId = world.getBlock(Math.floor(x), Math.floor(y), Math.floor(z));
            return isBlockSolid(blockId) && !isBlockLiquid(blockId);
        };

        // Vertical collision
        this.isGrounded = false;
        let checkY = nextPos.y;
        if (this.velocity.y < 0) {
            checkY = nextPos.y;
            if (checkCollision(nextPos.x, checkY, nextPos.z)) {
                this.velocity.y = 0;
                this.isGrounded = true;
                this.isJumping = false;
                nextPos.y = Math.ceil(checkY);
            }
        } else if (this.velocity.y > 0) {
            checkY = nextPos.y + playerHeight;
            if (checkCollision(nextPos.x, checkY, nextPos.z)) {
                this.velocity.y = 0;
                nextPos.y = Math.floor(checkY) - playerHeight;
            }
        }

        // Horizontal collision
        const testPositions = [
            [nextPos.x + playerRadius, nextPos.y, nextPos.z],
            [nextPos.x - playerRadius, nextPos.y, nextPos.z],
            [nextPos.x, nextPos.y, nextPos.z + playerRadius],
            [nextPos.x, nextPos.y, nextPos.z - playerRadius],
            [nextPos.x + playerRadius, nextPos.y + playerHeight, nextPos.z],
            [nextPos.x - playerRadius, nextPos.y + playerHeight, nextPos.z],
            [nextPos.x, nextPos.y + playerHeight, nextPos.z + playerRadius],
            [nextPos.x, nextPos.y + playerHeight, nextPos.z - playerRadius]
        ];

        for (const [x, y, z] of testPositions) {
            if (checkCollision(x, y, z)) {
                this.velocity.x = 0;
                this.velocity.z = 0;
                break;
            }
        }

        this.position.copy(nextPos);

        // Load/unload chunks
        const [chunkX, chunkZ] = getChunkCoords(this.position.x, this.position.z);

        for (let x = -RENDER_DISTANCE; x <= RENDER_DISTANCE; x++) {
            for (let z = -RENDER_DISTANCE; z <= RENDER_DISTANCE; z++) {
                const cx = chunkX + x;
                const cz = chunkZ + z;
                const hash = hashChunkCoords(cx, cz);

                if (!world.meshes.has(hash)) {
                    const mesh = world.createChunkMesh(cx, cz);
                    renderer.scene.add(mesh);
                }
            }
        }

        world.cleanup(chunkX, chunkZ);
    }

    updateBlockSelector() {
        const hud = document.getElementById('hud');
        hud.innerHTML = '';

        const maxBlock = Object.keys(BLOCKS).length - 1;
        for (let i = 1; i <= 9; i++) {
            const slot = document.createElement('div');
            slot.className = 'block-slot';
            if (i === this.selectedBlock) slot.classList.add('active');

            const blockId = Math.min(i, maxBlock);
            const blockName = BLOCK_INFO[blockId]?.name || 'air';
            slot.textContent = i;
            slot.title = blockName;

            hud.appendChild(slot);
        }
    }

    getCamera() {
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.copy(this.position);
        camera.position.y += 1.6; // Eye height
        camera.rotation.order = 'YXZ';
        camera.rotation.y = this.rotation.y;
        camera.rotation.x = this.rotation.x;
        return camera;
    }
}
