const BLOCK_TYPES = {
    AIR: 0,
    GRASS: 1,
    DIRT: 2,
    STONE: 3,
    WOOD: 4,
    LEAVES: 5,
    WATER: 6,
    SAND: 7,
    GRAVEL: 8,
    COBBLESTONE: 9,
    OAK_LOG: 10,
    BIRCH_LOG: 11,
    SPRUCE_LOG: 12
};

const BLOCK_COLORS = {
    [BLOCK_TYPES.GRASS]: 0x7cb342,
    [BLOCK_TYPES.DIRT]: 0x8b7355,
    [BLOCK_TYPES.STONE]: 0x7f8080,
    [BLOCK_TYPES.WOOD]: 0x6d4c41,
    [BLOCK_TYPES.LEAVES]: 0x558b2f,
    [BLOCK_TYPES.WATER]: 0x1976d2,
    [BLOCK_TYPES.SAND]: 0xfdd835,
    [BLOCK_TYPES.GRAVEL]: 0x9e9e9e,
    [BLOCK_TYPES.COBBLESTONE]: 0x6b6b6b,
    [BLOCK_TYPES.OAK_LOG]: 0x5d4a37,
    [BLOCK_TYPES.BIRCH_LOG]: 0x9d8b75,
    [BLOCK_TYPES.SPRUCE_LOG]: 0x4a3728
};

class Game {
    constructor() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, this.width / this.height, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(this.width, this.height);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFShadowShadowMap;
        document.body.appendChild(this.renderer.domElement);

        this.setupScene();
        this.player = new Player(this.camera);
        this.world = new World(this.scene, this.player);
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.selectedBlock = BLOCK_TYPES.STONE;
        this.selectedBlockIndex = 2;

        this.setupEventListeners();
        this.setupUI();
        this.setupAudio();

        this.frameCount = 0;
        this.lastTime = performance.now();

        window.addEventListener('resize', () => this.onWindowResize());

        this.animate();
    }

    setupScene() {
        this.scene.background = new THREE.Color(0x87ceeb);
        this.scene.fog = new THREE.Fog(0x87ceeb, 200, 400);

        this.sunLight = new THREE.DirectionalLight(0xffffff, 0.8);
        this.sunLight.position.set(100, 100, 100);
        this.sunLight.castShadow = true;
        this.sunLight.shadow.mapSize.width = 2048;
        this.sunLight.shadow.mapSize.height = 2048;
        this.sunLight.shadow.camera.far = 500;
        this.sunLight.shadow.camera.left = -200;
        this.sunLight.shadow.camera.right = 200;
        this.sunLight.shadow.camera.top = 200;
        this.sunLight.shadow.camera.bottom = -200;
        this.scene.add(this.sunLight);

        this.ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
        this.scene.add(this.ambientLight);

        this.camera.position.y = 70;
    }

    setupEventListeners() {
        document.addEventListener('mousemove', (e) => {
            this.mouse.x = (e.clientX / this.width) * 2 - 1;
            this.mouse.y = -(e.clientY / this.height) * 2 + 1;
            this.player.updateLook(e.movementX, e.movementY);
        });

        document.addEventListener('click', () => {
            if (!this.world.highlighted) return;

            if (event.button === 0) {
                this.world.destroyBlock(this.world.highlighted);
                this.playSound('break');
            } else if (event.button === 2) {
                this.world.placeBlock(this.world.highlighted, this.selectedBlock);
                this.playSound('place');
            }
        });

        document.addEventListener('mousedown', (e) => {
            if (e.button === 0 || e.button === 2) {
                e.preventDefault();
            }
        });

        document.addEventListener('contextmenu', (e) => e.preventDefault());

        document.addEventListener('keydown', (e) => {
            this.player.keys[e.key.toLowerCase()] = true;

            const num = parseInt(e.key);
            if (num >= 1 && num <= 9) {
                this.selectBlock(num - 1);
            }

            if (e.key === ' ') {
                e.preventDefault();
                this.player.jump();
            }
        });

        document.addEventListener('keyup', (e) => {
            this.player.keys[e.key.toLowerCase()] = false;
        });

        document.addEventListener('wheel', (e) => {
            e.preventDefault();
            this.selectedBlockIndex += e.deltaY > 0 ? 1 : -1;
            this.selectedBlockIndex = Math.max(0, Math.min(8, this.selectedBlockIndex));
            this.selectBlock(this.selectedBlockIndex);
        }, { passive: false });

        document.addEventListener('pointerlockchange', () => {
            if (!document.pointerLockElement) {
                document.addEventListener('click', () => {
                    document.body.requestPointerLock();
                }, { once: true });
            }
        });

        document.body.requestPointerLock();
    }

    setupUI() {
        const blocks = [
            BLOCK_TYPES.STONE, BLOCK_TYPES.DIRT, BLOCK_TYPES.GRASS,
            BLOCK_TYPES.WOOD, BLOCK_TYPES.SAND, BLOCK_TYPES.GRAVEL,
            BLOCK_TYPES.WATER, BLOCK_TYPES.OAK_LOG
        ];

        const hotbar = document.getElementById('hotbar');
        blocks.forEach((block, i) => {
            const slot = document.createElement('div');
            slot.className = 'hotbar-slot';
            if (i === this.selectedBlockIndex) slot.classList.add('active');
            slot.textContent = i + 1;
            slot.style.background = `rgb(${this.hexToRgb(BLOCK_COLORS[block]).join(',')})`;
            slot.addEventListener('click', () => this.selectBlock(i));
            hotbar.appendChild(slot);
        });
    }

    selectBlock(index) {
        const blocks = [
            BLOCK_TYPES.STONE, BLOCK_TYPES.DIRT, BLOCK_TYPES.GRASS,
            BLOCK_TYPES.WOOD, BLOCK_TYPES.SAND, BLOCK_TYPES.GRAVEL,
            BLOCK_TYPES.WATER, BLOCK_TYPES.OAK_LOG
        ];

        this.selectedBlockIndex = index;
        this.selectedBlock = blocks[index];

        document.querySelectorAll('.hotbar-slot').forEach((slot, i) => {
            slot.classList.toggle('active', i === index);
        });
    }

    setupAudio() {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.soundCache = {};
    }

    playSound(type, frequency = 440, duration = 0.1) {
        try {
            const now = this.audioContext.currentTime;
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();

            osc.connect(gain);
            gain.connect(this.audioContext.destination);

            if (type === 'break') {
                osc.frequency.setValueAtTime(200, now);
                osc.frequency.exponentialRampToValueAtTime(100, now + duration);
                gain.gain.setValueAtTime(0.3, now);
            } else if (type === 'place') {
                osc.frequency.setValueAtTime(400, now);
                osc.frequency.exponentialRampToValueAtTime(300, now + duration);
                gain.gain.setValueAtTime(0.3, now);
            } else if (type === 'jump') {
                osc.frequency.setValueAtTime(300, now);
                osc.frequency.exponentialRampToValueAtTime(400, now + duration);
                gain.gain.setValueAtTime(0.2, now);
            }

            gain.gain.exponentialRampToValueAtTime(0.01, now + duration);

            osc.start(now);
            osc.stop(now + duration);
        } catch (e) {
            // Audio playback failed, continue silently
        }
    }

    hexToRgb(hex) {
        const r = (hex >> 16) & 255;
        const g = (hex >> 8) & 255;
        const b = hex & 255;
        return [r, g, b];
    }

    onWindowResize() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.camera.aspect = this.width / this.height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.width, this.height);
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        const now = performance.now();
        const deltaTime = (now - this.lastTime) / 1000;
        this.lastTime = now;

        this.player.update(deltaTime);
        this.camera.position.copy(this.player.position);
        this.camera.position.y += this.player.height;

        this.world.update(this.camera.position);
        this.updateBlockHighlight();
        this.updateLighting();
        this.updateUI();

        this.renderer.render(this.scene, this.camera);

        this.frameCount++;
    }

    updateBlockHighlight() {
        this.raycaster.setFromCamera(this.mouse, this.camera);

        const chunks = Array.from(this.world.chunks.values());
        const meshes = chunks.map(c => c.mesh).filter(m => m);

        const intersects = this.raycaster.intersectObjects(meshes);

        if (this.world.highlightMesh) {
            this.scene.remove(this.world.highlightMesh);
            this.world.highlightMesh = null;
        }

        if (intersects.length > 0) {
            const point = intersects[0].point;
            const pos = new THREE.Vector3(
                Math.floor(point.x),
                Math.floor(point.y),
                Math.floor(point.z)
            );

            const highlighted = this.world.getBlock(pos.x, pos.y, pos.z);
            if (highlighted !== BLOCK_TYPES.AIR) {
                this.world.highlighted = pos;

                const geometry = new THREE.BoxGeometry(1.01, 1.01, 1.01);
                const material = new THREE.MeshBasicMaterial({
                    color: 0xffffff,
                    wireframe: true,
                    transparent: true,
                    opacity: 0.4
                });
                const mesh = new THREE.Mesh(geometry, material);
                mesh.position.copy(pos);
                this.scene.add(mesh);
                this.world.highlightMesh = mesh;
            }
        } else {
            this.world.highlighted = null;
        }
    }

    updateLighting() {
        const time = (performance.now() % 20000) / 20000;
        const angle = time * Math.PI * 2;

        this.sunLight.position.x = Math.cos(angle) * 150;
        this.sunLight.position.y = 80 + Math.sin(angle) * 60;
        this.sunLight.position.z = Math.sin(angle) * 150;

        const sunIntensity = Math.max(0.3, Math.sin(angle) * 0.5 + 0.8);
        this.sunLight.intensity = sunIntensity;
        this.ambientLight.intensity = 0.3 + sunIntensity * 0.3;

        const skyColor = new THREE.Color();
        if (Math.sin(angle) > 0) {
            skyColor.setHSL(0.6, 0.6, 0.5 + Math.sin(angle) * 0.2);
        } else {
            skyColor.setHSL(0.8, 0.2, 0.1);
        }
        this.scene.background = skyColor;
    }

    updateUI() {
        if (this.frameCount % 10 === 0) {
            const now = performance.now();
            const fps = Math.round(1000 / (now - this.lastTime));
            const pos = this.player.position;
            document.getElementById('stats').textContent =
                `FPS: ${fps} | X: ${pos.x.toFixed(1)} Y: ${pos.y.toFixed(1)} Z: ${pos.z.toFixed(1)}`;

            if (this.world.highlighted) {
                const pos = this.world.highlighted;
                const block = this.world.getBlock(pos.x, pos.y, pos.z);
                const blockName = Object.keys(BLOCK_TYPES).find(k => BLOCK_TYPES[k] === block);
                document.getElementById('blockInfo').textContent =
                    `Block: ${blockName} | ${pos.x}, ${pos.y}, ${pos.z}`;
            } else {
                document.getElementById('blockInfo').textContent = 'Block: Air';
            }
        }
    }
}

class Player {
    constructor(camera) {
        this.camera = camera;
        this.position = new THREE.Vector3(0, 100, 0);
        this.velocity = new THREE.Vector3();
        this.direction = new THREE.Vector3();
        this.height = 1.8;
        this.speed = 4.3;
        this.sprintSpeed = 5.6;
        this.sensitivity = 0.003;
        this.jumpForce = 8;
        this.gravity = 20;
        this.isJumping = false;
        this.onGround = false;
        this.keys = {};
        this.euler = new THREE.Euler(0, 0, 0, 'YXZ');
    }

    updateLook(movementX, movementY) {
        this.euler.setFromQuaternion(this.camera.quaternion);
        this.euler.rotateY(-movementX * this.sensitivity);
        this.euler.rotateX(-movementY * this.sensitivity);
        this.euler.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.euler.x));
        this.camera.quaternion.setFromEuler(this.euler);
    }

    jump() {
        if (this.onGround) {
            this.velocity.y = this.jumpForce;
            this.isJumping = true;
            this.onGround = false;
        }
    }

    update(deltaTime) {
        this.direction.set(0, 0, 0);

        const forward = new THREE.Vector3();
        const right = new THREE.Vector3();

        this.camera.getWorldDirection(forward);
        forward.y = 0;
        forward.normalize();

        right.crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize();

        let movementSpeed = this.speed;
        if (this.keys['shift']) movementSpeed = this.sprintSpeed;

        if (this.keys['w']) this.direction.addScaledVector(forward, movementSpeed);
        if (this.keys['s']) this.direction.addScaledVector(forward, -movementSpeed);
        if (this.keys['a']) this.direction.addScaledVector(right, -movementSpeed);
        if (this.keys['d']) this.direction.addScaledVector(right, movementSpeed);

        this.velocity.x = this.direction.x;
        this.velocity.z = this.direction.z;

        const inWater = this.isInWater();
        if (inWater) {
            this.velocity.y *= 0.8;
            this.velocity.y -= this.gravity * deltaTime * 0.3;
            if (this.keys['w'] || this.keys['s'] || this.keys['a'] || this.keys['d']) {
                this.velocity.y += 2;
            }
        } else {
            this.velocity.y -= this.gravity * deltaTime;
        }

        const nextPos = this.position.clone().add(this.velocity.clone().multiplyScalar(deltaTime));

        if (!this.isCollidingWithBlocks(nextPos)) {
            this.position.copy(nextPos);
        } else {
            this.velocity.y = 0;
            this.onGround = true;
            this.isJumping = false;
        }

        if (this.position.y < -50) {
            this.position.y = 100;
            this.velocity.set(0, 0, 0);
        }
    }

    isCollidingWithBlocks(pos) {
        const world = window.game.world;
        const checkPoints = [
            [0, 0, 0],
            [0.3, 0, 0.3], [0.3, 0, -0.3], [-0.3, 0, 0.3], [-0.3, 0, -0.3],
            [0.3, 0.9, 0.3], [0.3, 0.9, -0.3], [-0.3, 0.9, 0.3], [-0.3, 0.9, -0.3],
            [0.3, 1.8, 0.3], [0.3, 1.8, -0.3], [-0.3, 1.8, 0.3], [-0.3, 1.8, -0.3]
        ];

        for (const [dx, dy, dz] of checkPoints) {
            const bx = Math.floor(pos.x + dx);
            const by = Math.floor(pos.y + dy);
            const bz = Math.floor(pos.z + dz);

            const block = world.getBlock(bx, by, bz);
            if (block !== BLOCK_TYPES.AIR && block !== BLOCK_TYPES.WATER) {
                return true;
            }
        }
        return false;
    }

    isInWater() {
        const world = window.game.world;
        const centerBlock = world.getBlock(
            Math.floor(this.position.x),
            Math.floor(this.position.y + this.height * 0.5),
            Math.floor(this.position.z)
        );
        return centerBlock === BLOCK_TYPES.WATER;
    }
}

class World {
    constructor(scene, player) {
        this.scene = scene;
        this.player = player;
        this.chunks = new Map();
        this.chunkSize = 16;
        this.chunkHeight = 128;
        this.blocks = new Map();
        this.noise = new SimplexNoise();
        this.highlighted = null;
        this.highlightMesh = null;
        this.renderDistance = 3;
        this.meshUpdateQueue = [];
    }

    getChunkKey(x, z) {
        return `${x},${z}`;
    }

    getBlockKey(x, y, z) {
        const cx = Math.floor(x / this.chunkSize);
        const cz = Math.floor(z / this.chunkSize);
        const key = `${cx},${cz}`;
        return key;
    }

    getBlock(x, y, z) {
        if (y < 0 || y >= this.chunkHeight) return BLOCK_TYPES.AIR;

        const key = this.getBlockKey(x, z);
        const chunk = this.chunks.get(key);

        if (!chunk) return BLOCK_TYPES.AIR;

        const lx = x - chunk.x * this.chunkSize;
        const lz = z - chunk.z * this.chunkSize;

        if (lx < 0 || lx >= this.chunkSize || lz < 0 || lz >= this.chunkSize) {
            return BLOCK_TYPES.AIR;
        }

        const blockKey = `${x},${y},${z}`;
        if (this.blocks.has(blockKey)) {
            return this.blocks.get(blockKey);
        }

        return chunk.blocks[lx][y][lz];
    }

    setBlock(x, y, z, type) {
        const blockKey = `${x},${y},${z}`;
        if (type === BLOCK_TYPES.AIR) {
            this.blocks.delete(blockKey);
        } else {
            this.blocks.set(blockKey, type);
        }

        const cx = Math.floor(x / this.chunkSize);
        const cz = Math.floor(z / this.chunkSize);
        const key = this.getChunkKey(cx, cz);
        const chunk = this.chunks.get(key);

        if (chunk) {
            chunk.needsUpdate = true;
            if (!this.meshUpdateQueue.includes(chunk)) {
                this.meshUpdateQueue.push(chunk);
            }
        }

        for (let dx = -1; dx <= 1; dx++) {
            for (let dz = -1; dz <= 1; dz++) {
                if (dx === 0 && dz === 0) continue;
                const ncx = cx + dx;
                const ncz = cz + dz;
                const nkey = this.getChunkKey(ncx, ncz);
                const nchunk = this.chunks.get(nkey);
                if (nchunk) {
                    nchunk.needsUpdate = true;
                    if (!this.meshUpdateQueue.includes(nchunk)) {
                        this.meshUpdateQueue.push(nchunk);
                    }
                }
            }
        }
    }

    generateChunk(cx, cz) {
        const blocks = Array(this.chunkSize).fill(null).map(() =>
            Array(this.chunkHeight).fill(null).map(() => Array(this.chunkSize).fill(BLOCK_TYPES.AIR))
        );

        for (let x = 0; x < this.chunkSize; x++) {
            for (let z = 0; z < this.chunkSize; z++) {
                const gx = cx * this.chunkSize + x;
                const gz = cz * this.chunkSize + z;

                const height = this.getTerrainHeight(gx, gz);
                const caveNoise = this.noise.noise3D(gx * 0.1, 30 * 0.1, gz * 0.1);

                for (let y = 0; y < height; y++) {
                    const caveFactor = this.noise.noise3D(gx * 0.05, y * 0.05, gz * 0.05);
                    if (Math.abs(caveFactor) > 0.4 && y > 10 && y < 80) continue;

                    let blockType = BLOCK_TYPES.STONE;

                    if (y < height - 4) {
                        blockType = BLOCK_TYPES.STONE;
                    } else if (y < height - 1) {
                        blockType = height > 70 ? BLOCK_TYPES.GRAVEL : BLOCK_TYPES.DIRT;
                    } else {
                        blockType = height < 65 ? BLOCK_TYPES.SAND : BLOCK_TYPES.GRASS;
                    }

                    blocks[x][y][z] = blockType;
                }

                const seaLevel = 62;
                if (height <= seaLevel + 3) {
                    for (let y = height; y < seaLevel + 1; y++) {
                        if (y < this.chunkHeight) {
                            blocks[x][y][z] = BLOCK_TYPES.WATER;
                        }
                    }
                }
            }
        }

        this.generateTrees(blocks, cx, cz);

        return blocks;
    }

    getTerrainHeight(x, z) {
        let height = 0;
        let amplitude = 50;
        let frequency = 0.005;
        let maxHeight = 0;

        for (let i = 0; i < 4; i++) {
            const v = this.noise.noise2D(x * frequency, z * frequency);
            height += v * amplitude;
            maxHeight += amplitude;
            amplitude *= 0.5;
            frequency *= 2;
        }

        height = (height / maxHeight) * 30 + 63;
        return Math.floor(Math.max(5, Math.min(120, height)));
    }

    generateTrees(blocks, cx, cz) {
        for (let x = 2; x < this.chunkSize - 2; x++) {
            for (let z = 2; z < this.chunkSize - 2; z++) {
                const gx = cx * this.chunkSize + x;
                const gz = cz * this.chunkSize + z;

                if (Math.random() < 0.02) {
                    const groundLevel = this.getTerrainHeight(gx, gz);
                    if (groundLevel > 60 && groundLevel < 100) {
                        this.generateTree(blocks, x, groundLevel, z);
                    }
                }
            }
        }
    }

    generateTree(blocks, x, y, z) {
        const trunkHeight = 5 + Math.floor(Math.random() * 3);

        for (let i = 0; i < trunkHeight; i++) {
            if (y + i < this.chunkHeight) {
                blocks[x][y + i][z] = BLOCK_TYPES.WOOD;
            }
        }

        const foliageStart = y + trunkHeight - 3;
        const foliageRadius = 2;

        for (let dx = -foliageRadius; dx <= foliageRadius; dx++) {
            for (let dy = 0; dy < 4; dy++) {
                for (let dz = -foliageRadius; dz <= foliageRadius; dz++) {
                    if (Math.abs(dx) + Math.abs(dz) <= foliageRadius) {
                        const nx = x + dx;
                        const ny = foliageStart + dy;
                        const nz = z + dz;

                        if (nx >= 0 && nx < this.chunkSize && ny < this.chunkHeight &&
                            nz >= 0 && nz < this.chunkSize && blocks[nx][ny][nz] === BLOCK_TYPES.AIR) {
                            blocks[nx][ny][nz] = BLOCK_TYPES.LEAVES;
                        }
                    }
                }
            }
        }
    }

    update(playerPos) {
        const px = Math.floor(playerPos.x / this.chunkSize);
        const pz = Math.floor(playerPos.z / this.chunkSize);

        for (let cx = px - this.renderDistance; cx <= px + this.renderDistance; cx++) {
            for (let cz = pz - this.renderDistance; cz <= pz + this.renderDistance; cz++) {
                const key = this.getChunkKey(cx, cz);
                if (!this.chunks.has(key)) {
                    this.loadChunk(cx, cz);
                }
            }
        }

        const keysToRemove = [];
        for (const [key, chunk] of this.chunks) {
            const distance = Math.max(Math.abs(chunk.x - px), Math.abs(chunk.z - pz));
            if (distance > this.renderDistance + 2) {
                keysToRemove.push(key);
            }
        }

        keysToRemove.forEach(key => this.unloadChunk(key));

        for (let i = 0; i < 2 && this.meshUpdateQueue.length > 0; i++) {
            const chunk = this.meshUpdateQueue.shift();
            if (chunk && this.chunks.get(`${chunk.x},${chunk.z}`)) {
                this.buildChunkMesh(chunk);
            }
        }
    }

    loadChunk(cx, cz) {
        const key = this.getChunkKey(cx, cz);
        const blocks = this.generateChunk(cx, cz);

        const chunk = {
            x: cx,
            z: cz,
            blocks: blocks,
            mesh: null,
            needsUpdate: true
        };

        this.chunks.set(key, chunk);
        this.buildChunkMesh(chunk);
    }

    unloadChunk(key) {
        const chunk = this.chunks.get(key);
        if (chunk && chunk.mesh) {
            this.scene.remove(chunk.mesh);
        }
        this.chunks.delete(key);
    }

    buildChunkMesh(chunk) {
        if (chunk.mesh) {
            this.scene.remove(chunk.mesh);
        }
        if (chunk.transparentMesh) {
            this.scene.remove(chunk.transparentMesh);
        }

        const geometry = new THREE.BufferGeometry();
        const transparentGeometry = new THREE.BufferGeometry();
        const positions = [];
        const colors = [];
        const indices = [];
        const tPositions = [];
        const tColors = [];
        const tIndices = [];
        let vertexCount = 0;
        let tVertexCount = 0;

        for (let x = 0; x < this.chunkSize; x++) {
            for (let y = 0; y < this.chunkHeight; y++) {
                for (let z = 0; z < this.chunkSize; z++) {
                    const block = chunk.blocks[x][y][z];
                    if (block === BLOCK_TYPES.AIR) continue;

                    const gx = chunk.x * this.chunkSize + x;
                    const gz = chunk.z * this.chunkSize + z;

                    const isTransparent = block === BLOCK_TYPES.WATER || block === BLOCK_TYPES.LEAVES;

                    if (isTransparent) {
                        this.addBlockGeometry(
                            tPositions, tColors, tIndices, tVertexCount,
                            gx, y, gz, block
                        );
                        tVertexCount += 24;
                    } else {
                        this.addBlockGeometry(
                            positions, colors, indices, vertexCount,
                            gx, y, gz, block
                        );
                        vertexCount += 24;
                    }
                }
            }
        }

        if (positions.length > 0) {
            geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3));
            geometry.setAttribute('color', new THREE.BufferAttribute(new Uint8Array(colors), 3, true));
            geometry.setIndex(new THREE.BufferAttribute(new Uint32Array(indices), 1));

            const material = new THREE.MeshStandardMaterial({
                vertexColors: true,
                side: THREE.FrontSide,
                roughness: 0.8,
                metalness: 0.1
            });

            chunk.mesh = new THREE.Mesh(geometry, material);
            chunk.mesh.castShadow = true;
            chunk.mesh.receiveShadow = true;
            this.scene.add(chunk.mesh);
        }

        if (tPositions.length > 0) {
            transparentGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(tPositions), 3));
            transparentGeometry.setAttribute('color', new THREE.BufferAttribute(new Uint8Array(tColors), 3, true));
            transparentGeometry.setIndex(new THREE.BufferAttribute(new Uint32Array(tIndices), 1));

            const material = new THREE.MeshStandardMaterial({
                vertexColors: true,
                transparent: true,
                opacity: 0.6,
                side: THREE.DoubleSide,
                roughness: 0.3,
                metalness: 0.0
            });

            chunk.transparentMesh = new THREE.Mesh(transparentGeometry, material);
            chunk.transparentMesh.receiveShadow = true;
            this.scene.add(chunk.transparentMesh);
        }
    }

    addBlockGeometry(positions, colors, indices, startIndex, x, y, z, blockType) {
        const color = BLOCK_COLORS[blockType];
        const r = (color >> 16) & 255;
        const g = (color >> 8) & 255;
        const b = color & 255;

        const verts = [
            [x, y, z], [x+1, y, z], [x+1, y+1, z], [x, y+1, z],
            [x, y, z+1], [x+1, y, z+1], [x+1, y+1, z+1], [x, y+1, z+1]
        ];

        verts.forEach(v => {
            positions.push(...v);
            colors.push(r, g, b);
        });

        const faces = [
            [0,1,2,0,2,3], [4,6,5,4,7,6], [0,4,5,0,5,1],
            [1,5,6,1,6,2], [2,6,7,2,7,3], [3,7,4,3,4,0]
        ];

        faces.forEach(face => {
            face.forEach(i => indices.push(startIndex + i));
        });
    }

    destroyBlock(pos) {
        const blockType = this.getBlock(pos.x, pos.y, pos.z);
        this.setBlock(pos.x, pos.y, pos.z, BLOCK_TYPES.AIR);
        this.createParticles(pos, blockType);
    }

    placeBlock(pos, blockType) {
        const newPos = new THREE.Vector3(
            Math.floor(pos.x), Math.floor(pos.y), Math.floor(pos.z)
        );

        const normal = pos.clone().sub(new THREE.Vector3(
            Math.floor(pos.x), Math.floor(pos.y), Math.floor(pos.z)
        ));

        if (normal.y > 0.5) newPos.y++;
        else if (normal.y < 0.5 && normal.y > -0.5) {
            if (Math.abs(normal.x) > Math.abs(normal.z)) {
                newPos.x += normal.x > 0 ? 1 : -1;
            } else {
                newPos.z += normal.z > 0 ? 1 : -1;
            }
        }

        this.setBlock(newPos.x, newPos.y, newPos.z, blockType);
    }

    createParticles(pos, blockType = BLOCK_TYPES.STONE) {
        const color = BLOCK_COLORS[blockType] || 0xd4a373;
        const particleCount = 12;
        for (let i = 0; i < particleCount; i++) {
            const angle = (Math.PI * 2 * i) / particleCount;
            const elevation = Math.random() * 2;
            const speed = 4 + Math.random() * 6;
            new Particle(
                this.scene,
                pos.clone().add(new THREE.Vector3(0.5, 0.5, 0.5)),
                new THREE.Vector3(
                    Math.cos(angle) * speed,
                    elevation + 2,
                    Math.sin(angle) * speed
                ),
                color
            );
        }
    }
}

class Particle {
    constructor(scene, position, velocity, color = 0xd4a373) {
        this.scene = scene;
        this.position = position.clone();
        this.velocity = velocity.clone();
        this.gravity = 12;
        this.lifetime = 0.8;
        this.maxLifetime = 0.8;
        this.color = color;
        this.rotation = new THREE.Vector3(
            Math.random() * Math.PI * 2,
            Math.random() * Math.PI * 2,
            Math.random() * Math.PI * 2
        );
        this.angularVelocity = new THREE.Vector3(
            (Math.random() - 0.5) * 10,
            (Math.random() - 0.5) * 10,
            (Math.random() - 0.5) * 10
        );

        const geometry = new THREE.BoxGeometry(0.15, 0.15, 0.15);
        const material = new THREE.MeshStandardMaterial({
            color: this.color,
            transparent: true,
            roughness: 0.7,
            metalness: 0
        });
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.copy(position);
        this.mesh.castShadow = true;
        scene.add(this.mesh);

        this.animate();
    }

    animate() {
        const tick = () => {
            if (this.lifetime <= 0) {
                this.scene.remove(this.mesh);
                return;
            }

            const deltaTime = 1 / 60;
            this.velocity.y -= this.gravity * deltaTime;
            this.velocity.x *= 0.98;
            this.velocity.z *= 0.98;
            this.position.addScaledVector(this.velocity, deltaTime);

            this.rotation.x += this.angularVelocity.x * deltaTime;
            this.rotation.y += this.angularVelocity.y * deltaTime;
            this.rotation.z += this.angularVelocity.z * deltaTime;

            this.mesh.position.copy(this.position);
            this.mesh.rotation.set(this.rotation.x, this.rotation.y, this.rotation.z);
            this.mesh.material.opacity = Math.pow(this.lifetime / this.maxLifetime, 2);
            this.lifetime -= deltaTime;

            requestAnimationFrame(tick);
        };
        tick();
    }
}

window.addEventListener('DOMContentLoaded', () => {
    window.game = new Game();
});
