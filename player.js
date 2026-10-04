class Player {
    constructor(world) {
        this.world = world;
        this.position = new THREE.Vector3(0, 100, 0);
        this.velocity = new THREE.Vector3(0, 0, 0);
        this.rotation = new THREE.Euler(0, 0, 0, 'YXZ');
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.01, 1000);
        this.camera.position.copy(this.position);

        this.speed = 0.2;
        this.sprintSpeed = 0.4;
        this.gravity = 0.01;
        this.jumpForce = 0.3;
        this.selectedBlock = BLOCKS.DIRT.id;
        this.selectedIndex = 1;

        this.keys = {};
        this.mouseDown = false;
        this.raycaster = new THREE.Raycaster();
        this.lastBlockCheck = 0;
        this.blockCheckInterval = 100;
        this.highlightedBlock = null;
        this.targetBlock = null;

        this.onGround = false;
        this.isSprinting = false;
        this.playerWidth = 0.6;
        this.playerHeight = 1.8;
        this.playerDepth = 0.6;

        this.setupControls();
    }

    setupControls() {
        document.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;
            if (e.key === ' ') {
                e.preventDefault();
                this.jump();
            }
        });

        document.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
        });

        document.addEventListener('mousemove', (e) => {
            const movementX = e.movementX || e.mozMovementX || e.webkitMovementX || 0;
            const movementY = e.movementY || e.mozMovementY || e.webkitMovementY || 0;

            this.rotation.setFromQuaternion(this.camera.quaternion);
            this.rotation.order = 'YXZ';

            this.rotation.setFromQuaternion(this.camera.quaternion);
            this.rotation.y -= movementX * 0.002;
            this.rotation.x -= movementY * 0.002;

            this.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.rotation.x));

            this.camera.quaternion.setFromEuler(this.rotation);
        });

        document.addEventListener('mousedown', (e) => {
            this.mouseDown = true;
            if (e.button === 0) this.breakBlock();
            if (e.button === 2) this.placeBlock();
        });

        document.addEventListener('mouseup', () => {
            this.mouseDown = false;
        });

        document.addEventListener('wheel', (e) => {
            e.preventDefault();
            if (e.deltaY < 0) {
                this.selectedIndex = (this.selectedIndex - 1 + BLOCK_TYPES.length) % BLOCK_TYPES.length;
            } else {
                this.selectedIndex = (this.selectedIndex + 1) % BLOCK_TYPES.length;
            }
            this.selectedBlock = BLOCK_TYPES[this.selectedIndex].id;
            updateBlockSelector();
        });

        for (let i = 1; i <= 9; i++) {
            document.addEventListener('keydown', (e) => {
                if (e.key === String(i)) {
                    const idx = i - 1;
                    if (idx < BLOCK_TYPES.length) {
                        this.selectedIndex = idx;
                        this.selectedBlock = BLOCK_TYPES[idx].id;
                        updateBlockSelector();
                    }
                }
            });
        }

        document.addEventListener('click', () => {
            document.body.requestPointerLock = document.body.requestPointerLock || document.body.mozRequestPointerLock;
            document.body.requestPointerLock();
        });
    }

    update(scene, world) {
        const moveDirection = new THREE.Vector3(0, 0, 0);
        const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(this.camera.quaternion);
        const right = new THREE.Vector3(1, 0, 0).applyQuaternion(this.camera.quaternion);

        forward.y = 0;
        right.y = 0;
        forward.normalize();
        right.normalize();

        const isInWater = this.isInWater(world);

        this.isSprinting = this.keys['shift'];
        const currentSpeed = this.isSprinting && !isInWater ? this.sprintSpeed : this.speed;

        if (this.keys['w']) moveDirection.add(forward.multiplyScalar(currentSpeed));
        if (this.keys['s']) moveDirection.add(forward.multiplyScalar(-currentSpeed));
        if (this.keys['a']) moveDirection.add(right.multiplyScalar(-currentSpeed));
        if (this.keys['d']) moveDirection.add(right.multiplyScalar(currentSpeed));

        this.velocity.x = moveDirection.x;
        this.velocity.z = moveDirection.z;

        if (isInWater) {
            this.velocity.y = Math.max(-0.15, this.velocity.y - this.gravity * 0.3);
            if (this.keys[' ']) this.velocity.y = 0.2;
        } else {
            this.velocity.y -= this.gravity;
            this.velocity.y = Math.max(-0.5, this.velocity.y);
        }

        const newPos = this.position.clone().add(this.velocity);

        if (!this.isColliding(newPos)) {
            this.position.copy(newPos);
            this.onGround = false;
        } else {
            this.velocity.y = Math.max(0, this.velocity.y);
            this.onGround = true;

            if (!this.isColliding(new THREE.Vector3(newPos.x, this.position.y, this.position.z))) {
                this.position.x = newPos.x;
            }
            if (!this.isColliding(new THREE.Vector3(this.position.x, this.position.y, newPos.z))) {
                this.position.z = newPos.z;
            }
        }

        this.camera.position.copy(this.position);
        this.updateBlockHighlight(scene, world);
    }

    isInWater(world) {
        const centerBlockId = world.getBlock(
            Math.floor(this.position.x),
            Math.floor(this.position.y),
            Math.floor(this.position.z)
        );
        return centerBlockId === BLOCKS.WATER.id;
    }

    isColliding(pos) {
        const hw = this.playerWidth / 2;
        const hh = this.playerHeight / 2;
        const hd = this.playerDepth / 2;

        const corners = [
            [pos.x - hw, pos.y - hh, pos.z - hd],
            [pos.x + hw, pos.y - hh, pos.z - hd],
            [pos.x - hw, pos.y + hh, pos.z - hd],
            [pos.x + hw, pos.y + hh, pos.z - hd],
            [pos.x - hw, pos.y - hh, pos.z + hd],
            [pos.x + hw, pos.y - hh, pos.z + hd],
            [pos.x - hw, pos.y + hh, pos.z + hd],
            [pos.x + hw, pos.y + hh, pos.z + hd],
        ];

        for (let corner of corners) {
            const blockId = this.world.getBlock(Math.floor(corner[0]), Math.floor(corner[1]), Math.floor(corner[2]));
            if (isBlockSolid(blockId)) return true;
        }
        return false;
    }

    jump() {
        if (this.onGround) {
            this.velocity.y = this.jumpForce;
            this.onGround = false;
        }
    }

    updateBlockHighlight(scene, world) {
        if (Date.now() - this.lastBlockCheck < this.blockCheckInterval) return;
        this.lastBlockCheck = Date.now();

        this.raycaster.setFromCamera(new THREE.Vector2(0, 0), this.camera);
        const direction = this.raycaster.ray.direction;

        let target = null;
        for (let distance = 0; distance < 10; distance += 0.1) {
            const point = this.raycaster.ray.origin.clone().add(direction.clone().multiplyScalar(distance));
            const blockId = world.getBlock(Math.floor(point.x), Math.floor(point.y), Math.floor(point.z));
            if (isBlockSolid(blockId)) {
                target = {
                    x: Math.floor(point.x),
                    y: Math.floor(point.y),
                    z: Math.floor(point.z),
                    distance: distance
                };
                break;
            }
        }

        if (target) {
            this.targetBlock = target;
        } else {
            this.targetBlock = null;
        }
    }

    breakBlock() {
        if (this.targetBlock) {
            const blockId = this.world.getBlock(this.targetBlock.x, this.targetBlock.y, this.targetBlock.z);
            this.world.setBlock(this.targetBlock.x, this.targetBlock.y, this.targetBlock.z, BLOCKS.AIR.id);
            game.createParticles(this.targetBlock.x, this.targetBlock.y, this.targetBlock.z, blockId);
        }
    }

    placeBlock() {
        if (this.targetBlock && this.targetBlock.distance > 0.5) {
            const normal = this.getNormalFromBlock(this.targetBlock);
            const newPos = {
                x: this.targetBlock.x + normal.x,
                y: this.targetBlock.y + normal.y,
                z: this.targetBlock.z + normal.z
            };
            this.world.setBlock(newPos.x, newPos.y, newPos.z, this.selectedBlock);
        }
    }

    getNormalFromBlock(block) {
        const raycaster = this.raycaster;
        const direction = raycaster.ray.direction;
        const point = raycaster.ray.origin.clone().add(direction.clone().multiplyScalar(block.distance));

        const dx = point.x - (block.x + 0.5);
        const dy = point.y - (block.y + 0.5);
        const dz = point.z - (block.z + 0.5);

        const abs = [Math.abs(dx), Math.abs(dy), Math.abs(dz)];
        const maxIdx = abs.indexOf(Math.max(...abs));

        const normal = { x: 0, y: 0, z: 0 };
        if (maxIdx === 0) normal.x = dx > 0 ? 1 : -1;
        if (maxIdx === 1) normal.y = dy > 0 ? 1 : -1;
        if (maxIdx === 2) normal.z = dz > 0 ? 1 : -1;

        return normal;
    }
}
