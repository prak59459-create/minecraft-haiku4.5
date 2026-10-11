import { World, CHUNK_SIZE_EXPORT, WORLD_HEIGHT_EXPORT } from './world.js';
import { Player, Camera } from './player.js';
import { BLOCKS, BLOCK_COLORS, isBlockSolid } from './blocks.js';
import { UI } from './ui.js';
import { ParticleSystem } from './particles.js';
import { WaterRenderer } from './water.js';
import { AudioManager } from './audio.js';
import { DebugDisplay } from './debug.js';
import { BlockOutline } from './blockoutline.js';

class MinecraftGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true, powerPreference: 'high-performance' });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.setClearColor(0x87CEEB);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFShadowMap;

        this.world = new World();
        this.player = new Player(this.world);
        this.gameCamera = new Camera();
        this.ui = new UI();
        this.particleSystem = new ParticleSystem(this.scene);
        this.waterRenderer = new WaterRenderer(this.scene, this.world);
        this.audioManager = new AudioManager();
        this.debugDisplay = new DebugDisplay();
        this.blockOutline = new BlockOutline(this.scene);

        this.chunkMeshes = new Map();
        this.selectedBlockType = BLOCKS.STONE;
        this.raycastDistance = 6;
        this.lastBreakSound = 0;
        this.lastStepSound = 0;
        this.showDebug = false;
        this.lastPlayerPos = { x: 0, y: 0, z: 0 };

        this.player.onJump = () => this.audioManager.playJumpSound();

        this.setupLighting();
        this.setupEventListeners();
        this.setupPickBlock();
        this.animate();
    }

    setupLighting() {
        const time = Date.now() * 0.00001;
        const sunY = Math.sin(time) * 120 + 100;
        const sunIntensity = Math.max(0.2, Math.sin(time) + 0.4);

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.4 + sunIntensity * 0.15);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5 + sunIntensity * 0.3);
        directionalLight.position.set(200, sunY, 200);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        directionalLight.shadow.camera.far = 500;
        directionalLight.shadow.camera.left = -200;
        directionalLight.shadow.camera.right = 200;
        directionalLight.shadow.camera.top = 200;
        directionalLight.shadow.camera.bottom = -200;
        this.scene.add(directionalLight);

        this.directionalLight = directionalLight;
    }

    setupEventListeners() {
        window.addEventListener('resize', () => this.onWindowResize());
        document.addEventListener('mousedown', (e) => this.onMouseClick(e));
    }

    setupPickBlock() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'c' || e.key === 'C') {
                const hit = this.raycastBlock();
                if (hit.block !== BLOCKS.AIR && hit.block !== BLOCKS.WATER) {
                    this.selectedBlockType = hit.block;
                }
            }
            if (e.key === 'F3') {
                e.preventDefault();
                this.showDebug = !this.showDebug;
                this.debugDisplay.toggle();
            }
            if (e.key === 'h' || e.key === 'H') {
                this.ui.toggleHelp();
            }
        });
    }

    onMouseClick(event) {
        if (document.pointerLockElement !== document.body) return;

        const hit = this.raycastBlock();
        if (hit.block === BLOCKS.AIR) return;

        if (event.button === 0) {
            this.breakBlock(hit);
        } else if (event.button === 2) {
            this.placeBlock(hit);
        }
    }

    breakBlock(hit) {
        this.world.setBlock(hit.x, hit.y, hit.z, BLOCKS.AIR);
        this.updateChunkMesh(hit.x, hit.y, hit.z);

        const color = BLOCK_COLORS[hit.block] || 0x808080;
        this.particleSystem.addBlockBreakParticles(hit.x + 0.5, hit.y + 0.5, hit.z + 0.5, color);

        const now = Date.now();
        if (now - this.lastBreakSound > 50) {
            this.audioManager.playBlockSound('break');
            this.lastBreakSound = now;
        }
    }

    placeBlock(hit) {
        const norm = hit.normal;
        const nx = hit.x + norm.x;
        const ny = hit.y + norm.y;
        const nz = hit.z + norm.z;

        if (!this.isPlayerOccupying(nx, ny, nz)) {
            this.world.setBlock(nx, ny, nz, this.selectedBlockType);
            this.updateChunkMesh(nx, ny, nz);
            this.audioManager.playBlockSound('place');
        }
    }

    isPlayerOccupying(x, y, z) {
        const px = this.player.position.x;
        const py = this.player.position.y;
        const pz = this.player.position.z;

        return (Math.abs(px - x) < 0.6 && Math.abs(py - y) < 1.8 && Math.abs(pz - z) < 0.6) ||
               (Math.abs(px - x) < 0.6 && Math.abs(py - y - 1) < 1.8 && Math.abs(pz - z) < 0.6);
    }

    raycastBlock() {
        const eyePos = this.player.getEyePosition();
        const dir = this.gameCamera.rotation;
        const direction = new THREE.Vector3(
            Math.sin(dir.y) * Math.cos(dir.x),
            Math.sin(dir.x),
            Math.cos(dir.y) * Math.cos(dir.x)
        );

        let hit = null;
        let prevBx = Math.floor(eyePos.x);
        let prevBy = Math.floor(eyePos.y);
        let prevBz = Math.floor(eyePos.z);

        for (let dist = 0.05; dist <= this.raycastDistance; dist += 0.05) {
            const x = eyePos.x + direction.x * dist;
            const y = eyePos.y + direction.y * dist;
            const z = eyePos.z + direction.z * dist;

            const bx = Math.floor(x);
            const by = Math.floor(y);
            const bz = Math.floor(z);

            if (bx === prevBx && by === prevBy && bz === prevBz) continue;

            const block = this.world.getBlock(bx, by, bz);
            if (isBlockSolid(block)) {
                let normal = { x: 0, y: 0, z: 0 };
                if (prevBx !== bx) normal.x = prevBx < bx ? -1 : 1;
                else if (prevBy !== by) normal.y = prevBy < by ? -1 : 1;
                else if (prevBz !== bz) normal.z = prevBz < bz ? -1 : 1;

                hit = { x: bx, y: by, z: bz, block, normal, dist };
                break;
            }

            prevBx = bx;
            prevBy = by;
            prevBz = bz;
        }

        if (!hit) {
            hit = { x: 0, y: 0, z: 0, block: BLOCKS.AIR, normal: { x: 0, y: 1, z: 0 }, dist: this.raycastDistance };
        }

        return hit;
    }

    updateChunkMesh(x, y, z) {
        const cx = Math.floor(x / 16);
        const cz = Math.floor(z / 16);

        for (let dx = -1; dx <= 1; dx++) {
            for (let dz = -1; dz <= 1; dz++) {
                const key = `${cx + dx},${cz + dz}`;
                if (this.chunkMeshes.has(key)) {
                    this.scene.remove(this.chunkMeshes.get(key));
                    this.chunkMeshes.delete(key);
                }
            }
        }
    }

    buildChunkMesh(chunk) {
        const geometry = new THREE.BufferGeometry();
        const vertices = [];
        const colors = [];
        const indices = [];

        const CHUNK_SIZE = 16;
        const WORLD_HEIGHT = 256;

        for (let x = 0; x < CHUNK_SIZE; x++) {
            for (let y = 1; y < WORLD_HEIGHT; y++) {
                for (let z = 0; z < CHUNK_SIZE; z++) {
                    const blockId = chunk.getBlock(x, y, z);
                    if (blockId === BLOCKS.AIR) continue;

                    const wx = chunk.x * CHUNK_SIZE + x;
                    const wy = y;
                    const wz = chunk.z * CHUNK_SIZE + z;

                    const color = new THREE.Color(BLOCK_COLORS[blockId]);

                    const baseLight = 0.65;
                    const heightLight = Math.min(0.35, (wy / WORLD_HEIGHT) * 0.4);
                    const varLight = Math.sin(wx * 0.2 + wz * 0.2 + wy * 0.1) * 0.08;
                    const brightness = baseLight + heightLight + varLight;

                    color.multiplyScalar(brightness);

                    this.addBlockFaces(vertices, colors, indices, wx, wy, wz, blockId, color, chunk);
                }
            }
        }

        if (vertices.length > 0) {
            geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(vertices), 3));
            geometry.setAttribute('color', new THREE.BufferAttribute(new Uint8Array(colors), 3, true));
            if (indices.length > 0) {
                geometry.setIndex(new THREE.BufferAttribute(new Uint32Array(indices), 1));
            }
            geometry.computeBoundingBox();

            const material = new THREE.MeshPhongMaterial({
                vertexColors: true,
                wireframe: false,
                flatShading: true,
                side: THREE.FrontSide,
                shininess: 10,
                emissive: 0x000000,
                specular: 0x111111
            });
            const mesh = new THREE.Mesh(geometry, material);
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            mesh.frustumCulled = true;
            return mesh;
        }

        return null;
    }

    addBlockFaces(vertices, colors, indices, x, y, z, blockId, color, chunk) {
        const FACES = [
            { dir: [1, 0, 0], verts: [[0, 0, 0], [0, 1, 0], [0, 1, 1], [0, 0, 1]] },
            { dir: [-1, 0, 0], verts: [[1, 0, 1], [1, 1, 1], [1, 1, 0], [1, 0, 0]] },
            { dir: [0, 1, 0], verts: [[0, 1, 1], [0, 1, 0], [1, 1, 0], [1, 1, 1]] },
            { dir: [0, -1, 0], verts: [[0, 0, 0], [0, 0, 1], [1, 0, 1], [1, 0, 0]] },
            { dir: [0, 0, 1], verts: [[1, 0, 0], [1, 1, 0], [0, 1, 0], [0, 0, 0]] },
            { dir: [0, 0, -1], verts: [[0, 0, 1], [0, 1, 1], [1, 1, 1], [1, 0, 1]] }
        ];

        const r = Math.floor(color.r * 255);
        const g = Math.floor(color.g * 255);
        const b = Math.floor(color.b * 255);

        let faceCount = 0;
        for (let i = 0; i < FACES.length; i++) {
            const face = FACES[i];
            const [dx, dy, dz] = face.dir;
            const neighbor = this.world.getBlock(x + dx, y + dy, z + dz);
            if (isBlockSolid(neighbor) && neighbor !== BLOCKS.WATER) continue;

            const startIndex = vertices.length / 3;
            const verts = face.verts;
            for (let j = 0; j < verts.length; j++) {
                const [vx, vy, vz] = verts[j];
                vertices.push(x + vx, y + vy, z + vz);
                colors.push(r, g, b);
            }

            indices.push(startIndex, startIndex + 1, startIndex + 2);
            indices.push(startIndex, startIndex + 2, startIndex + 3);
            faceCount++;
        }

        return faceCount > 0;
    }

    updateVisibleChunks() {
        const playerChunkX = Math.floor(this.player.position.x / 16);
        const playerChunkZ = Math.floor(this.player.position.z / 16);

        this.world.updateChunksAround(this.player.position.x, this.player.position.z);

        const maxRenderDist = 8;
        for (const [key, chunk] of this.world.chunks) {
            const [cx, cz] = key.split(',').map(Number);
            const dx = Math.abs(cx - playerChunkX);
            const dz = Math.abs(cz - playerChunkZ);

            if (dx > maxRenderDist || dz > maxRenderDist) {
                if (this.chunkMeshes.has(key)) {
                    this.scene.remove(this.chunkMeshes.get(key));
                    this.chunkMeshes.delete(key);
                }
                continue;
            }

            if (!this.chunkMeshes.has(key)) {
                const mesh = this.buildChunkMesh(chunk);
                if (mesh) {
                    this.scene.add(mesh);
                    this.chunkMeshes.set(key, mesh);
                }
            }
        }
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    getDistanceToChunk(cx, cz) {
        const playerChunkX = Math.floor(this.player.position.x / 16);
        const playerChunkZ = Math.floor(this.player.position.z / 16);
        const dx = cx - playerChunkX;
        const dz = cz - playerChunkZ;
        return Math.sqrt(dx * dx + dz * dz);
    }

    updateStepSound() {
        const pos = this.player.position;
        const dx = pos.x - this.lastPlayerPos.x;
        const dz = pos.z - this.lastPlayerPos.z;
        const distance = Math.sqrt(dx * dx + dz * dz);

        if (distance > 0.2 && this.player.isOnGround) {
            const now = Date.now();
            if (now - this.lastStepSound > 300) {
                this.audioManager.playStepSound();
                this.lastStepSound = now;
            }
        }

        this.lastPlayerPos.x = pos.x;
        this.lastPlayerPos.y = pos.y;
        this.lastPlayerPos.z = pos.z;
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        this.player.update();
        this.gameCamera.updateFromPlayer(this.player);

        const eyePos = this.player.getEyePosition();
        this.camera.position.set(eyePos.x, eyePos.y, eyePos.z);

        const direction = new THREE.Vector3(
            Math.sin(this.gameCamera.rotation.y) * Math.cos(this.gameCamera.rotation.x),
            Math.sin(this.gameCamera.rotation.x),
            Math.cos(this.gameCamera.rotation.y) * Math.cos(this.gameCamera.rotation.x)
        );
        this.camera.lookAt(
            eyePos.x + direction.x,
            eyePos.y + direction.y,
            eyePos.z + direction.z
        );

        this.updateVisibleChunks();
        this.updateDayNightCycle();
        this.particleSystem.update();
        this.waterRenderer.update();
        this.updateStepSound();

        const hit = this.raycastBlock();
        this.blockOutline.update(hit);

        const fps = this.ui.updateFPS();
        this.ui.updateHUD(this.player.position, this.selectedBlockType, fps);

        if (this.showDebug) {
            this.debugDisplay.update(this);
        }

        this.renderer.render(this.scene, this.camera);
    }

    updateDayNightCycle() {
        const time = Date.now() * 0.00001;
        const sunY = Math.sin(time) * 120 + 90;
        const sunIntensity = Math.max(0.1, Math.sin(time) + 0.3);

        this.directionalLight.position.set(250, sunY, 250);
        this.directionalLight.intensity = 0.4 + sunIntensity * 0.5;

        const skyColor = new THREE.Color();
        if (sunIntensity > 0.3) {
            skyColor.setHSL(0.6, 0.5, 0.4 + sunIntensity * 0.4);
        } else {
            skyColor.setHSL(0.7, 0.2, 0.1 + sunIntensity * 0.15);
        }
        this.scene.background = skyColor;
    }
}

const game = new MinecraftGame();
