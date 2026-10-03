class InputManager {
    constructor(player, world, physics) {
        this.player = player;
        this.world = world;
        this.physics = physics;

        this.keys = {};
        this.mouseDown = {};

        this.locked = false;
        this.target = null;

        this.setupEventListeners();
    }

    setupEventListeners() {
        document.addEventListener('keydown', (e) => this.onKeyDown(e));
        document.addEventListener('keyup', (e) => this.onKeyUp(e));
        document.addEventListener('mousedown', (e) => this.onMouseDown(e));
        document.addEventListener('mouseup', (e) => this.onMouseUp(e));
        document.addEventListener('mousemove', (e) => this.onMouseMove(e));
        document.addEventListener('wheel', (e) => this.onScroll(e));

        document.addEventListener('click', () => {
            document.body.requestPointerLock = document.body.requestPointerLock || document.body.mozRequestPointerLock;
            document.body.requestPointerLock();
        });

        document.addEventListener('pointerlockchange', () => {
            this.locked = document.pointerLockElement === document.body;
        });
    }

    onKeyDown(e) {
        this.keys[e.key.toLowerCase()] = true;

        if (e.key === ' ') {
            e.preventDefault();
            this.player.jump();
        }
    }

    onKeyUp(e) {
        this.keys[e.key.toLowerCase()] = false;
    }

    onMouseDown(e) {
        this.mouseDown[e.button] = true;
    }

    onMouseUp(e) {
        this.mouseDown[e.button] = false;
    }

    onMouseMove(e) {
        if (!this.locked) return;

        const deltaX = e.movementX || e.mozMovementX || 0;
        const deltaY = e.movementY || e.mozMovementY || 0;

        this.player.yaw -= deltaX * CONFIG.MOUSE_SENSITIVITY;
        this.player.pitch -= deltaY * CONFIG.MOUSE_SENSITIVITY;

        this.player.pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.player.pitch));
        this.player.updateCameraTarget();
    }

    onScroll(e) {
        e.preventDefault();

        if (e.deltaY > 0) {
            this.player.setSelectedBlock(this.player.selectedIndex + 1);
        } else {
            this.player.setSelectedBlock(this.player.selectedIndex - 1);
        }
        this.updateHotbar();
    }

    update() {
        const moveDirection = {
            forward: this.keys['w'],
            backward: this.keys['s'],
            left: this.keys['a'],
            right: this.keys['d']
        };

        this.player.isSprinting = this.keys['shift'] && (moveDirection.forward || moveDirection.backward || moveDirection.left || moveDirection.right);
        this.player.isCrouching = this.keys['control'];

        this.player.move(moveDirection, 1/60);

        if (this.mouseDown[0]) {
            this.destroyBlock();
        }
        if (this.mouseDown[2]) {
            this.placeBlock();
        }
    }

    destroyBlock() {
        const raycast = this.physics.raycast(
            this.player.getEyePosition(),
            this.player.getLookDirection(),
            10
        );

        if (raycast) {
            const chunk = this.world.getChunk(raycast.blockCoords.x, raycast.blockCoords.z);
            if (chunk) {
                const localCoords = Utils.getLocalBlockCoords(
                    raycast.blockCoords.x,
                    raycast.blockCoords.y,
                    raycast.blockCoords.z
                );
                chunk.setBlock(localCoords.x, localCoords.y, localCoords.z, BLOCK_TYPES.AIR);
            }
        }
    }

    placeBlock() {
        const raycast = this.physics.raycast(
            this.player.getEyePosition(),
            this.player.getLookDirection(),
            10
        );

        if (raycast) {
            const dir = this.player.getLookDirection();
            const normal = this.getNormal(raycast.position, raycast.blockCoords);

            const newX = raycast.blockCoords.x + normal.x;
            const newY = raycast.blockCoords.y + normal.y;
            const newZ = raycast.blockCoords.z + normal.z;

            if (newY >= 0 && newY < CONFIG.CHUNK_HEIGHT) {
                const chunk = this.world.getChunk(newX, newZ);
                if (chunk) {
                    const localCoords = Utils.getLocalBlockCoords(newX, newY, newZ);
                    const current = chunk.getBlock(localCoords.x, localCoords.y, localCoords.z);

                    if (current === BLOCK_TYPES.AIR) {
                        chunk.setBlock(localCoords.x, localCoords.y, localCoords.z, this.player.selectedBlock);
                    }
                }
            }
        }
    }

    getNormal(position, blockCoords) {
        const dx = position.x - (blockCoords.x + 0.5);
        const dy = position.y - (blockCoords.y + 0.5);
        const dz = position.z - (blockCoords.z + 0.5);

        const absDx = Math.abs(dx);
        const absDy = Math.abs(dy);
        const absDz = Math.abs(dz);

        if (absDx > absDy && absDx > absDz) {
            return dx > 0 ? { x: 1, y: 0, z: 0 } : { x: -1, y: 0, z: 0 };
        } else if (absDy > absDz) {
            return dy > 0 ? { x: 0, y: 1, z: 0 } : { x: 0, y: -1, z: 0 };
        } else {
            return dz > 0 ? { x: 0, y: 0, z: 1 } : { x: 0, y: 0, z: -1 };
        }
    }

    updateHotbar() {
        const hotbar = document.getElementById('hotbar');
        hotbar.innerHTML = '';

        for (let i = 0; i < SELECTABLE_BLOCKS.length; i++) {
            const block = SELECTABLE_BLOCKS[i];
            const slot = document.createElement('div');
            slot.className = 'hotbar-slot';
            if (i === this.player.selectedIndex) {
                slot.classList.add('active');
            }

            const blockName = BLOCK_PROPERTIES[block].name;
            slot.textContent = blockName.substring(0, 2).toUpperCase();
            slot.title = blockName;
            slot.style.cursor = 'pointer';

            slot.addEventListener('click', () => {
                this.player.setSelectedBlock(i);
                this.updateHotbar();
            });

            const number = document.createElement('div');
            number.className = 'hotbar-slot-number';
            number.textContent = i + 1;
            slot.appendChild(number);

            hotbar.appendChild(slot);
        }

        const blockNameEl = document.getElementById('block-name');
        blockNameEl.textContent = BLOCK_PROPERTIES[this.player.selectedBlock].name;
    }
}
