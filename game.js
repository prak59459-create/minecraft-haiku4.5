class MinecraftGame {
    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFShadowShadowMap;
        document.body.appendChild(this.renderer.domElement);

        this.blockTypes = {
            empty: 0,
            grass: 1,
            dirt: 2,
            stone: 3,
            wood: 4,
            leaves: 5,
            water: 6,
            sand: 7,
            gravel: 8,
            cobblestone: 9
        };

        this.blockColors = {
            0: 0x87ceeb,
            1: 0x2d8a2d,
            2: 0x8b6914,
            3: 0x808080,
            4: 0x6b4423,
            5: 0x228b22,
            6: 0x4169e1,
            7: 0xc2b280,
            8: 0xa9a9a9,
            9: 0x696969
        };

        this.terrainNoise = new SimplexNoise();
        this.chunks = new Map();
        this.chunkSize = 16;
        this.chunkHeight = 64;
        this.renderDistance = 3;

        this.player = {
            pos: new THREE.Vector3(0, 50, 0),
            vel: new THREE.Vector3(0, 0, 0),
            speed: 0.2,
            sprintSpeed: 0.35,
            jumpPower: 0.5,
            isGrounded: false,
            canJump: true,
            inventory: [1, 2, 3, 4, 5, 6, 7, 8, 9],
            selectedSlot: 0,
            height: 1.8,
            eyeHeight: 1.6
        };

        this.keys = {};
        this.mouse = { x: 0, y: 0, leftDown: false, rightDown: false };
        this.raycaster = new THREE.Raycaster();
        this.raycasterFrom = new THREE.Vector3();

        this.dayTime = 0;
        this.dayDuration = 20000;
        this.skyColor = new THREE.Color(0x87ceeb);
        this.ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(this.ambientLight);

        this.sun = new THREE.DirectionalLight(0xffffff, 0.8);
        this.sun.position.set(100, 100, 100);
        this.sun.castShadow = true;
        this.sun.shadow.mapSize.width = 2048;
        this.sun.shadow.mapSize.height = 2048;
        this.sun.shadow.camera.far = 500;
        this.sun.shadow.camera.left = -200;
        this.sun.shadow.camera.right = 200;
        this.sun.shadow.camera.top = 200;
        this.sun.shadow.camera.bottom = -200;
        this.scene.add(this.sun);

        this.setupControls();
        this.setupUI();
        this.generateInitialChunks();
        this.animate();
    }

    setupControls() {
        document.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;
            if (e.key >= '1' && e.key <= '9') {
                this.player.selectedSlot = parseInt(e.key) - 1;
                this.updateBlockSelector();
            }
        });

        document.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
        });

        document.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;

            const deltaX = e.movementX * 0.003;
            const deltaY = e.movementY * 0.003;

            this.camera.rotation.order = 'YXZ';
            this.camera.rotation.y -= deltaX;
            this.camera.rotation.x -= deltaY;

            if (this.camera.rotation.x > Math.PI / 2) this.camera.rotation.x = Math.PI / 2;
            if (this.camera.rotation.x < -Math.PI / 2) this.camera.rotation.x = -Math.PI / 2;
        });

        document.addEventListener('click', () => {
            this.renderer.domElement.requestPointerLock = this.renderer.domElement.requestPointerLock ||
                                                          this.renderer.domElement.mozRequestPointerLock;
            this.renderer.domElement.requestPointerLock();
        });

        document.addEventListener('mousedown', (e) => {
            if (e.button === 0) this.mouse.leftDown = true;
            if (e.button === 2) this.mouse.rightDown = true;
        });

        document.addEventListener('mouseup', (e) => {
            if (e.button === 0) this.mouse.leftDown = false;
            if (e.button === 2) this.mouse.rightDown = false;
        });

        document.addEventListener('wheel', (e) => {
            e.preventDefault();
            this.player.selectedSlot = (this.player.selectedSlot + (e.deltaY > 0 ? 1 : -1)) % 9;
            if (this.player.selectedSlot < 0) this.player.selectedSlot = 8;
            this.updateBlockSelector();
        });

        document.addEventListener('contextmenu', (e) => e.preventDefault());
    }

    setupUI() {
        const selector = document.getElementById('blockSelector');
        for (let i = 0; i < 9; i++) {
            const slot = document.createElement('div');
            slot.className = 'blockSlot';
            slot.textContent = i + 1;
            slot.style.backgroundColor = this.getBlockColor(this.player.inventory[i]);
            selector.appendChild(slot);
        }
        this.updateBlockSelector();
    }

    updateBlockSelector() {
        const slots = document.querySelectorAll('.blockSlot');
        slots.forEach((slot, i) => {
            slot.classList.toggle('active', i === this.player.selectedSlot);
        });
    }

    getBlockColor(blockType) {
        const color = this.blockColors[blockType];
        const r = (color >> 16) & 255;
        const g = (color >> 8) & 255;
        const b = color & 255;
        return `rgba(${r}, ${g}, ${b}, 0.7)`;
    }

    generateTerrainChunk(chunkX, chunkZ) {
        const chunkKey = `${chunkX},${chunkZ}`;
        if (this.chunks.has(chunkKey)) return;

        const chunk = new THREE.Group();
        chunk.userData = { chunkX, chunkZ };

        const geometry = new THREE.BufferGeometry();
        const positions = [];
        const colors = [];
        const indices = [];
        let vertexIndex = 0;

        for (let x = 0; x < this.chunkSize; x++) {
            for (let z = 0; z < this.chunkSize; z++) {
                const worldX = chunkX * this.chunkSize + x;
                const worldZ = chunkZ * this.chunkSize + z;

                const height = this.getTerrainHeight(worldX, worldZ);

                for (let y = 0; y < height; y++) {
                    const blockType = this.getBlockType(y, height);
                    if (blockType === this.blockTypes.empty) continue;

                    this.addBlockToGeometry(positions, colors, indices, vertexIndex,
                                           x, y, z, blockType, worldX, worldZ);
                    vertexIndex += 24;
                }
            }
        }

        if (positions.length > 0) {
            geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3));
            geometry.setAttribute('color', new THREE.BufferAttribute(new Uint8Array(colors), 3, true));
            geometry.setIndex(new THREE.BufferAttribute(new Uint32Array(indices), 1));

            const material = new THREE.MeshLambertMaterial({
                vertexColors: true,
                flatShading: true,
                side: THREE.FrontSide
            });

            const mesh = new THREE.Mesh(geometry, material);
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            chunk.add(mesh);
        }

        this.chunks.set(chunkKey, chunk);
        this.scene.add(chunk);
    }

    getTerrainHeight(x, z) {
        const scale = 0.05;
        const n1 = this.terrainNoise.noise2D(x * scale, z * scale) * 10 + 20;
        const n2 = this.terrainNoise.noise2D(x * scale * 0.5, z * scale * 0.5) * 15 + 30;
        const height = Math.floor((n1 + n2) * 0.5) + 40;
        return Math.max(10, Math.min(height, 60));
    }

    getBlockType(y, height) {
        if (y === height - 1) return this.blockTypes.grass;
        if (y > height - 4) return this.blockTypes.dirt;
        if (y > 10) return this.blockTypes.stone;
        return this.blockTypes.water;
    }

    addBlockToGeometry(positions, colors, indices, vertexIndex, x, y, z, blockType, worldX, worldZ) {
        const size = 1;
        const color = this.blockColors[blockType];
        const r = (color >> 16) & 255;
        const g = (color >> 8) & 255;
        const b = color & 255;

        const vertices = [
            [x, y, z], [x + size, y, z], [x + size, y + size, z], [x, y + size, z],
            [x, y, z + size], [x + size, y, z + size], [x + size, y + size, z + size], [x, y + size, z + size]
        ];

        const faces = [
            [0, 1, 2, 3], [5, 4, 7, 6], [4, 0, 3, 7], [1, 5, 6, 2],
            [4, 5, 1, 0], [3, 2, 6, 7]
        ];

        for (const face of faces) {
            const [a, b, c, d] = face;
            positions.push(...vertices[a], ...vertices[b], ...vertices[c], ...vertices[d]);
            for (let i = 0; i < 4; i++) colors.push(r, g, b);

            indices.push(
                vertexIndex, vertexIndex + 1, vertexIndex + 2,
                vertexIndex, vertexIndex + 2, vertexIndex + 3
            );
            vertexIndex += 4;
        }
    }

    generateInitialChunks() {
        const centerChunkX = Math.floor(this.player.pos.x / this.chunkSize);
        const centerChunkZ = Math.floor(this.player.pos.z / this.chunkSize);

        for (let cx = centerChunkX - this.renderDistance; cx <= centerChunkX + this.renderDistance; cx++) {
            for (let cz = centerChunkZ - this.renderDistance; cz <= centerChunkZ + this.renderDistance; cz++) {
                this.generateTerrainChunk(cx, cz);
            }
        }
    }

    updateChunks() {
        const centerChunkX = Math.floor(this.player.pos.x / this.chunkSize);
        const centerChunkZ = Math.floor(this.player.pos.z / this.chunkSize);

        for (let cx = centerChunkX - this.renderDistance; cx <= centerChunkX + this.renderDistance; cx++) {
            for (let cz = centerChunkZ - this.renderDistance; cz <= centerChunkZ + this.renderDistance; cz++) {
                this.generateTerrainChunk(cx, cz);
            }
        }

        const chunksToRemove = [];
        for (const [key, chunk] of this.chunks) {
            const dist = Math.max(
                Math.abs(chunk.userData.chunkX - centerChunkX),
                Math.abs(chunk.userData.chunkZ - centerChunkZ)
            );
            if (dist > this.renderDistance + 1) {
                chunksToRemove.push(key);
            }
        }

        for (const key of chunksToRemove) {
            const chunk = this.chunks.get(key);
            this.scene.remove(chunk);
            chunk.traverse(child => {
                if (child.geometry) child.geometry.dispose();
                if (child.material) child.material.dispose();
            });
            this.chunks.delete(key);
        }
    }

    updatePlayer() {
        const moveDir = new THREE.Vector3();
        const speed = this.keys['shift'] ? this.player.sprintSpeed : this.player.speed;

        if (this.keys['w']) moveDir.z += 1;
        if (this.keys['s']) moveDir.z -= 1;
        if (this.keys['a']) moveDir.x -= 1;
        if (this.keys['d']) moveDir.x += 1;

        if (moveDir.length() > 0) {
            moveDir.normalize();
            const forward = new THREE.Vector3();
            this.camera.getWorldDirection(forward);
            forward.y = 0;
            forward.normalize();

            const right = new THREE.Vector3();
            right.crossVectors(this.camera.up, forward);

            const movement = new THREE.Vector3();
            movement.addScaledVector(forward, moveDir.z * speed);
            movement.addScaledVector(right, moveDir.x * speed);

            this.player.pos.add(movement);
        }

        this.player.vel.y -= 0.02;
        this.player.pos.add(this.player.vel);

        if (this.isPlayerGrounded()) {
            this.player.isGrounded = true;
            this.player.vel.y = 0;
            this.player.canJump = true;

            if (this.keys[' '] && this.player.canJump) {
                this.player.vel.y = this.player.jumpPower;
                this.player.canJump = false;
            }
        } else {
            this.player.isGrounded = false;
        }

        this.camera.position.copy(this.player.pos);
        this.camera.position.y += this.player.eyeHeight;
    }

    isPlayerGrounded() {
        const checkPos = this.player.pos.clone();
        checkPos.y -= 0.1;
        return this.getBlockAtPos(checkPos) !== this.blockTypes.empty;
    }

    getBlockAtPos(pos) {
        const x = Math.floor(pos.x);
        const y = Math.floor(pos.y);
        const z = Math.floor(pos.z);

        if (y < 0 || y >= this.chunkHeight) return this.blockTypes.stone;

        const chunkX = Math.floor(x / this.chunkSize);
        const chunkZ = Math.floor(z / this.chunkSize);
        const localX = x - chunkX * this.chunkSize;
        const localZ = z - chunkZ * this.chunkSize;

        const chunkKey = `${chunkX},${chunkZ}`;
        if (!this.chunks.has(chunkKey)) return this.blockTypes.empty;

        const height = this.getTerrainHeight(x, z);
        return y < height ? this.getBlockType(y, height) : this.blockTypes.empty;
    }

    handleInteraction() {
        if (!this.mouse.leftDown && !this.mouse.rightDown) return;

        const camera = this.camera;
        const direction = new THREE.Vector3();
        camera.getWorldDirection(direction);

        const maxDistance = 5;
        let hitBlock = null;

        for (let dist = 0.1; dist < maxDistance; dist += 0.1) {
            const checkPos = camera.position.clone();
            checkPos.addScaledVector(direction, dist);

            const blockType = this.getBlockAtPos(checkPos);
            if (blockType !== this.blockTypes.empty) {
                hitBlock = {
                    pos: new THREE.Vector3(
                        Math.floor(checkPos.x),
                        Math.floor(checkPos.y),
                        Math.floor(checkPos.z)
                    ),
                    dist: dist
                };
                break;
            }
        }

        if (hitBlock && this.mouse.leftDown) {
            this.removeBlock(hitBlock.pos);
            this.mouse.leftDown = false;
        }

        if (hitBlock && this.mouse.rightDown) {
            const placePos = camera.position.clone();
            placePos.addScaledVector(direction, hitBlock.dist - 0.1);
            this.placeBlock(
                new THREE.Vector3(
                    Math.round(placePos.x),
                    Math.round(placePos.y),
                    Math.round(placePos.z)
                )
            );
            this.mouse.rightDown = false;
        }
    }

    removeBlock(pos) {
        const chunkX = Math.floor(pos.x / this.chunkSize);
        const chunkZ = Math.floor(pos.z / this.chunkSize);
        const chunkKey = `${chunkX},${chunkZ}`;

        if (this.chunks.has(chunkKey)) {
            this.regenerateChunk(chunkX, chunkZ);
        }
    }

    placeBlock(pos) {
        const blockType = this.player.inventory[this.player.selectedSlot];
        const chunkX = Math.floor(pos.x / this.chunkSize);
        const chunkZ = Math.floor(pos.z / this.chunkSize);

        if (this.chunks.has(`${chunkX},${chunkZ}`)) {
            this.regenerateChunk(chunkX, chunkZ);
        }
    }

    regenerateChunk(chunkX, chunkZ) {
        const chunkKey = `${chunkX},${chunkZ}`;
        if (this.chunks.has(chunkKey)) {
            const chunk = this.chunks.get(chunkKey);
            this.scene.remove(chunk);
            chunk.traverse(child => {
                if (child.geometry) child.geometry.dispose();
                if (child.material) child.material.dispose();
            });
            this.chunks.delete(chunkKey);
        }
        this.generateTerrainChunk(chunkX, chunkZ);
    }

    updateDayNight() {
        this.dayTime = (this.dayTime + 1) % this.dayDuration;
        const progress = this.dayTime / this.dayDuration;
        const sunAngle = progress * Math.PI * 2 - Math.PI / 2;

        this.sun.position.set(
            Math.cos(sunAngle) * 150,
            Math.sin(sunAngle) * 150 + 50,
            100
        );

        const intensity = Math.max(0.2, Math.sin(sunAngle) * 0.8 + 0.5);
        this.sun.intensity = intensity;
        this.ambientLight.intensity = Math.max(0.3, intensity * 0.7);

        const hour = Math.floor((progress * 24)) % 24;
        const minute = Math.floor((progress * 24 * 60) % 60);
        document.getElementById('timeValue').textContent =
            `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;

        const r = Math.min(1, Math.max(0.2, Math.sin(sunAngle) * 0.5 + 0.5));
        const g = Math.min(1, Math.max(0.4, Math.sin(sunAngle) * 0.4 + 0.6));
        const b = Math.min(1, Math.max(0.6, Math.sin(sunAngle) * 0.3 + 0.8));
        this.skyColor.setRGB(r, g, b);
        this.scene.background = this.skyColor;
    }

    updateUI() {
        document.getElementById('posX').textContent = this.player.pos.x.toFixed(1);
        document.getElementById('posY').textContent = this.player.pos.y.toFixed(1);
        document.getElementById('posZ').textContent = this.player.pos.z.toFixed(1);
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        this.updatePlayer();
        this.updateChunks();
        this.handleInteraction();
        this.updateDayNight();
        this.updateUI();

        this.renderer.render(this.scene, this.camera);
    }
}

window.addEventListener('load', () => {
    new MinecraftGame();
});

window.addEventListener('resize', () => {
    if (window.minecraftGame) {
        window.minecraftGame.camera.aspect = window.innerWidth / window.innerHeight;
        window.minecraftGame.camera.updateProjectionMatrix();
        window.minecraftGame.renderer.setSize(window.innerWidth, window.innerHeight);
    }
});
