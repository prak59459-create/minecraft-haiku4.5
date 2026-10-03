class Player {
    constructor(camera, world, physics, particles, audio) {
        this.camera = camera;
        this.world = world;
        this.physics = physics;
        this.particles = particles;
        this.audio = audio;

        this.position = new THREE.Vector3(0, 64, 0);
        this.velocity = new THREE.Vector3(0, 0, 0);
        this.acceleration = new THREE.Vector3(0, 0, 0);

        this.camera.position.copy(this.position);
        this.camera.position.y += 1.7;

        this.pitch = 0;
        this.yaw = 0;

        this.keys = {};
        this.isSprinting = false;
        this.isCrouching = false;
        this.onGround = true;

        this.currentBlock = BLOCK_TYPES.GRASS;

        this.setupControls();
    }

    setupControls() {
        document.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;

            if (e.key === 'p' || e.key === 'P') {
                const help = document.getElementById('help');
                help.classList.toggle('hidden');
            }
        });

        document.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
        });

        document.addEventListener('mousemove', (e) => {
            this.yaw -= e.movementX * MOUSE_SENSITIVITY;
            this.pitch -= e.movementY * MOUSE_SENSITIVITY;
            this.pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.pitch));
        });

        document.addEventListener('click', () => {
            document.body.requestPointerLock();
        });

        document.addEventListener('mousedown', (e) => {
            if (e.button === 0) this.breakBlock();
            if (e.button === 2) this.placeBlock();
        });

        document.addEventListener('contextmenu', (e) => e.preventDefault());

        document.addEventListener('wheel', (e) => {
            e.preventDefault();
            const blockSlots = document.querySelectorAll('.blockSlot');
            const currentIndex = Array.from(blockSlots).findIndex(
                slot => slot.classList.contains('active')
            );

            if (e.deltaY < 0) {
                const newIndex = (currentIndex - 1 + blockSlots.length) % blockSlots.length;
                this.selectBlockSlot(newIndex);
            } else {
                const newIndex = (currentIndex + 1) % blockSlots.length;
                this.selectBlockSlot(newIndex);
            }
        });

        for (let i = 1; i <= 9; i++) {
            document.addEventListener('keydown', (e) => {
                if (e.key === String(i)) {
                    const blockSlots = document.querySelectorAll('.blockSlot');
                    if (i - 1 < blockSlots.length) {
                        this.selectBlockSlot(i - 1);
                    }
                }
            });
        }

        document.querySelectorAll('.blockSlot').forEach((slot, index) => {
            slot.addEventListener('click', () => this.selectBlockSlot(index));
        });
    }

    selectBlockSlot(index) {
        const blockSlots = document.querySelectorAll('.blockSlot');
        blockSlots.forEach(slot => slot.classList.remove('active'));
        blockSlots[index].classList.add('active');

        const blockName = blockSlots[index].dataset.block;
        this.currentBlock = BLOCK_NAMES[blockName] || BLOCK_TYPES.GRASS;
    }

    breakBlock() {
        const direction = new THREE.Vector3(
            Math.sin(this.yaw),
            -Math.sin(this.pitch),
            Math.cos(this.yaw)
        ).normalize();

        const result = this.world.raycast(
            this.camera.position.clone().sub(new THREE.Vector3(0, 1.7, 0)),
            direction,
            6
        );

        if (result.hit) {
            const pos = result.blockPos;
            const blockType = this.world.getBlock(pos.x, pos.y, pos.z);
            this.world.setBlock(pos.x, pos.y, pos.z, BLOCK_TYPES.AIR);

            if (this.particles) {
                const particlePos = new THREE.Vector3(pos.x + 0.5, pos.y + 0.5, pos.z + 0.5);
                this.particles.createBlockBreakParticles(particlePos, blockType);
            }

            if (this.audio) {
                this.audio.playBlockBreakSound();
            }
        }
    }

    placeBlock() {
        const direction = new THREE.Vector3(
            Math.sin(this.yaw),
            -Math.sin(this.pitch),
            Math.cos(this.yaw)
        ).normalize();

        const result = this.world.raycast(
            this.camera.position.clone().sub(new THREE.Vector3(0, 1.7, 0)),
            direction,
            6
        );

        if (result.hit) {
            const pos = result.blockPos;
            const normal = new THREE.Vector3();

            const dx = Math.abs(result.position.x - (pos.x + 0.5));
            const dy = Math.abs(result.position.y - (pos.y + 0.5));
            const dz = Math.abs(result.position.z - (pos.z + 0.5));

            let newX = pos.x, newY = pos.y, newZ = pos.z;

            if (dx > dy && dx > dz) {
                newX = result.position.x > pos.x + 0.5 ? pos.x + 1 : pos.x - 1;
            } else if (dy > dx && dy > dz) {
                newY = result.position.y > pos.y + 0.5 ? pos.y + 1 : pos.y - 1;
            } else {
                newZ = result.position.z > pos.z + 0.5 ? pos.z + 1 : pos.z - 1;
            }

            const placedBlock = this.world.getBlock(newX, newY, newZ);
            if (placedBlock === BLOCK_TYPES.AIR) {
                this.world.setBlock(newX, newY, newZ, this.currentBlock);

                if (this.audio) {
                    this.audio.playBlockPlaceSound();
                }
            }
        }
    }

    update() {
        const forwardVector = new THREE.Vector3(
            Math.sin(this.yaw),
            0,
            Math.cos(this.yaw)
        );

        const rightVector = new THREE.Vector3(
            Math.sin(this.yaw - Math.PI / 2),
            0,
            Math.cos(this.yaw - Math.PI / 2)
        );

        this.acceleration.set(0, 0, 0);

        const speed = this.keys['shift'] ? SPRINT_SPEED : WALK_SPEED;

        if (this.keys['w']) this.acceleration.addScaledVector(forwardVector, speed);
        if (this.keys['s']) this.acceleration.addScaledVector(forwardVector, -speed);
        if (this.keys['a']) this.acceleration.addScaledVector(rightVector, -speed);
        if (this.keys['d']) this.acceleration.addScaledVector(rightVector, speed);

        this.velocity.x = this.acceleration.x;
        this.velocity.z = this.acceleration.z;

        if (this.keys[' '] && this.onGround) {
            this.velocity.y = JUMP_FORCE;
            this.onGround = false;

            if (this.audio) {
                this.audio.playJumpSound();
            }
        }

        this.onGround = this.physics.update(this.position, this.velocity);

        this.camera.position.copy(this.position);
        this.camera.position.y += 1.7;

        this.camera.rotation.order = 'YXZ';
        this.camera.rotation.y = this.yaw;
        this.camera.rotation.x = this.pitch;
    }
}
