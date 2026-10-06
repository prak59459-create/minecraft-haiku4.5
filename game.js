import { World, CHUNK_SIZE_EXPORT, WORLD_HEIGHT_EXPORT } from './world.js';
import { Player, Camera } from './player.js';
import { BLOCKS, BLOCK_COLORS, isBlockSolid } from './blocks.js';
import { UI } from './ui.js';
import { ParticleSystem } from './particles.js';
import { WaterRenderer } from './water.js';
import { AudioManager } from './audio.js';
import { DebugDisplay } from './debug.js';
import { BlockOutline } from './blockoutline.js';
import { WorldStorage } from './worldstorage.js';

class MinecraftGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setClearColor(0x87CEEB);

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
        this.showDebug = false;
        this.creativeMode = false;
        this.autoSaveInterval = 60000;
        this.lastSaveTime = Date.now();

        this.player.onJump = () => this.audioManager.playJumpSound();

        this.setupLighting();
        this.setupEventListeners();
        this.setupPickBlock();
        this.setupGameModeKeys();
        this.loadWorldMetadata();
        this.animate();
    }

    setupLighting() {
        const time = Date.now() * 0.0001;
        const sunY = Math.sin(time) * 100 + 100;
        const sunIntensity = Math.max(0.3, Math.sin(time) + 0.5);

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5 + sunIntensity * 0.1);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6 + sunIntensity * 0.2);
        directionalLight.position.set(150, sunY, 150);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        directionalLight.shadow.camera.far = 500;
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

    setupGameModeKeys() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'm' || e.key === 'M') {
                this.creativeMode = !this.creativeMode;
                const mode = this.creativeMode ? 'Creative' : 'Survival';
                console.log(`Switched to ${mode} mode`);
            }
            if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S')) {
                e.preventDefault();
                this.saveWorld();
            }
        });
    }

    loadWorldMetadata() {
        const metadata = WorldStorage.loadMetadata();
        if (metadata) {
            console.log('World loaded:', metadata);
        }
    }

    saveWorld() {
        const metadata = {
            playerPos: this.player.position,
            timestamp: Date.now(),
            gameMode: this.creativeMode ? 'creative' : 'survival',
            renderedChunks: this.chunkMeshes.size
        };
        WorldStorage.saveMetadata(metadata);
        console.log('World saved');
    }

    onMouseClick(event) {
        if (document.pointerLockElement !== document.body) return;

        const hit = this.raycastBlock();
        if (hit.block === BLOCKS.AIR) return;

        if (event.button === 0) {
            this.world.setBlock(hit.x, hit.y, hit.z, BLOCKS.AIR);
            this.updateChunkMesh(hit.x, hit.y, hit.z);

            const color = BLOCK_COLORS[hit.block] || 0x808080;
            this.particleSystem.addBlockBreakParticles(hit.x + 0.5, hit.y + 0.5, hit.z + 0.5, color);

            const chunk = this.world.getChunk(Math.floor(hit.x / 16), Math.floor(hit.z / 16));
            if (chunk) chunk.save();

            const now = Date.now();
            if (now - this.lastBreakSound > 50) {
                this.audioManager.playBlockSound('break');
                this.lastBreakSound = now;
            }
        } else if (event.button === 2) {
            const norm = hit.normal;
            const nx = hit.x + norm.x;
            const ny = hit.y + norm.y;
            const nz = hit.z + norm.z;

            if (!this.isPlayerOccupying(nx, ny, nz)) {
                this.world.setBlock(nx, ny, nz, this.selectedBlockType);
                this.updateChunkMesh(nx, ny, nz);
                this.audioManager.playBlockSound('place');

                const chunk = this.world.getChunk(Math.floor(nx / 16), Math.floor(nz / 16));
                if (chunk) chunk.save();
            }
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
        const direction = new THREE.Vector3(
            Math.sin(this.gameCamera.rotation.y) * Math.cos(this.gameCamera.rotation.x),
            Math.sin(this.gameCamera.rotation.x),
            Math.cos(this.gameCamera.rotation.y) * Math.cos(this.gameCamera.rotation.x)
        );

        let hit = null;

        for (let dist = 0.05; dist <= this.raycastDistance; dist += 0.05) {
            const x = eyePos.x + direction.x * dist;
            const y = eyePos.y + direction.y * dist;
            const z = eyePos.z + direction.z * dist;

            const bx = Math.floor(x);
            const by = Math.floor(y);
            const bz = Math.floor(z);

            const block = this.world.getBlock(bx, by, bz);
            if (isBlockSolid(block)) {
                const prevDist = Math.max(0.05, dist - 0.05);
                const prevX = eyePos.x + direction.x * prevDist;
                const prevY = eyePos.y + direction.y * prevDist;
                const prevZ = eyePos.z + direction.z * prevDist;

                const prevBx = Math.floor(prevX);
                const prevBy = Math.floor(prevY);
                const prevBz = Math.floor(prevZ);

                let normal = { x: 0, y: 0, z: 0 };
                if (prevBx !== bx) normal.x = prevBx < bx ? -1 : 1;
                else if (prevBy !== by) normal.y = prevBy < by ? -1 : 1;
                else if (prevBz !== bz) normal.z = prevBz < bz ? -1 : 1;

                hit = { x: bx, y: by, z: bz, block, normal, dist };
                break;
            }
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

                    const baseLight = 0.6;
                    const heightLight = Math.min(0.4, (wy / WORLD_HEIGHT) * 0.5);
                    const varLight = Math.sin(wx * 0.5 + wz * 0.5) * 0.08;

                    let skyLight = 1.0;
                    if (wy > 200) skyLight = 1.2;
                    else if (wy > 150) skyLight = 1.1;

                    const brightness = (baseLight + heightLight + varLight) * skyLight;

                    color.multiplyScalar(Math.min(1.0, brightness));

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
            geometry.computeVertexNormals();

            const material = new THREE.MeshPhongMaterial({
                vertexColors: true,
                wireframe: false,
                flatShading: true,
                side: THREE.FrontSide,
                shininess: 20,
                emissive: 0x000000
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
        let faceCount = 0;

        const faces = [
            { dir: [1, 0, 0], verts: [[0, 0, 0], [0, 1, 0], [0, 1, 1], [0, 0, 1]] },
            { dir: [-1, 0, 0], verts: [[1, 0, 1], [1, 1, 1], [1, 1, 0], [1, 0, 0]] },
            { dir: [0, 1, 0], verts: [[0, 1, 1], [0, 1, 0], [1, 1, 0], [1, 1, 1]] },
            { dir: [0, -1, 0], verts: [[0, 0, 0], [0, 0, 1], [1, 0, 1], [1, 0, 0]] },
            { dir: [0, 0, 1], verts: [[1, 0, 0], [1, 1, 0], [0, 1, 0], [0, 0, 0]] },
            { dir: [0, 0, -1], verts: [[0, 0, 1], [0, 1, 1], [1, 1, 1], [1, 0, 1]] }
        ];

        const r = Math.floor(Math.min(255, color.r * 255));
        const g = Math.floor(Math.min(255, color.g * 255));
        const b = Math.floor(Math.min(255, color.b * 255));

        for (let i = 0; i < faces.length; i++) {
            const face = faces[i];
            const [dx, dy, dz] = face.dir;
            const nx = x + dx;
            const ny = y + dy;
            const nz = z + dz;

            const neighbor = this.world.getBlock(nx, ny, nz);

            if (isBlockSolid(neighbor) && neighbor !== BLOCKS.WATER && neighbor !== BLOCKS.GLASS) continue;

            const startIndex = vertices.length / 3;

            let faceLight = 1.0;
            if (dy > 0) faceLight = 1.1;
            else if (dy < 0) faceLight = 0.8;
            else faceLight = 0.95;

            const fr = Math.floor(r * faceLight);
            const fg = Math.floor(g * faceLight);
            const fb = Math.floor(b * faceLight);

            for (const [vx, vy, vz] of face.verts) {
                vertices.push(x + vx, y + vy, z + vz);
                colors.push(fr, fg, fb);
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

        for (const [key, chunk] of this.world.chunks) {
            const [cx, cz] = key.split(',').map(Number);
            const dist = Math.sqrt((cx - playerChunkX) ** 2 + (cz - playerChunkZ) ** 2);

            if (dist > 10) {
                if (this.chunkMeshes.has(key)) {
                    this.scene.remove(this.chunkMeshes.get(key));
                    this.chunkMeshes.delete(key);
                    chunk.save();
                }
                continue;
            }

            if (!this.chunkMeshes.has(key) && dist <= 8) {
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
        this.waterRenderer.update(this.player.position);
        this.performAutoSave();

        const hit = this.raycastBlock();
        this.blockOutline.update(hit);

        const fps = this.ui.updateFPS();
        this.ui.updateHUD(this.player.position, this.selectedBlockType, fps, this.creativeMode);

        if (this.showDebug) {
            this.debugDisplay.update(this);
        }

        this.renderer.render(this.scene, this.camera);
    }

    performAutoSave() {
        const now = Date.now();
        if (now - this.lastSaveTime > this.autoSaveInterval) {
            this.saveWorld();
            this.lastSaveTime = now;
        }
    }

    updateDayNightCycle() {
        const time = Date.now() * 0.00002;
        const sunY = Math.sin(time) * 120 + 100;
        const sunIntensity = Math.max(0.2, Math.sin(time) + 0.5);

        this.directionalLight.position.set(200, sunY, 200);
        this.directionalLight.intensity = 0.5 + sunIntensity * 0.3;

        const skyColor = new THREE.Color();
        skyColor.setHSL(0.6, 0.4, 0.5 + sunIntensity * 0.3);
        this.scene.background = skyColor;
    }
}

const game = new MinecraftGame();
