const CHUNK_SIZE = 16;
const CHUNK_HEIGHT = 256;
const RENDER_DISTANCE = 8;
const BLOCK_SIZE = 1;

const BLOCK_TYPES = {
    AIR: 0,
    GRASS: 1,
    DIRT: 2,
    STONE: 3,
    WOOD: 4,
    LEAVES: 5,
    WATER: 6,
    SAND: 7,
};

const BLOCK_COLORS = {
    [BLOCK_TYPES.GRASS]: { top: 0x7fb069, side: 0x5d8e42, bottom: 0x5d5d3d },
    [BLOCK_TYPES.DIRT]: { top: 0x6d5d4e, side: 0x6d5d4e, bottom: 0x6d5d4e },
    [BLOCK_TYPES.STONE]: { top: 0x808080, side: 0x707070, bottom: 0x707070 },
    [BLOCK_TYPES.WOOD]: { top: 0x8b6f47, side: 0x6d5d4e, bottom: 0x6d5d4e },
    [BLOCK_TYPES.LEAVES]: { top: 0x4a8c2a, side: 0x4a8c2a, bottom: 0x4a8c2a },
    [BLOCK_TYPES.WATER]: { top: 0x4287f5, side: 0x3d7bd4, bottom: 0x3d7bd4 },
    [BLOCK_TYPES.SAND]: { top: 0xdab649, side: 0xc9a635, bottom: 0xc9a635 },
};

const BLOCK_NAMES = {
    [BLOCK_TYPES.GRASS]: 'Grass Block',
    [BLOCK_TYPES.DIRT]: 'Dirt',
    [BLOCK_TYPES.STONE]: 'Stone',
    [BLOCK_TYPES.WOOD]: 'Wood',
    [BLOCK_TYPES.LEAVES]: 'Leaves',
    [BLOCK_TYPES.WATER]: 'Water',
    [BLOCK_TYPES.SAND]: 'Sand',
};

const HOTBAR_BLOCKS = [
    BLOCK_TYPES.GRASS,
    BLOCK_TYPES.DIRT,
    BLOCK_TYPES.STONE,
    BLOCK_TYPES.WOOD,
    BLOCK_TYPES.LEAVES,
    BLOCK_TYPES.WATER,
    BLOCK_TYPES.SAND,
];

class Game {
    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setClearColor(0x87ceeb);
        document.body.appendChild(this.renderer.domElement);

        this.camera.position.set(0, 100, 0);
        this.camera.rotation.order = 'YXZ';

        this.controls = new FirstPersonControls(this.camera);
        this.world = new World(this.scene);

        this.selectedBlockIndex = 0;
        this.gameTime = 0;
        this.dayDuration = 20000;

        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();

        this.initHotbar();
        this.setupEventListeners();
        this.startGame();
    }

    initHotbar() {
        const hotbar = document.getElementById('hotbar');
        HOTBAR_BLOCKS.forEach((blockType, index) => {
            const slot = document.createElement('div');
            slot.className = 'hotbar-slot';
            if (index === 0) slot.classList.add('selected');
            slot.textContent = index + 1;
            slot.addEventListener('click', () => this.selectBlock(index));
            hotbar.appendChild(slot);
        });
    }

    setupEventListeners() {
        window.addEventListener('resize', () => this.onWindowResize());
        window.addEventListener('keydown', (e) => this.onKeyDown(e));
        window.addEventListener('mousedown', (e) => this.onMouseDown(e));
        window.addEventListener('wheel', (e) => this.onMouseWheel(e));
        document.addEventListener('pointerlockchange', () => {
            if (!document.pointerLockElement) {
                this.controls.enabled = false;
            }
        });
        document.addEventListener('click', () => {
            document.documentElement.requestPointerLock();
        });
    }

    onKeyDown(e) {
        if (e.key >= '1' && e.key <= '9') {
            const index = parseInt(e.key) - 1;
            if (index < HOTBAR_BLOCKS.length) {
                this.selectBlock(index);
            }
        }
        this.controls.onKeyDown(e);
    }

    onMouseDown(e) {
        if (!this.controls.enabled) return;

        this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

        this.raycaster.setFromCamera(this.mouse, this.camera);
        const hits = this.world.raycast(this.raycaster);

        if (hits.length > 0) {
            const hit = hits[0];
            if (e.button === 0) {
                this.world.destroyBlock(hit.point, hit.face.normal);
            } else if (e.button === 2) {
                this.world.placeBlock(
                    hit.point,
                    hit.face.normal,
                    HOTBAR_BLOCKS[this.selectedBlockIndex]
                );
            }
        }
    }

    onMouseWheel(e) {
        e.preventDefault();
        if (e.deltaY > 0) {
            this.selectedBlockIndex = (this.selectedBlockIndex + 1) % HOTBAR_BLOCKS.length;
        } else {
            this.selectedBlockIndex =
                (this.selectedBlockIndex - 1 + HOTBAR_BLOCKS.length) % HOTBAR_BLOCKS.length;
        }
        this.updateHotbarUI();
    }

    selectBlock(index) {
        this.selectedBlockIndex = index;
        this.updateHotbarUI();
    }

    updateHotbarUI() {
        const slots = document.querySelectorAll('.hotbar-slot');
        slots.forEach((slot, i) => {
            slot.classList.toggle('selected', i === this.selectedBlockIndex);
        });
        const blockType = HOTBAR_BLOCKS[this.selectedBlockIndex];
        document.getElementById('selectedBlock').textContent = BLOCK_NAMES[blockType];
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    startGame() {
        let lastTime = Date.now();
        let frameCount = 0;
        let fpsTime = 0;

        const animate = () => {
            requestAnimationFrame(animate);

            const now = Date.now();
            const dt = (now - lastTime) / 1000;
            lastTime = now;

            this.gameTime += dt;
            if (this.gameTime > this.dayDuration) {
                this.gameTime = 0;
            }

            this.controls.update(dt);
            this.world.update(this.camera.position, dt);
            this.updateLighting();
            this.updateUI();

            this.renderer.render(this.scene, this.camera);

            frameCount++;
            fpsTime += dt;
            if (fpsTime >= 1) {
                document.getElementById('fps').textContent = frameCount;
                frameCount = 0;
                fpsTime = 0;
            }
        };

        animate();
    }

    updateLighting() {
        const progress = this.gameTime / this.dayDuration;
        const sunHeight = Math.sin(progress * Math.PI);
        const sunIntensity = Math.max(0.3, sunHeight);

        this.scene.background.setHSL(0.6, 1, 0.3 + sunHeight * 0.4);

        if (!this.sunLight) {
            this.sunLight = new THREE.DirectionalLight(0xffffff, sunIntensity);
            this.sunLight.position.set(100, 100, 50);
            this.sunLight.shadow.mapSize.width = 2048;
            this.sunLight.shadow.mapSize.height = 2048;
            this.scene.add(this.sunLight);

            const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
            this.scene.add(ambientLight);
        }

        this.sunLight.intensity = sunIntensity;
        this.sunLight.position.set(
            Math.cos(progress * Math.PI * 2) * 200,
            100 + sunHeight * 100,
            Math.sin(progress * Math.PI * 2) * 200
        );
    }

    updateUI() {
        const pos = this.camera.position;
        document.getElementById('pos').textContent = `${Math.floor(pos.x)}, ${Math.floor(pos.y)}, ${Math.floor(pos.z)}`;

        this.mouse.x = (window.innerWidth / 2 / window.innerWidth) * 2 - 1;
        this.mouse.y = -(window.innerHeight / 2 / window.innerHeight) * 2 + 1;

        this.raycaster.setFromCamera(this.mouse, this.camera);
        const hits = this.world.raycast(this.raycaster);

        if (hits.length > 0) {
            const hit = hits[0];
            const blockPos = this.world.getBlockPosition(hit.point);
            document.getElementById('block').textContent = `${blockPos.x}, ${blockPos.y}, ${blockPos.z}`;
        } else {
            document.getElementById('block').textContent = '-';
        }
    }
}

class FirstPersonControls {
    constructor(camera) {
        this.camera = camera;
        this.enabled = false;
        this.moveSpeed = 20;
        this.sprintSpeed = 40;
        this.jumpForce = 15;
        this.gravity = 30;

        this.velocity = new THREE.Vector3();
        this.isJumping = false;
        this.onGround = false;

        this.keys = {};
        this.pitch = 0;
        this.yaw = 0;

        document.addEventListener('mousemove', (e) => this.onMouseMove(e), false);
    }

    onKeyDown(e) {
        this.keys[e.key.toLowerCase()] = true;
        if (e.key === ' ') {
            e.preventDefault();
            if (this.onGround) {
                this.velocity.y = this.jumpForce;
                this.isJumping = true;
                this.onGround = false;
            }
        }
    }

    onKeyUp(e) {
        this.keys[e.key.toLowerCase()] = false;
    }

    onMouseMove(e) {
        if (!this.enabled) return;

        const movementX = e.movementX || 0;
        const movementY = e.movementY || 0;

        const sensitivity = 0.003;
        this.yaw -= movementX * sensitivity;
        this.pitch -= movementY * sensitivity;
        this.pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.pitch));

        this.camera.rotation.order = 'YXZ';
        this.camera.rotation.y = this.yaw;
        this.camera.rotation.x = this.pitch;
    }

    update(dt) {
        if (!this.enabled) return;

        const forward = new THREE.Vector3(0, 0, -1).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.yaw);
        const right = new THREE.Vector3(1, 0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.yaw);

        let moveDir = new THREE.Vector3();
        const isSprinting = this.keys['shift'];
        const speed = isSprinting ? this.sprintSpeed : this.moveSpeed;

        if (this.keys['w']) moveDir.addScaledVector(forward, 1);
        if (this.keys['s']) moveDir.addScaledVector(forward, -1);
        if (this.keys['a']) moveDir.addScaledVector(right, -1);
        if (this.keys['d']) moveDir.addScaledVector(right, 1);

        if (moveDir.length() > 0) {
            moveDir.normalize();
            moveDir.multiplyScalar(speed);
            this.camera.position.addScaledVector(moveDir, dt);
        }

        this.velocity.y -= this.gravity * dt;
        this.camera.position.y += this.velocity.y * dt;

        if (this.camera.position.y < 64) {
            this.camera.position.y = 64;
            this.velocity.y = 0;
            this.onGround = true;
            this.isJumping = false;
        } else {
            this.onGround = false;
        }
    }
}

class World {
    constructor(scene) {
        this.scene = scene;
        this.chunks = new Map();
        this.noise = new SimplexNoise();
        this.meshes = new Map();
    }

    getChunkKey(cx, cz) {
        return `${cx},${cz}`;
    }

    getBlockPosition(point) {
        return {
            x: Math.floor(point.x / BLOCK_SIZE),
            y: Math.floor(point.y / BLOCK_SIZE),
            z: Math.floor(point.z / BLOCK_SIZE),
        };
    }

    getChunkCoords(x, z) {
        return {
            x: Math.floor(x / CHUNK_SIZE),
            z: Math.floor(z / CHUNK_SIZE),
        };
    }

    getTerrainHeight(x, z) {
        const scale = 0.05;
        const height = 64 + this.noise.perlin2(x * scale, z * scale) * 32;
        return Math.floor(height);
    }

    generateChunk(cx, cz) {
        const key = this.getChunkKey(cx, cz);
        if (this.chunks.has(key)) return this.chunks.get(key);

        const chunk = new Array(CHUNK_SIZE * CHUNK_SIZE * CHUNK_HEIGHT).fill(BLOCK_TYPES.AIR);

        for (let x = 0; x < CHUNK_SIZE; x++) {
            for (let z = 0; z < CHUNK_SIZE; z++) {
                const worldX = cx * CHUNK_SIZE + x;
                const worldZ = cz * CHUNK_SIZE + z;
                const height = this.getTerrainHeight(worldX, worldZ);

                for (let y = 0; y < CHUNK_HEIGHT; y++) {
                    let blockType = BLOCK_TYPES.AIR;

                    if (y < height - 3) {
                        blockType = BLOCK_TYPES.STONE;
                    } else if (y < height - 1) {
                        blockType = BLOCK_TYPES.DIRT;
                    } else if (y < height) {
                        blockType = BLOCK_TYPES.GRASS;
                    } else if (y < 64) {
                        blockType = BLOCK_TYPES.WATER;
                    }

                    if (y === height && height > 64) {
                        const treeChance = 0.02;
                        if (Math.random() < treeChance) {
                            const idx = x + z * CHUNK_SIZE + y * CHUNK_SIZE * CHUNK_SIZE;
                            const treeHeight = Math.floor(Math.random() * 3) + 4;
                            for (let ty = 0; ty < treeHeight; ty++) {
                                if (y + ty < CHUNK_HEIGHT) {
                                    chunk[x + z * CHUNK_SIZE + (y + ty) * CHUNK_SIZE * CHUNK_SIZE] = BLOCK_TYPES.WOOD;
                                }
                            }
                            if (y + treeHeight < CHUNK_HEIGHT) {
                                for (let lx = -2; lx <= 2; lx++) {
                                    for (let lz = -2; lz <= 2; lz++) {
                                        if (Math.abs(lx) <= 1 && Math.abs(lz) <= 1) {
                                            const lIdx = (x + lx) + (z + lz) * CHUNK_SIZE + (y + treeHeight) * CHUNK_SIZE * CHUNK_SIZE;
                                            if (lIdx >= 0 && lIdx < chunk.length && (x + lx >= 0 && x + lx < CHUNK_SIZE && z + lz >= 0 && z + lz < CHUNK_SIZE)) {
                                                chunk[lIdx] = BLOCK_TYPES.LEAVES;
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }

                    const idx = x + z * CHUNK_SIZE + y * CHUNK_SIZE * CHUNK_SIZE;
                    chunk[idx] = blockType;
                }
            }
        }

        this.chunks.set(key, chunk);
        return chunk;
    }

    getBlock(x, y, z) {
        if (y < 0 || y >= CHUNK_HEIGHT) return BLOCK_TYPES.AIR;

        const chunk = this.getChunkCoords(x, z);
        const key = this.getChunkKey(chunk.x, chunk.z);

        if (!this.chunks.has(key)) return BLOCK_TYPES.AIR;

        const chunkData = this.chunks.get(key);
        const localX = ((x % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
        const localZ = ((z % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
        const idx = localX + localZ * CHUNK_SIZE + y * CHUNK_SIZE * CHUNK_SIZE;

        return chunkData[idx] || BLOCK_TYPES.AIR;
    }

    setBlock(x, y, z, blockType) {
        const chunk = this.getChunkCoords(x, z);
        const key = this.getChunkKey(chunk.x, chunk.z);

        if (!this.chunks.has(key)) this.generateChunk(chunk.x, chunk.z);

        const chunkData = this.chunks.get(key);
        const localX = ((x % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
        const localZ = ((z % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
        const idx = localX + localZ * CHUNK_SIZE + y * CHUNK_SIZE * CHUNK_SIZE;

        chunkData[idx] = blockType;
        this.rebuildChunkMesh(chunk.x, chunk.z);
    }

    destroyBlock(point, normal) {
        const pos = this.getBlockPosition(point);
        let blockPos = { ...pos };

        const offset = 0.5;
        blockPos.x += Math.round(normal.x * offset);
        blockPos.y += Math.round(normal.y * offset);
        blockPos.z += Math.round(normal.z * offset);

        if (this.getBlock(blockPos.x, blockPos.y, blockPos.z) !== BLOCK_TYPES.AIR) {
            this.setBlock(blockPos.x, blockPos.y, blockPos.z, BLOCK_TYPES.AIR);
        }
    }

    placeBlock(point, normal, blockType) {
        const pos = this.getBlockPosition(point);
        let blockPos = { ...pos };

        const offset = 0.5;
        blockPos.x += Math.round(normal.x * offset);
        blockPos.y += Math.round(normal.y * offset);
        blockPos.z += Math.round(normal.z * offset);

        if (this.getBlock(blockPos.x, blockPos.y, blockPos.z) === BLOCK_TYPES.AIR) {
            this.setBlock(blockPos.x, blockPos.y, blockPos.z, blockType);
        }
    }

    raycast(raycaster) {
        let hits = [];
        const direction = raycaster.ray.direction.clone();
        const origin = raycaster.ray.origin.clone();
        const maxDistance = 5;

        for (let i = 0; i < maxDistance / 0.1; i++) {
            const point = origin.clone().addScaledVector(direction, i * 0.1);
            const blockPos = this.getBlockPosition(point);
            const block = this.getBlock(blockPos.x, blockPos.y, blockPos.z);

            if (block !== BLOCK_TYPES.AIR) {
                const dist = origin.distanceTo(point);
                if (dist <= maxDistance) {
                    hits.push({
                        distance: dist,
                        point: point,
                        blockPos: blockPos,
                        face: this.getNormal(blockPos, origin),
                    });
                }
                break;
            }
        }

        return hits;
    }

    getNormal(blockPos, origin) {
        const blockCenter = new THREE.Vector3(blockPos.x + 0.5, blockPos.y + 0.5, blockPos.z + 0.5);
        const toBlock = blockCenter.clone().sub(origin);

        const absX = Math.abs(toBlock.x);
        const absY = Math.abs(toBlock.y);
        const absZ = Math.abs(toBlock.z);

        let normal;
        if (absX > absY && absX > absZ) {
            normal = { x: Math.sign(toBlock.x), y: 0, z: 0 };
        } else if (absY > absX && absY > absZ) {
            normal = { x: 0, y: Math.sign(toBlock.y), z: 0 };
        } else {
            normal = { x: 0, y: 0, z: Math.sign(toBlock.z) };
        }

        return { normal };
    }

    rebuildChunkMesh(cx, cz) {
        const key = this.getChunkKey(cx, cz);

        if (this.meshes.has(key)) {
            this.scene.remove(this.meshes.get(key));
            this.meshes.delete(key);
        }

        this.buildChunkMesh(cx, cz);
    }

    buildChunkMesh(cx, cz) {
        const key = this.getChunkKey(cx, cz);
        const geometry = new THREE.BufferGeometry();
        const positions = [];
        const colors = [];
        const indices = [];

        for (let x = 0; x < CHUNK_SIZE; x++) {
            for (let z = 0; z < CHUNK_SIZE; z++) {
                for (let y = 0; y < CHUNK_HEIGHT; y++) {
                    const worldX = cx * CHUNK_SIZE + x;
                    const worldZ = cz * CHUNK_SIZE + z;
                    const blockType = this.getBlock(worldX, y, worldZ);

                    if (blockType === BLOCK_TYPES.AIR) continue;

                    const blockColors = BLOCK_COLORS[blockType];

                    this.addBlockFaces(
                        worldX, y, worldZ, blockType, blockColors,
                        positions, colors, indices
                    );
                }
            }
        }

        if (positions.length === 0) return;

        geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(new Uint8Array(colors), 3, true));
        geometry.setIndex(new THREE.BufferAttribute(new Uint32Array(indices), 1));
        geometry.computeVertexNormals();

        const material = new THREE.MeshPhongMaterial({
            vertexColors: true,
            side: THREE.FrontSide,
            wireframe: false,
        });

        const mesh = new THREE.Mesh(geometry, material);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        this.scene.add(mesh);
        this.meshes.set(key, mesh);
    }

    addBlockFaces(x, y, z, blockType, colors, positions, colors_arr, indices) {
        const neighbors = {
            up: this.getBlock(x, y + 1, z),
            down: this.getBlock(x, y - 1, z),
            north: this.getBlock(x, y, z - 1),
            south: this.getBlock(x, y, z + 1),
            east: this.getBlock(x + 1, y, z),
            west: this.getBlock(x - 1, y, z),
        };

        const baseIdx = positions.length / 3;

        const faces = [
            { dir: 'up', normal: [0, 1, 0], color: colors.top, verts: [[0, 1, 0], [1, 1, 0], [1, 1, 1], [0, 1, 1]] },
            { dir: 'down', normal: [0, -1, 0], color: colors.bottom, verts: [[0, 0, 1], [1, 0, 1], [1, 0, 0], [0, 0, 0]] },
            { dir: 'north', normal: [0, 0, -1], color: colors.side, verts: [[0, 0, 0], [1, 0, 0], [1, 1, 0], [0, 1, 0]] },
            { dir: 'south', normal: [0, 0, 1], color: colors.side, verts: [[1, 0, 1], [0, 0, 1], [0, 1, 1], [1, 1, 1]] },
            { dir: 'west', normal: [-1, 0, 0], color: colors.side, verts: [[0, 0, 1], [0, 0, 0], [0, 1, 0], [0, 1, 1]] },
            { dir: 'east', normal: [1, 0, 0], color: colors.side, verts: [[1, 0, 0], [1, 0, 1], [1, 1, 1], [1, 1, 0]] },
        ];

        faces.forEach(face => {
            if (neighbors[face.dir] === BLOCK_TYPES.AIR || blockType === BLOCK_TYPES.WATER) {
                const color = face.color;
                const r = (color >> 16) & 255;
                const g = (color >> 8) & 255;
                const b = color & 255;

                const startIdx = positions.length / 3;
                face.verts.forEach(vert => {
                    positions.push(x + vert[0], y + vert[1], z + vert[2]);
                    colors_arr.push(r, g, b);
                });

                indices.push(
                    startIdx, startIdx + 1, startIdx + 2,
                    startIdx, startIdx + 2, startIdx + 3
                );
            }
        });
    }

    update(playerPos, dt) {
        const playerChunk = this.getChunkCoords(playerPos.x, playerPos.z);
        const chunksToRender = new Set();

        for (let dx = -RENDER_DISTANCE; dx <= RENDER_DISTANCE; dx++) {
            for (let dz = -RENDER_DISTANCE; dz <= RENDER_DISTANCE; dz++) {
                const cx = playerChunk.x + dx;
                const cz = playerChunk.z + dz;
                const key = this.getChunkKey(cx, cz);
                chunksToRender.add(key);

                if (!this.chunks.has(key)) {
                    this.generateChunk(cx, cz);
                }
                if (!this.meshes.has(key)) {
                    this.buildChunkMesh(cx, cz);
                }
            }
        }

        for (let [key, mesh] of this.meshes) {
            if (!chunksToRender.has(key)) {
                this.scene.remove(mesh);
                this.meshes.delete(key);
            }
        }
    }
}

const game = new Game();
window.addEventListener('keydown', (e) => {
    if (e.key === ' ') e.preventDefault();
    game.onKeyDown(e);
});
window.addEventListener('keyup', (e) => {
    if (game.controls) game.controls.onKeyUp(e);
});
document.addEventListener('contextmenu', (e) => e.preventDefault());
