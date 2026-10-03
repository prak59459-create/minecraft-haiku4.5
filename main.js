const BLOCK_TYPES = {
    GRASS: { id: 1, name: 'GRASS', color: 0x2d8a2d, texture: null },
    DIRT: { id: 2, name: 'DIRT', color: 0x8b6914, texture: null },
    STONE: { id: 3, name: 'STONE', color: 0x808080, texture: null },
    WOOD: { id: 4, name: 'WOOD', color: 0x8b4513, texture: null },
    LEAVES: { id: 5, name: 'LEAVES', color: 0x228b22, texture: null },
    WATER: { id: 6, name: 'WATER', color: 0x4169e1, texture: null },
    SAND: { id: 7, name: 'SAND', color: 0xede4b8, texture: null },
    COBBLESTONE: { id: 8, name: 'COBBLESTONE', color: 0x696969, texture: null },
    OAK_LOG: { id: 9, name: 'OAK_LOG', color: 0x6b4423, texture: null }
};

const BLOCK_SIZE = 1;
const CHUNK_SIZE = 16;
const RENDER_DISTANCE = 8;
const WORLD_HEIGHT = 128;

class PerlinNoise {
    constructor(seed = 0) {
        this.p = [];
        for (let i = 0; i < 256; i++) {
            this.p[i] = Math.floor(Math.random() * 256);
        }
        this.p = this.p.concat(this.p);
    }

    fade(t) {
        return t * t * t * (t * (t * 6 - 15) + 10);
    }

    lerp(t, a, b) {
        return a + t * (b - a);
    }

    grad(hash, x, y, z) {
        const h = hash & 15;
        const u = h < 8 ? x : y;
        const v = h < 8 ? y : z;
        return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
    }

    noise(x, y, z = 0) {
        const xi = Math.floor(x) & 255;
        const yi = Math.floor(y) & 255;
        const zi = Math.floor(z) & 255;

        x -= Math.floor(x);
        y -= Math.floor(y);
        z -= Math.floor(z);

        const u = this.fade(x);
        const v = this.fade(y);
        const w = this.fade(z);

        const p = this.p;
        const a = p[xi] + yi;
        const aa = p[a] + zi;
        const ab = p[a + 1] + zi;
        const b = p[xi + 1] + yi;
        const ba = p[b] + zi;
        const bb = p[b + 1] + zi;

        const g000 = this.grad(p[aa], x, y, z);
        const g100 = this.grad(p[ba], x - 1, y, z);
        const g010 = this.grad(p[ab], x, y - 1, z);
        const g110 = this.grad(p[bb], x - 1, y - 1, z);
        const g001 = this.grad(p[aa + 1], x, y, z - 1);
        const g101 = this.grad(p[ba + 1], x - 1, y, z - 1);
        const g011 = this.grad(p[ab + 1], x, y - 1, z - 1);
        const g111 = this.grad(p[bb + 1], x - 1, y - 1, z - 1);

        const x1 = this.lerp(u, g000, g100);
        const x2 = this.lerp(u, g010, g110);
        const y1 = this.lerp(v, x1, x2);

        const x3 = this.lerp(u, g001, g101);
        const x4 = this.lerp(u, g011, g111);
        const y2 = this.lerp(v, x3, x4);

        return this.lerp(w, y1, y2);
    }
}

class Chunk {
    constructor(x, z, perlin) {
        this.x = x;
        this.z = z;
        this.blocks = new Uint8Array(CHUNK_SIZE * CHUNK_SIZE * WORLD_HEIGHT);
        this.mesh = null;
        this.perlin = perlin;
        this.loaded = false;
        this.generate();
    }

    generate() {
        const frequency = 0.05;
        const baseHeight = 40;
        const scale = 30;

        for (let lx = 0; lx < CHUNK_SIZE; lx++) {
            for (let lz = 0; lz < CHUNK_SIZE; lz++) {
                const wx = this.x * CHUNK_SIZE + lx;
                const wz = this.z * CHUNK_SIZE + lz;

                const noiseVal = this.perlin.noise(wx * frequency, wz * frequency, 0);
                const height = Math.floor(baseHeight + noiseVal * scale);

                for (let y = 0; y < WORLD_HEIGHT; y++) {
                    let blockId = 0;
                    if (y < height - 3) {
                        blockId = BLOCK_TYPES.STONE.id;
                    } else if (y < height) {
                        blockId = BLOCK_TYPES.DIRT.id;
                    } else if (y === height) {
                        blockId = BLOCK_TYPES.GRASS.id;
                    }

                    if (y < 20) blockId = BLOCK_TYPES.STONE.id;
                    if (y === 19) blockId = BLOCK_TYPES.DIRT.id;

                    this.blocks[this.getIndex(lx, y, lz)] = blockId;
                }

                if (Math.random() < 0.02 && height > 30) {
                    this.generateTree(lx, height, lz);
                }
            }
        }
        this.loaded = true;
    }

    generateTree(lx, y, lz) {
        const trunkHeight = 5 + Math.floor(Math.random() * 3);
        for (let i = 0; i < trunkHeight; i++) {
            if (y + i < WORLD_HEIGHT) {
                this.blocks[this.getIndex(lx, y + i, lz)] = BLOCK_TYPES.OAK_LOG.id;
            }
        }

        const leafRadius = 3;
        const leavesStart = y + trunkHeight - 3;
        for (let dy = -leafRadius; dy <= leafRadius; dy++) {
            for (let dx = -leafRadius; dx <= leafRadius; dx++) {
                for (let dz = -leafRadius; dz <= leafRadius; dz++) {
                    if (Math.sqrt(dx * dx + dy * dy + dz * dz) <= leafRadius) {
                        const nlx = lx + dx;
                        const nz = lz + dz;
                        const ny = leavesStart + dy;
                        if (nlx >= 0 && nlx < CHUNK_SIZE && nz >= 0 && nz < CHUNK_SIZE && ny >= 0 && ny < WORLD_HEIGHT) {
                            if (this.blocks[this.getIndex(nlx, ny, nz)] === 0) {
                                this.blocks[this.getIndex(nlx, ny, nz)] = BLOCK_TYPES.LEAVES.id;
                            }
                        }
                    }
                }
            }
        }
    }

    getIndex(x, y, z) {
        return x + y * CHUNK_SIZE + z * CHUNK_SIZE * WORLD_HEIGHT;
    }

    getBlock(x, y, z) {
        if (x < 0 || x >= CHUNK_SIZE || y < 0 || y >= WORLD_HEIGHT || z < 0 || z >= CHUNK_SIZE) {
            return 0;
        }
        return this.blocks[this.getIndex(x, y, z)];
    }

    setBlock(x, y, z, blockId) {
        if (x < 0 || x >= CHUNK_SIZE || y < 0 || y >= WORLD_HEIGHT || z < 0 || z >= CHUNK_SIZE) {
            return false;
        }
        this.blocks[this.getIndex(x, y, z)] = blockId;
        return true;
    }

    createMesh() {
        const geometry = new THREE.BufferGeometry();
        const vertices = [];
        const colors = [];

        for (let lx = 0; lx < CHUNK_SIZE; lx++) {
            for (let y = 0; y < WORLD_HEIGHT; y++) {
                for (let lz = 0; lz < CHUNK_SIZE; lz++) {
                    const blockId = this.getBlock(lx, y, lz);
                    if (blockId === 0) continue;

                    const blockType = Object.values(BLOCK_TYPES).find(b => b.id === blockId);
                    if (!blockType) continue;

                    const x = this.x * CHUNK_SIZE + lx;
                    const z = this.z * CHUNK_SIZE + lz;

                    this.addBlockFaces(vertices, colors, x, y, z, blockId, blockType.color, lx, y, lz);
                }
            }
        }

        if (vertices.length > 0) {
            geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(vertices), 3));
            geometry.setAttribute('color', new THREE.BufferAttribute(new Uint8Array(colors), 3, true));

            const material = new THREE.MeshStandardMaterial({
                vertexColors: true,
                roughness: 0.8,
                metalness: 0.1,
                wireframe: false
            });

            this.mesh = new THREE.Mesh(geometry, material);
            this.mesh.position.set(this.x * CHUNK_SIZE, 0, this.z * CHUNK_SIZE);
            this.mesh.castShadow = true;
            this.mesh.receiveShadow = true;
        }

        return this.mesh;
    }

    addBlockFaces(vertices, colors, x, y, z, blockId, color, lx, ly, lz) {
        const c = {
            r: (color >> 16) & 255,
            g: (color >> 8) & 255,
            b: color & 255
        };

        const faces = [
            { normal: [0, 1, 0], vertices: [[0, 1, 0], [1, 1, 0], [1, 1, 1], [0, 1, 1]], check: (ox, oy, oz) => this.checkBlockOpaque(lx, ly + 1, lz, ox, oy, oz) },
            { normal: [0, -1, 0], vertices: [[0, 0, 0], [0, 0, 1], [1, 0, 1], [1, 0, 0]], check: (ox, oy, oz) => this.checkBlockOpaque(lx, ly - 1, lz, ox, oy, oz) },
            { normal: [1, 0, 0], vertices: [[1, 0, 0], [1, 0, 1], [1, 1, 1], [1, 1, 0]], check: (ox, oy, oz) => this.checkBlockOpaque(lx + 1, ly, lz, ox, oy, oz) },
            { normal: [-1, 0, 0], vertices: [[0, 0, 0], [0, 1, 0], [0, 1, 1], [0, 0, 1]], check: (ox, oy, oz) => this.checkBlockOpaque(lx - 1, ly, lz, ox, oy, oz) },
            { normal: [0, 0, 1], vertices: [[0, 0, 1], [1, 0, 1], [1, 1, 1], [0, 1, 1]], check: (ox, oy, oz) => this.checkBlockOpaque(lx, ly, lz + 1, ox, oy, oz) },
            { normal: [0, 0, -1], vertices: [[0, 0, 0], [0, 1, 0], [1, 1, 0], [1, 0, 0]], check: (ox, oy, oz) => this.checkBlockOpaque(lx, ly, lz - 1, ox, oy, oz) }
        ];

        for (const face of faces) {
            if (face.check(0, 0, 0)) continue;

            const v0 = face.vertices[0];
            const v1 = face.vertices[1];
            const v2 = face.vertices[2];
            const v3 = face.vertices[3];

            vertices.push(
                x + v0[0], y + v0[1], z + v0[2],
                x + v1[0], y + v1[1], z + v1[2],
                x + v2[0], y + v2[1], z + v2[2],
                x + v0[0], y + v0[1], z + v0[2],
                x + v2[0], y + v2[1], z + v2[2],
                x + v3[0], y + v3[1], z + v3[2]
            );

            const brightness = Math.random() * 0.2 + 0.8;
            const r = Math.floor(c.r * brightness);
            const g = Math.floor(c.g * brightness);
            const b = Math.floor(c.b * brightness);

            for (let i = 0; i < 6; i++) {
                colors.push(r, g, b);
            }
        }
    }

    checkBlockOpaque(lx, ly, lz, ox, oy, oz) {
        if (ly < 0 || ly >= WORLD_HEIGHT) return false;
        const blockId = this.getBlock(lx, ly, lz);
        return blockId !== 0 && blockId !== BLOCK_TYPES.WATER.id && blockId !== BLOCK_TYPES.LEAVES.id;
    }

    dispose() {
        if (this.mesh && this.mesh.geometry) {
            this.mesh.geometry.dispose();
            if (this.mesh.material) {
                this.mesh.material.dispose();
            }
        }
    }
}

class Player {
    constructor() {
        this.position = new THREE.Vector3(8, 70, 8);
        this.velocity = new THREE.Vector3(0, 0, 0);
        this.direction = new THREE.Vector3(0, 0, -1);
        this.right = new THREE.Vector3(1, 0, 0);
        this.up = new THREE.Vector3(0, 1, 0);

        this.yaw = 0;
        this.pitch = 0;

        this.speed = 0.1;
        this.sprintSpeed = 0.15;
        this.jumpForce = 0.15;
        this.gravity = 0.005;

        this.isGrounded = false;
        this.isSprinting = false;
        this.isCrouching = false;
        this.height = 1.8;
        this.crouchHeight = 1.3;

        this.keys = {};
        this.mouse = { x: 0, y: 0, deltaX: 0, deltaY: 0 };

        this.selectedBlock = BLOCK_TYPES.GRASS.id;
    }

    update(chunks) {
        this.velocity.y -= this.gravity;

        const currentSpeed = this.isSprinting && !this.isCrouching ? this.sprintSpeed : this.speed;
        const moveDir = new THREE.Vector3(0, 0, 0);

        if (this.keys['w'] || this.keys['W']) moveDir.add(this.direction);
        if (this.keys['s'] || this.keys['S']) moveDir.sub(this.direction);
        if (this.keys['a'] || this.keys['A']) moveDir.sub(this.right);
        if (this.keys['d'] || this.keys['D']) moveDir.add(this.right);

        if (moveDir.length() > 0) {
            moveDir.normalize().multiplyScalar(currentSpeed);
            this.velocity.x = moveDir.x;
            this.velocity.z = moveDir.z;
        } else {
            this.velocity.x *= 0.95;
            this.velocity.z *= 0.95;
        }

        this.updateRotation();
        this.checkCollisions(chunks);
        this.position.add(this.velocity);
    }

    updateRotation() {
        this.yaw -= this.mouse.deltaX * 0.003;
        this.pitch -= this.mouse.deltaY * 0.003;
        this.pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.pitch));

        const cosYaw = Math.cos(this.yaw);
        const sinYaw = Math.sin(this.yaw);
        const cosPitch = Math.cos(this.pitch);
        const sinPitch = Math.sin(this.pitch);

        this.direction.set(sinYaw * cosPitch, sinPitch, -cosYaw * cosPitch).normalize();
        this.right.crossVectors(this.up, this.direction).normalize();

        this.mouse.deltaX = 0;
        this.mouse.deltaY = 0;
    }

    checkCollisions(chunks) {
        const collisionMargin = 0.3;
        const playerHeight = this.isCrouching ? this.crouchHeight : this.height;
        const playerRadius = 0.3;

        const checkPos = this.position.clone();
        checkPos.y += playerHeight * 0.5;

        let isGroundedNow = false;

        for (const chunk of chunks.values()) {
            const chunkX = chunk.x * CHUNK_SIZE;
            const chunkZ = chunk.z * CHUNK_SIZE;

            for (let x = Math.floor(checkPos.x) - 1; x <= Math.floor(checkPos.x) + 1; x++) {
                for (let y = Math.floor(checkPos.y) - 1; y <= Math.floor(checkPos.y) + 1; y++) {
                    for (let z = Math.floor(checkPos.z) - 1; z <= Math.floor(checkPos.z) + 1; z++) {
                        const lx = ((x - chunkX) % CHUNK_SIZE + CHUNK_SIZE) % CHUNK_SIZE;
                        const lz = ((z - chunkZ) % CHUNK_SIZE + CHUNK_SIZE) % CHUNK_SIZE;

                        if (chunk.getBlock(lx, y, lz) === 0) continue;

                        if (Math.abs(checkPos.y - (y + 0.5)) < playerHeight * 0.5 + collisionMargin &&
                            Math.abs(checkPos.x - (x + 0.5)) < playerRadius + collisionMargin &&
                            Math.abs(checkPos.z - (z + 0.5)) < playerRadius + collisionMargin) {

                            if (this.velocity.y < 0 && checkPos.y - playerHeight * 0.5 > y) {
                                this.position.y = y + playerHeight * 0.5 + 0.01;
                                this.velocity.y = 0;
                                isGroundedNow = true;
                            } else if (this.velocity.y > 0) {
                                this.position.y = y - playerHeight * 0.5 - 0.01;
                                this.velocity.y = 0;
                            }

                            if (Math.abs(checkPos.x - (x + 0.5)) < playerRadius + collisionMargin) {
                                this.position.x = checkPos.x > x + 0.5 ? x + 1 + playerRadius : x - playerRadius;
                            }

                            if (Math.abs(checkPos.z - (z + 0.5)) < playerRadius + collisionMargin) {
                                this.position.z = checkPos.z > z + 0.5 ? z + 1 + playerRadius : z - playerRadius;
                            }
                        }
                    }
                }
            }
        }

        this.isGrounded = isGroundedNow;
    }

    jump() {
        if (this.isGrounded) {
            this.velocity.y = this.jumpForce;
            this.isGrounded = false;
        }
    }

    getEyePosition() {
        const height = this.isCrouching ? this.crouchHeight : this.height;
        return this.position.clone().add(new THREE.Vector3(0, height * 0.9, 0));
    }

    setCrouching(crouching) {
        this.isCrouching = crouching;
    }

    setSprinting(sprinting) {
        this.isSprinting = sprinting && !this.isCrouching;
    }
}

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFShadowShadowMap;
        this.renderer.setClearColor(0x87ceeb);

        this.chunks = new Map();
        this.perlin = new PerlinNoise(Date.now());
        this.player = new Player();
        this.raycaster = new THREE.Raycaster();
        this.selectedBlock = null;
        this.selectedBlockMesh = null;

        this.time = 0;
        this.frameCount = 0;
        this.lastTime = Date.now();

        this.setupLights();
        this.setupInput();
        this.setupEvents();

        this.animate();
    }

    setupLights() {
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);

        this.directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        this.directionalLight.position.set(100, 100, 100);
        this.directionalLight.castShadow = true;
        this.directionalLight.shadow.mapSize.width = 2048;
        this.directionalLight.shadow.mapSize.height = 2048;
        this.directionalLight.shadow.camera.near = 0.5;
        this.directionalLight.shadow.camera.far = 500;
        this.directionalLight.shadow.camera.left = -256;
        this.directionalLight.shadow.camera.right = 256;
        this.directionalLight.shadow.camera.top = 256;
        this.directionalLight.shadow.camera.bottom = -256;
        this.scene.add(this.directionalLight);
    }

    setupInput() {
        document.addEventListener('keydown', (e) => {
            this.player.keys[e.key] = true;
            if (e.key.toLowerCase() === ' ') {
                e.preventDefault();
                this.player.jump();
            }
            if (e.key.toLowerCase() === 'shift') {
                this.player.setSprinting(true);
            }
            if (e.key.toLowerCase() === 'control') {
                this.player.setCrouching(true);
            }

            const num = parseInt(e.key);
            if (num >= 1 && num <= 9) {
                const blockTypes = Object.values(BLOCK_TYPES).slice(0, 9);
                this.player.selectedBlock = blockTypes[num - 1].id;
                this.updateHotbar();
            }
        });

        document.addEventListener('keyup', (e) => {
            this.player.keys[e.key] = false;
            if (e.key.toLowerCase() === 'shift') {
                this.player.setSprinting(false);
            }
            if (e.key.toLowerCase() === 'control') {
                this.player.setCrouching(false);
            }
        });

        document.addEventListener('mousemove', (e) => {
            this.player.mouse.deltaX = e.movementX;
            this.player.mouse.deltaY = e.movementY;
        });

        document.addEventListener('mousedown', (e) => {
            if (e.button === 0) {
                this.destroyBlock();
            } else if (e.button === 2) {
                this.placeBlock();
            }
        });

        document.addEventListener('wheel', (e) => {
            e.preventDefault();
            const blockTypes = Object.values(BLOCK_TYPES).slice(0, 9);
            let currentIndex = blockTypes.findIndex(b => b.id === this.player.selectedBlock);
            if (e.deltaY > 0) {
                currentIndex = (currentIndex + 1) % blockTypes.length;
            } else {
                currentIndex = (currentIndex - 1 + blockTypes.length) % blockTypes.length;
            }
            this.player.selectedBlock = blockTypes[currentIndex].id;
            this.updateHotbar();
        });

        document.addEventListener('contextmenu', (e) => e.preventDefault());

        this.canvas.addEventListener('click', () => {
            if (document.pointerLockElement !== this.canvas) {
                this.canvas.requestPointerLock();
            }
        });
    }

    setupEvents() {
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }

    updateChunks() {
        const playerChunkX = Math.floor(this.player.position.x / CHUNK_SIZE);
        const playerChunkZ = Math.floor(this.player.position.z / CHUNK_SIZE);

        for (let x = playerChunkX - RENDER_DISTANCE; x <= playerChunkX + RENDER_DISTANCE; x++) {
            for (let z = playerChunkZ - RENDER_DISTANCE; z <= playerChunkZ + RENDER_DISTANCE; z++) {
                const key = `${x},${z}`;
                if (!this.chunks.has(key)) {
                    const chunk = new Chunk(x, z, this.perlin);
                    const mesh = chunk.createMesh();
                    if (mesh) this.scene.add(mesh);
                    this.chunks.set(key, chunk);
                }
            }
        }

        const chunksToRemove = [];
        for (const [key, chunk] of this.chunks.entries()) {
            const distance = Math.sqrt(
                Math.pow(chunk.x - playerChunkX, 2) + Math.pow(chunk.z - playerChunkZ, 2)
            );
            if (distance > RENDER_DISTANCE + 2) {
                chunksToRemove.push(key);
            }
        }

        for (const key of chunksToRemove) {
            const chunk = this.chunks.get(key);
            if (chunk.mesh) this.scene.remove(chunk.mesh);
            chunk.dispose();
            this.chunks.delete(key);
        }
    }

    raycastBlock() {
        const eyePos = this.player.getEyePosition();
        this.raycaster.set(eyePos, this.player.direction);

        const meshes = [];
        for (const chunk of this.chunks.values()) {
            if (chunk.mesh) meshes.push(chunk.mesh);
        }

        const intersects = this.raycaster.intersectObjects(meshes);
        if (intersects.length > 0) {
            const hit = intersects[0];
            const point = hit.point;

            let blockPos;
            if (Math.abs(hit.normal.x) === 1) {
                blockPos = new THREE.Vector3(
                    Math.floor(point.x + hit.normal.x * 0.1),
                    Math.floor(point.y),
                    Math.floor(point.z)
                );
            } else if (Math.abs(hit.normal.y) === 1) {
                blockPos = new THREE.Vector3(
                    Math.floor(point.x),
                    Math.floor(point.y + hit.normal.y * 0.1),
                    Math.floor(point.z)
                );
            } else {
                blockPos = new THREE.Vector3(
                    Math.floor(point.x),
                    Math.floor(point.y),
                    Math.floor(point.z + hit.normal.z * 0.1)
                );
            }

            return { position: blockPos, normal: hit.normal };
        }

        return null;
    }

    destroyBlock() {
        const hit = this.raycastBlock();
        if (!hit) return;

        const { x, y, z } = hit.position;
        const chunkX = Math.floor(x / CHUNK_SIZE);
        const chunkZ = Math.floor(z / CHUNK_SIZE);
        const localX = ((x % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
        const localZ = ((z % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;

        const chunk = this.chunks.get(`${chunkX},${chunkZ}`);
        if (chunk) {
            chunk.setBlock(localX, y, localZ, 0);
            const mesh = chunk.createMesh();
            if (chunk.mesh) this.scene.remove(chunk.mesh);
            if (mesh) this.scene.add(mesh);
            chunk.mesh = mesh;
        }
    }

    placeBlock() {
        const hit = this.raycastBlock();
        if (!hit) return;

        const newPos = new THREE.Vector3(
            hit.position.x + hit.normal.x,
            hit.position.y + hit.normal.y,
            hit.position.z + hit.normal.z
        );

        const chunkX = Math.floor(newPos.x / CHUNK_SIZE);
        const chunkZ = Math.floor(newPos.z / CHUNK_SIZE);
        const localX = ((newPos.x % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
        const localZ = ((newPos.z % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;

        const chunk = this.chunks.get(`${chunkX},${chunkZ}`);
        if (chunk) {
            chunk.setBlock(localX, newPos.y, localZ, this.player.selectedBlock);
            const mesh = chunk.createMesh();
            if (chunk.mesh) this.scene.remove(chunk.mesh);
            if (mesh) this.scene.add(mesh);
            chunk.mesh = mesh;
        }
    }

    updateSelectedBlock() {
        const hit = this.raycastBlock();

        if (this.selectedBlockMesh) {
            this.scene.remove(this.selectedBlockMesh);
            this.selectedBlockMesh = null;
        }

        if (hit) {
            const geometry = new THREE.BoxGeometry(1.02, 1.02, 1.02);
            const material = new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 2 });
            const edges = new THREE.EdgesGeometry(geometry);
            this.selectedBlockMesh = new THREE.LineSegments(edges, material);
            this.selectedBlockMesh.position.copy(hit.position).addScalar(0.5);
            this.scene.add(this.selectedBlockMesh);
        }
    }

    updateDayNightCycle() {
        this.time = (this.time + 0.0001) % (Math.PI * 2);
        const lightIntensity = Math.sin(this.time) * 0.4 + 0.6;
        this.directionalLight.intensity = Math.max(0.2, lightIntensity);

        const skyColor = new THREE.Color(
            0.5 + Math.sin(this.time) * 0.3,
            0.7 + Math.sin(this.time) * 0.2,
            1.0
        );
        this.scene.background = skyColor;
    }

    updateHotbar() {
        const slots = document.querySelectorAll('.hotbar-slot');
        const blockTypes = Object.values(BLOCK_TYPES).slice(0, 9);
        slots.forEach((slot, index) => {
            slot.classList.remove('selected');
            if (blockTypes[index].id === this.player.selectedBlock) {
                slot.classList.add('selected');
            }
            slot.textContent = blockTypes[index].name[0];
        });
    }

    updateUI() {
        document.getElementById('fps').textContent = `FPS: ${this.frameCount}`;
        document.getElementById('position').textContent =
            `X: ${this.player.position.x.toFixed(1)} Y: ${this.player.position.y.toFixed(1)} Z: ${this.player.position.z.toFixed(1)}`;
        document.getElementById('chunks').textContent = `Chunks: ${this.chunks.size}`;

        const selectedType = Object.values(BLOCK_TYPES).find(b => b.id === this.player.selectedBlock);
        if (selectedType) {
            document.getElementById('blockInfo').textContent = `Block: ${selectedType.name}`;
        }
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        this.player.update(this.chunks);
        this.updateChunks();
        this.updateSelectedBlock();
        this.updateDayNightCycle();

        const eyePos = this.player.getEyePosition();
        this.camera.position.copy(eyePos);
        this.camera.lookAt(eyePos.clone().add(this.player.direction));

        this.renderer.render(this.scene, this.camera);

        this.frameCount++;
        const now = Date.now();
        if (now - this.lastTime >= 1000) {
            this.updateUI();
            this.frameCount = 0;
            this.lastTime = now;
        }
    }
}

window.addEventListener('load', () => {
    const game = new Game();
});
