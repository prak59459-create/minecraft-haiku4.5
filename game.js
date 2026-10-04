import * as THREE from 'three';
import { SimplexNoise } from 'simplex-noise';

const BLOCK_TYPES = {
    air: 0,
    grass: 1,
    dirt: 2,
    stone: 3,
    wood: 4,
    leaves: 5,
    sand: 6,
    water: 7,
    coal: 8,
    obsidian: 9,
    gravel: 10,
    ice: 11
};

const BLOCK_COLORS = {
    grass: 0x7cb342,
    dirt: 0x8d6e63,
    stone: 0x757575,
    wood: 0x6d4c41,
    leaves: 0x558b2f,
    sand: 0xddd835,
    water: 0x0288d1,
    coal: 0x212121,
    obsidian: 0x1a1a2e,
    gravel: 0x9e9e9e,
    ice: 0xb3e5fc
};

const CHUNK_SIZE = 16;
const CHUNK_HEIGHT = 128;
const RENDER_DISTANCE = 8;
const WORLD_SEED = Math.random() * 10000;

class ParticleSystem {
    constructor(scene) {
        this.scene = scene;
        this.particles = [];
    }

    addParticles(position, blockType, count = 5) {
        const color = new THREE.Color(BLOCK_COLORS[Object.keys(BLOCK_TYPES)[blockType]] || BLOCK_COLORS.stone);

        for (let i = 0; i < count; i++) {
            const geometry = new THREE.BoxGeometry(0.1, 0.1, 0.1);
            const material = new THREE.MeshPhongMaterial({ color });
            const particle = new THREE.Mesh(geometry, material);

            particle.position.copy(position);
            particle.position.x += (Math.random() - 0.5) * 0.5;
            particle.position.y += (Math.random() - 0.5) * 0.5;
            particle.position.z += (Math.random() - 0.5) * 0.5;

            particle.velocity = new THREE.Vector3(
                (Math.random() - 0.5) * 0.2,
                Math.random() * 0.2,
                (Math.random() - 0.5) * 0.2
            );

            particle.life = 0.5;
            particle.maxLife = 0.5;

            this.scene.add(particle);
            this.particles.push(particle);
        }
    }

    update(deltaTime = 0.016) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.life -= deltaTime;

            if (p.life <= 0) {
                this.scene.remove(p);
                p.geometry.dispose();
                p.material.dispose();
                this.particles.splice(i, 1);
            } else {
                p.position.add(p.velocity);
                p.velocity.y -= 0.01;

                const alpha = p.life / p.maxLife;
                p.material.opacity = alpha;
            }
        }
    }
}

class Game {
    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
        this.renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('gameCanvas'), antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setClearColor(0x87ceeb);
        this.renderer.shadowMap.enabled = true;

        const fogColor = 0x87ceeb;
        this.scene.fog = new THREE.Fog(fogColor, RENDER_DISTANCE * CHUNK_SIZE * 2, RENDER_DISTANCE * CHUNK_SIZE * 5);

        this.noise = new SimplexNoise(() => WORLD_SEED);
        this.chunks = new Map();
        this.chunkQueue = [];
        this.lastChunkPos = { x: 0, z: 0 };
        this.particleSystem = new ParticleSystem(this.scene);

        this.player = {
            position: new THREE.Vector3(0, 80, 0),
            velocity: new THREE.Vector3(0, 0, 0),
            acceleration: new THREE.Vector3(0, 0, 0),
            rotation: new THREE.Euler(0, 0, 0, 'YXZ'),
            groundDetection: false,
            speed: 0.15,
            jumpForce: 0.6,
            sprintSpeed: 0.25,
            crouchSpeed: 0.08,
            friction: 0.85,
            gravity: -0.02
        };

        this.camera.position.copy(this.player.position);
        this.input = {
            keys: {},
            mouse: { x: 0, y: 0, locked: false },
            selectedBlock: 'grass'
        };

        this.raycaster = new THREE.Raycaster();
        this.raycasterDirection = new THREE.Vector3();

        this.stats = {
            fps: 0,
            frameCount: 0,
            lastTime: Date.now(),
            chunkCount: 0
        };

        this.initLights();
        this.initControls();
        this.setupEventListeners();
        this.animate();
    }

    initLights() {
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
        this.scene.add(ambientLight);

        const sunLight = new THREE.DirectionalLight(0xffffff, 0.8);
        sunLight.position.set(100, 150, 100);
        sunLight.castShadow = true;
        sunLight.shadow.mapSize.width = 2048;
        sunLight.shadow.mapSize.height = 2048;
        sunLight.shadow.camera.left = -200;
        sunLight.shadow.camera.right = 200;
        sunLight.shadow.camera.top = 200;
        sunLight.shadow.camera.bottom = -200;
        sunLight.shadow.camera.far = 500;
        this.scene.add(sunLight);
        this.sunLight = sunLight;

        const skyGeom = new THREE.SphereGeometry(5000, 32, 32);
        const skyMat = new THREE.MeshBasicMaterial({
            color: 0x87ceeb,
            side: THREE.BackSide
        });
        const sky = new THREE.Mesh(skyGeom, skyMat);
        this.scene.add(sky);
        this.sky = sky;
    }

    initControls() {
        document.addEventListener('click', () => {
            document.documentElement.requestPointerLock = document.documentElement.requestPointerLock || document.documentElement.mozRequestPointerLock;
            document.documentElement.requestPointerLock();
        });

        document.addEventListener('pointerlockchange', () => {
            this.input.mouse.locked = document.pointerLockElement === document.documentElement;
        });

        document.addEventListener('mousemove', (e) => {
            if (this.input.mouse.locked) {
                const sensitivity = 0.003;
                this.player.rotation.order = 'YXZ';
                this.player.rotation.setFromQuaternion(this.camera.quaternion);

                this.player.rotation.y -= e.movementX * sensitivity;
                this.player.rotation.x -= e.movementY * sensitivity;

                this.player.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.player.rotation.x));

                this.camera.quaternion.setFromEuler(this.player.rotation);
            }
        });

        document.addEventListener('keydown', (e) => {
            this.input.keys[e.key.toLowerCase()] = true;
            if (e.key >= '1' && e.key <= '9') {
                const blockTypes = ['grass', 'dirt', 'stone', 'wood', 'leaves', 'sand', 'water', 'coal', 'obsidian'];
                const index = parseInt(e.key) - 1;
                this.selectBlock(blockTypes[index]);
                this.updateBlockInfo();
            }
        });

        document.addEventListener('keyup', (e) => {
            this.input.keys[e.key.toLowerCase()] = false;
        });

        document.addEventListener('wheel', (e) => {
            e.preventDefault();
            const blockTypes = Object.keys(BLOCK_COLORS);
            let currentIndex = blockTypes.indexOf(this.input.selectedBlock);
            currentIndex += e.deltaY > 0 ? 1 : -1;
            currentIndex = (currentIndex + blockTypes.length) % blockTypes.length;
            this.selectBlock(blockTypes[currentIndex]);
            this.updateBlockInfo();
        });

        document.addEventListener('mousedown', (e) => {
            if (e.button === 0) this.destroyBlock();
            if (e.button === 2) this.placeBlock();
        });

        document.addEventListener('contextmenu', (e) => e.preventDefault());

        window.addEventListener('resize', () => this.onWindowResize());

        const hotbarSlots = document.querySelectorAll('.hotbar-slot');
        hotbarSlots.forEach((slot, index) => {
            slot.addEventListener('click', () => {
                this.selectBlock(slot.dataset.block);
                this.updateBlockInfo();
                document.querySelectorAll('.hotbar-slot').forEach(s => s.classList.remove('selected'));
                slot.classList.add('selected');
            });
        });
    }

    selectBlock(blockType) {
        if (BLOCK_COLORS[blockType]) {
            this.input.selectedBlock = blockType;
        }
    }

    updateBlockInfo() {
        document.getElementById('blockInfo').textContent = `Selected: ${this.input.selectedBlock.charAt(0).toUpperCase() + this.input.selectedBlock.slice(1)}`;
    }

    setupEventListeners() {
        window.addEventListener('resize', () => this.onWindowResize());
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    getBlockType(x, y, z) {
        const chunkX = Math.floor(x / CHUNK_SIZE);
        const chunkZ = Math.floor(z / CHUNK_SIZE);
        const localX = ((x % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
        const localZ = ((z % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;

        const key = `${chunkX},${chunkZ}`;
        const chunk = this.chunks.get(key);

        if (!chunk) return BLOCK_TYPES.air;
        if (y < 0 || y >= CHUNK_HEIGHT) return BLOCK_TYPES.air;

        return chunk.data[localX][y][localZ] || BLOCK_TYPES.air;
    }

    setBlockType(x, y, z, type) {
        const chunkX = Math.floor(x / CHUNK_SIZE);
        const chunkZ = Math.floor(z / CHUNK_SIZE);
        const localX = ((x % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
        const localZ = ((z % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;

        const key = `${chunkX},${chunkZ}`;
        let chunk = this.chunks.get(key);

        if (!chunk) {
            this.generateChunk(chunkX, chunkZ);
            chunk = this.chunks.get(key);
        }

        if (chunk && y >= 0 && y < CHUNK_HEIGHT) {
            chunk.data[localX][y][localZ] = type;
            this.rebuildChunkMesh(key);
            this.rebuildAdjacentChunks(chunkX, chunkZ);
        }
    }

    generateChunk(chunkX, chunkZ) {
        const key = `${chunkX},${chunkZ}`;
        if (this.chunks.has(key)) return;

        const data = Array(CHUNK_SIZE).fill(0).map(() =>
            Array(CHUNK_HEIGHT).fill(0).map(() => Array(CHUNK_SIZE).fill(BLOCK_TYPES.air))
        );

        for (let x = 0; x < CHUNK_SIZE; x++) {
            for (let z = 0; z < CHUNK_SIZE; z++) {
                const worldX = chunkX * CHUNK_SIZE + x;
                const worldZ = chunkZ * CHUNK_SIZE + z;

                const temperature = this.noise.noise2D(worldX * 0.05, worldZ * 0.05);
                let height = Math.floor((this.noise.noise2D(worldX * 0.1, worldZ * 0.1) + 1) * 20 + 45);

                for (let y = 0; y < height; y++) {
                    if (y < height - 4) {
                        data[x][y][z] = BLOCK_TYPES.stone;
                        if (Math.random() < 0.08) data[x][y][z] = BLOCK_TYPES.coal;
                        if (y < 40 && Math.random() < 0.02) data[x][y][z] = BLOCK_TYPES.obsidian;
                    } else if (y < height - 1) {
                        data[x][y][z] = BLOCK_TYPES.dirt;
                    } else {
                        if (temperature < -0.3) {
                            data[x][y][z] = BLOCK_TYPES.ice;
                        } else if (height < 60) {
                            data[x][y][z] = BLOCK_TYPES.sand;
                        } else {
                            data[x][y][z] = BLOCK_TYPES.grass;
                        }
                    }
                }

                if (height < 62) {
                    for (let y = height; y < 62; y++) {
                        data[x][y][z] = BLOCK_TYPES.water;
                    }
                }

                if (temperature > 0 && Math.random() < 0.025 && height > 65) {
                    this.generateTree(data, x, height, z);
                }
            }
        }

        const chunk = { data, mesh: null, meshGroup: new THREE.Group() };
        this.chunks.set(key, chunk);
        this.rebuildChunkMesh(key);
    }

    generateTree(data, x, height, z) {
        const treeHeight = 6 + Math.floor(Math.random() * 4);
        const trunkWidth = Math.random() > 0.7 ? 2 : 1;

        for (let y = height; y < height + treeHeight; y++) {
            if (y < CHUNK_HEIGHT) {
                for (let tx = -trunkWidth + 1; tx <= 0; tx++) {
                    for (let tz = -trunkWidth + 1; tz <= 0; tz++) {
                        const fx = x + tx;
                        const fz = z + tz;
                        if (fx >= 0 && fx < CHUNK_SIZE && fz >= 0 && fz < CHUNK_SIZE) {
                            data[fx][y][fz] = BLOCK_TYPES.wood;
                        }
                    }
                }
            }
        }

        const foliageStart = Math.max(height + treeHeight - 4, height + 2);
        const foliageRadius = 3 + Math.floor(Math.random() * 2);

        for (let dx = -foliageRadius; dx <= foliageRadius; dx++) {
            for (let dz = -foliageRadius; dz <= foliageRadius; dz++) {
                const distance = Math.sqrt(dx * dx + dz * dz);
                if (distance <= foliageRadius) {
                    const fx = x + dx;
                    const fz = z + dz;
                    if (fx >= 0 && fx < CHUNK_SIZE && fz >= 0 && fz < CHUNK_SIZE) {
                        for (let y = foliageStart; y < foliageStart + 4; y++) {
                            if (y < CHUNK_HEIGHT && data[fx][y][fz] !== BLOCK_TYPES.wood) {
                                data[fx][y][fz] = BLOCK_TYPES.leaves;
                            }
                        }
                    }
                }
            }
        }
    }

    rebuildChunkMesh(key) {
        const chunk = this.chunks.get(key);
        if (!chunk.mesh) chunk.mesh = new THREE.Group();

        chunk.mesh.children.forEach(child => child.geometry.dispose());
        chunk.mesh.clear();

        const chunkPos = key.split(',').map(Number);
        const chunkX = chunkPos[0];
        const chunkZ = chunkPos[1];

        const geometry = new THREE.BufferGeometry();
        const positions = [];
        const colors = [];
        const indices = [];
        let vertexCount = 0;

        for (let x = 0; x < CHUNK_SIZE; x++) {
            for (let y = 0; y < CHUNK_HEIGHT; y++) {
                for (let z = 0; z < CHUNK_SIZE; z++) {
                    const blockType = chunk.data[x][y][z];
                    if (blockType === BLOCK_TYPES.air) continue;

                    const color = new THREE.Color(BLOCK_COLORS[Object.keys(BLOCK_TYPES)[blockType]]);
                    this.addBlockFaces(x, y, z, blockType, chunkX, chunkZ, positions, colors, indices, vertexCount, color);
                    vertexCount += 24;
                }
            }
        }

        if (positions.length > 0) {
            geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3));
            geometry.setAttribute('color', new THREE.BufferAttribute(new Uint8Array(colors), 3, true));
            geometry.setIndex(new THREE.BufferAttribute(new Uint32Array(indices), 1));

            const material = new THREE.MeshPhongMaterial({
                vertexColors: true,
                side: THREE.FrontSide,
                transparent: true,
                opacity: 0.9
            });
            const mesh = new THREE.Mesh(geometry, material);
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            chunk.mesh.add(mesh);
        }

        chunk.mesh.position.set(chunkX * CHUNK_SIZE, 0, chunkZ * CHUNK_SIZE);
        this.scene.add(chunk.mesh);
    }

    addBlockFaces(x, y, z, blockType, chunkX, chunkZ, positions, colors, indices, vertexCount, color) {
        const faces = [
            [[0, 0, 0], [1, 0, 0], [1, 1, 0], [0, 1, 0]],
            [[1, 0, 1], [0, 0, 1], [0, 1, 1], [1, 1, 1]],
            [[0, 0, 1], [0, 0, 0], [0, 1, 0], [0, 1, 1]],
            [[1, 0, 0], [1, 0, 1], [1, 1, 1], [1, 1, 0]],
            [[0, 1, 0], [1, 1, 0], [1, 1, 1], [0, 1, 1]],
            [[0, 0, 1], [1, 0, 1], [1, 0, 0], [0, 0, 0]]
        ];

        const directions = [
            [0, 0, -1], [0, 0, 1], [-1, 0, 0], [1, 0, 0], [0, 1, 0], [0, -1, 0]
        ];

        for (let faceIdx = 0; faceIdx < 6; faceIdx++) {
            const [dx, dy, dz] = directions[faceIdx];
            if (this.getBlockType(chunkX * CHUNK_SIZE + x + dx, y + dy, chunkZ * CHUNK_SIZE + z + dz) !== BLOCK_TYPES.air) {
                continue;
            }

            const faceVertices = faces[faceIdx];
            const facePositions = [];

            for (const [vx, vy, vz] of faceVertices) {
                facePositions.push(x + vx, y + vy, z + vz);
                colors.push(Math.floor(color.r * 255), Math.floor(color.g * 255), Math.floor(color.b * 255));
            }

            positions.push(...facePositions);
            indices.push(vertexCount, vertexCount + 1, vertexCount + 2, vertexCount, vertexCount + 2, vertexCount + 3);
            vertexCount += 4;
        }
    }

    rebuildAdjacentChunks(chunkX, chunkZ) {
        for (let dx = -1; dx <= 1; dx++) {
            for (let dz = -1; dz <= 1; dz++) {
                const key = `${chunkX + dx},${chunkZ + dz}`;
                if (this.chunks.has(key)) {
                    this.rebuildChunkMesh(key);
                }
            }
        }
    }

    destroyBlock() {
        this.raycaster.setFromCamera({ x: 0, y: 0 }, this.camera);
        const maxDist = 6;
        let targetBlock = null;
        let minDist = Infinity;

        for (let dist = 0; dist < maxDist; dist += 0.25) {
            const point = this.raycaster.ray.origin.clone().addScaledVector(this.raycaster.ray.direction, dist);
            const x = Math.floor(point.x);
            const y = Math.floor(point.y);
            const z = Math.floor(point.z);

            const blockType = this.getBlockType(x, y, z);
            if (blockType !== BLOCK_TYPES.air) {
                const distToBlock = this.raycaster.ray.origin.distanceTo(point);
                if (distToBlock < minDist) {
                    minDist = distToBlock;
                    targetBlock = { x, y, z, type: blockType };
                }
                break;
            }
        }

        if (targetBlock) {
            this.particleSystem.addParticles(new THREE.Vector3(targetBlock.x + 0.5, targetBlock.y + 0.5, targetBlock.z + 0.5), targetBlock.type, 10);
            this.setBlockType(targetBlock.x, targetBlock.y, targetBlock.z, BLOCK_TYPES.air);
        }
    }

    placeBlock() {
        const direction = new THREE.Vector3(0, 0, -1);
        direction.applyQuaternion(this.camera.quaternion);

        this.raycaster.setFromCamera({ x: 0, y: 0 }, this.camera);
        let maxDist = 6;
        let targetBlock = null;
        let placementBlock = null;
        let minDist = Infinity;

        for (let dist = 0; dist < maxDist; dist += 0.25) {
            const point = this.raycaster.ray.origin.clone().addScaledVector(this.raycaster.ray.direction, dist);
            const x = Math.floor(point.x);
            const y = Math.floor(point.y);
            const z = Math.floor(point.z);

            if (this.getBlockType(x, y, z) !== BLOCK_TYPES.air) {
                const distToBlock = this.raycaster.ray.origin.distanceTo(point);
                if (distToBlock < minDist) {
                    minDist = distToBlock;
                    targetBlock = { x, y, z };
                    placementBlock = null;
                }
                break;
            }
        }

        if (targetBlock) {
            const direction = new THREE.Vector3(0, 0, -1).applyQuaternion(this.camera.quaternion);
            const point = this.raycaster.ray.origin.clone().addScaledVector(this.raycaster.ray.direction, minDist);

            const dx = targetBlock.x - Math.floor(point.x);
            const dy = targetBlock.y - Math.floor(point.y);
            const dz = targetBlock.z - Math.floor(point.z);

            if (dy > 0) placementBlock = { x: targetBlock.x, y: targetBlock.y + 1, z: targetBlock.z };
            else if (dy < 0) placementBlock = { x: targetBlock.x, y: targetBlock.y - 1, z: targetBlock.z };
            else if (dx > 0) placementBlock = { x: targetBlock.x + 1, y: targetBlock.y, z: targetBlock.z };
            else if (dx < 0) placementBlock = { x: targetBlock.x - 1, y: targetBlock.y, z: targetBlock.z };
            else if (dz > 0) placementBlock = { x: targetBlock.x, y: targetBlock.y, z: targetBlock.z + 1 };
            else if (dz < 0) placementBlock = { x: targetBlock.x, y: targetBlock.y, z: targetBlock.z - 1 };

            if (placementBlock && this.getBlockType(placementBlock.x, placementBlock.y, placementBlock.z) === BLOCK_TYPES.air) {
                this.setBlockType(placementBlock.x, placementBlock.y, placementBlock.z, BLOCK_TYPES[this.input.selectedBlock]);
            }
        }
    }

    updatePlayer() {
        const forward = new THREE.Vector3();
        const right = new THREE.Vector3();

        this.camera.getWorldDirection(forward);
        forward.y = 0;
        forward.normalize();

        right.crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize();

        let moveDir = new THREE.Vector3();
        const speed = this.input.keys['shift'] ? this.player.crouchSpeed : (this.input.keys['w'] || this.input.keys['a'] || this.input.keys['s'] || this.input.keys['d'] ? this.player.speed : 0);
        const actualSpeed = this.input.keys['control'] ? this.player.sprintSpeed : speed;

        if (this.input.keys['w']) moveDir.addScaledVector(forward, actualSpeed);
        if (this.input.keys['s']) moveDir.addScaledVector(forward, -actualSpeed);
        if (this.input.keys['d']) moveDir.addScaledVector(right, actualSpeed);
        if (this.input.keys['a']) moveDir.addScaledVector(right, -actualSpeed);

        this.player.acceleration.copy(moveDir);
        this.player.acceleration.y = 0;

        this.player.velocity.x += this.player.acceleration.x;
        this.player.velocity.z += this.player.acceleration.z;

        this.player.velocity.x *= this.player.friction;
        this.player.velocity.z *= this.player.friction;

        this.player.velocity.y += this.player.gravity;

        this.player.position.add(this.player.velocity);

        if (this.checkCollision()) {
            this.player.position.y -= this.player.velocity.y;
            this.player.velocity.y = 0;
            this.player.groundDetection = true;

            if (this.input.keys[' ']) {
                this.player.velocity.y = this.player.jumpForce;
                this.player.groundDetection = false;
            }
        } else {
            this.player.groundDetection = false;
        }

        this.camera.position.copy(this.player.position);

        const playerChunkX = Math.floor(this.player.position.x / CHUNK_SIZE);
        const playerChunkZ = Math.floor(this.player.position.z / CHUNK_SIZE);

        if (playerChunkX !== this.lastChunkPos.x || playerChunkZ !== this.lastChunkPos.z) {
            this.lastChunkPos = { x: playerChunkX, z: playerChunkZ };
            this.updateChunks();
        }
    }

    checkCollision() {
        const playerSize = 0.3;
        const playerHeight = 1.7;
        const checkPoints = [
            { x: 0, y: -0.5, z: 0 },
            { x: playerSize, y: -0.5, z: 0 },
            { x: -playerSize, y: -0.5, z: 0 },
            { x: 0, y: -0.5, z: playerSize },
            { x: 0, y: -0.5, z: -playerSize },
            { x: playerSize, y: -0.5, z: playerSize },
            { x: playerSize, y: -0.5, z: -playerSize },
            { x: -playerSize, y: -0.5, z: playerSize },
            { x: -playerSize, y: -0.5, z: -playerSize }
        ];

        for (const offset of checkPoints) {
            const x = Math.floor(this.player.position.x + offset.x);
            const y = Math.floor(this.player.position.y + offset.y);
            const z = Math.floor(this.player.position.z + offset.z);

            const blockType = this.getBlockType(x, y, z);
            if (blockType !== BLOCK_TYPES.air && blockType !== BLOCK_TYPES.water) {
                return true;
            }
        }
        return false;
    }

    updateChunks() {
        const chunkX = this.lastChunkPos.x;
        const chunkZ = this.lastChunkPos.z;

        const toRemove = [];
        this.chunks.forEach((chunk, key) => {
            const [cx, cz] = key.split(',').map(Number);
            if (Math.abs(cx - chunkX) > RENDER_DISTANCE || Math.abs(cz - chunkZ) > RENDER_DISTANCE) {
                this.scene.remove(chunk.mesh);
                toRemove.push(key);
            }
        });

        toRemove.forEach(key => this.chunks.delete(key));

        for (let x = chunkX - RENDER_DISTANCE; x <= chunkX + RENDER_DISTANCE; x++) {
            for (let z = chunkZ - RENDER_DISTANCE; z <= chunkZ + RENDER_DISTANCE; z++) {
                const key = `${x},${z}`;
                if (!this.chunks.has(key)) {
                    this.generateChunk(x, z);
                }
            }
        }

        this.stats.chunkCount = this.chunks.size;
    }

    updateDayNightCycle(time) {
        const cycleTime = (time % 20000) / 20000;
        const angle = cycleTime * Math.PI * 2;

        this.sunLight.position.x = Math.cos(angle) * 150;
        this.sunLight.position.y = Math.sin(angle) * 150 + 100;

        const brightness = Math.max(0.3, Math.sin(angle) * 0.5 + 0.5);
        this.sunLight.intensity = brightness * 0.8;

        const skyColor = new THREE.Color();
        if (cycleTime < 0.25) {
            skyColor.lerpColors(new THREE.Color(0x1a1a2e), new THREE.Color(0x87ceeb), (cycleTime / 0.25));
        } else if (cycleTime < 0.75) {
            skyColor.set(0x87ceeb);
        } else {
            skyColor.lerpColors(new THREE.Color(0x87ceeb), new THREE.Color(0x1a1a2e), ((cycleTime - 0.75) / 0.25));
        }

        this.sky.material.color.copy(skyColor);
    }

    updateStats() {
        this.stats.frameCount++;
        const currentTime = Date.now();

        if (currentTime - this.stats.lastTime >= 1000) {
            this.stats.fps = this.stats.frameCount;
            this.stats.frameCount = 0;
            this.stats.lastTime = currentTime;

            document.getElementById('fps').textContent = this.stats.fps;
            document.getElementById('chunks').textContent = this.stats.chunkCount;
            document.getElementById('posX').textContent = Math.floor(this.player.position.x);
            document.getElementById('posY').textContent = Math.floor(this.player.position.y);
            document.getElementById('posZ').textContent = Math.floor(this.player.position.z);
        }
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        this.updatePlayer();
        this.particleSystem.update();
        this.updateDayNightCycle(Date.now());
        this.updateStats();

        this.renderer.render(this.scene, this.camera);
    }
}

window.addEventListener('load', () => {
    new Game();
});
