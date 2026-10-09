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
        this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setClearColor(0x87CEEB);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFShadowShadowMap;

        // Load saved settings
        this.loadGameSettings();

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
        this.frameCount = 0;
        this.lastSaveTime = 0;

        this.player.onJump = () => this.audioManager.playJumpSound();

        this.setupLighting();
        this.setupEventListeners();
        this.setupPickBlock();
        this.animate();
    }

    loadGameSettings() {
        try {
            const saved = localStorage.getItem('minecraftSettings');
            if (saved) {
                const settings = JSON.parse(saved);
                this.savedSettings = settings;
            }
        } catch (e) {
            console.warn('Could not load saved settings:', e);
        }
    }

    saveGameSettings() {
        try {
            const now = Date.now();
            if (now - this.lastSaveTime > 5000) {
                const settings = {
                    lastSelectedBlock: this.selectedBlockType,
                    playerPosition: {
                        x: Math.round(this.player.position.x),
                        y: Math.round(this.player.position.y),
                        z: Math.round(this.player.position.z)
                    }
                };
                localStorage.setItem('minecraftSettings', JSON.stringify(settings));
                this.lastSaveTime = now;
            }
        } catch (e) {
            console.warn('Could not save settings:', e);
        }
    }

    setupLighting() {
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(200, 150, 200);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        directionalLight.shadow.camera.far = 500;
        directionalLight.shadow.camera.left = -256;
        directionalLight.shadow.camera.right = 256;
        directionalLight.shadow.camera.top = 256;
        directionalLight.shadow.camera.bottom = -256;
        this.scene.add(directionalLight);

        this.ambientLight = ambientLight;
        this.directionalLight = directionalLight;
    }

    setupEventListeners() {
        window.addEventListener('resize', () => this.onWindowResize());
        document.addEventListener('mousedown', (e) => this.onMouseClick(e));
    }

    setupPickBlock() {
        document.addEventListener('keydown', (e) => {
            const key = e.key.toLowerCase();

            if (key === 'c') {
                const hit = this.raycastBlock();
                if (hit.block !== BLOCKS.AIR && hit.block !== BLOCKS.WATER) {
                    this.selectedBlockType = hit.block;
                }
            }

            // Number keys 1-9 for block selection
            if (key >= '1' && key <= '9') {
                const index = parseInt(key) - 1;
                const slots = document.querySelectorAll('.inventory-slot');
                if (index < slots.length) {
                    const blockId = parseInt(slots[index].dataset.block);
                    this.selectBlock(blockId, index);
                }
            }

            if (e.key === 'F3') {
                e.preventDefault();
                this.showDebug = !this.showDebug;
                this.debugDisplay.toggle();
            }

            if (key === 'h') {
                this.ui.toggleHelp();
            }
        });

        // Scroll wheel for block selection
        window.addEventListener('wheel', (e) => {
            if (document.pointerLockElement !== document.body) return;
            e.preventDefault();

            const slots = document.querySelectorAll('.inventory-slot');
            let currentIndex = -1;
            for (let i = 0; i < slots.length; i++) {
                if (slots[i].classList.contains('selected')) {
                    currentIndex = i;
                    break;
                }
            }

            if (currentIndex >= 0) {
                const newIndex = (currentIndex + (e.deltaY > 0 ? 1 : -1) + slots.length) % slots.length;
                const blockId = parseInt(slots[newIndex].dataset.block);
                this.selectBlock(blockId, newIndex);
            }
        }, { passive: false });
    }

    selectBlock(blockId, slotIndex) {
        this.selectedBlockType = blockId;
        const slots = document.querySelectorAll('.inventory-slot');
        slots.forEach(slot => slot.classList.remove('selected'));
        slots[slotIndex].classList.add('selected');
    }

    onMouseClick(event) {
        if (document.pointerLockElement !== document.body) return;

        const hit = this.raycastBlock();
        if (hit.block === BLOCKS.AIR) return;

        if (event.button === 0) {
            const blockId = hit.block;
            this.world.setBlock(hit.x, hit.y, hit.z, BLOCKS.AIR);
            this.updateChunkMesh(hit.x, hit.y, hit.z);

            const color = BLOCK_COLORS[blockId] || 0x808080;
            this.particleSystem.addBlockBreakParticles(hit.x + 0.5, hit.y + 0.5, hit.z + 0.5, color);

            const now = Date.now();
            if (now - this.lastBreakSound > 50) {
                this.audioManager.playBlockSound('break', blockId);
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
                this.audioManager.playBlockSound('place', this.selectedBlockType);
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
        const cosX = Math.cos(this.gameCamera.rotation.x);
        const direction = {
            x: Math.sin(this.gameCamera.rotation.y) * cosX,
            y: Math.sin(this.gameCamera.rotation.x),
            z: Math.cos(this.gameCamera.rotation.y) * cosX
        };

        const step = 0.05;
        const maxDist = this.raycastDistance;
        let prevBx = Math.floor(eyePos.x);
        let prevBy = Math.floor(eyePos.y);
        let prevBz = Math.floor(eyePos.z);

        for (let dist = step; dist <= maxDist; dist += step) {
            const x = eyePos.x + direction.x * dist;
            const y = eyePos.y + direction.y * dist;
            const z = eyePos.z + direction.z * dist;

            const bx = Math.floor(x);
            const by = Math.floor(y);
            const bz = Math.floor(z);

            const block = this.world.getBlock(bx, by, bz);
            if (isBlockSolid(block)) {
                let normal = { x: 0, y: 0, z: 0 };
                if (prevBx !== bx) normal.x = prevBx < bx ? -1 : 1;
                else if (prevBy !== by) normal.y = prevBy < by ? -1 : 1;
                else if (prevBz !== bz) normal.z = prevBz < bz ? -1 : 1;

                return { x: bx, y: by, z: bz, block, normal, dist };
            }

            prevBx = bx;
            prevBy = by;
            prevBz = bz;
        }

        return { x: 0, y: 0, z: 0, block: BLOCKS.AIR, normal: { x: 0, y: 1, z: 0 }, dist: maxDist };
    }

    updateChunkMesh(x, y, z) {
        const cx = Math.floor(x / 16);
        const cz = Math.floor(z / 16);

        for (let dx = -1; dx <= 1; dx++) {
            for (let dz = -1; dz <= 1; dz++) {
                const key = `${cx + dx},${cz + dz}`;
                if (this.chunkMeshes.has(key)) {
                    const mesh = this.chunkMeshes.get(key);
                    this.scene.remove(mesh);
                    if (mesh.geometry) {
                        mesh.geometry.dispose();
                    }
                    if (mesh.material) {
                        mesh.material.dispose();
                    }
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
        const worldChunkX = chunk.x * CHUNK_SIZE;
        const worldChunkZ = chunk.z * CHUNK_SIZE;

        // Precalculate lighting values
        const getLighting = (wx, wy) => {
            const baseLight = 0.7;
            const heightLight = (wy / WORLD_HEIGHT) * 0.3;
            const varLight = Math.sin(wx * 0.5 + (chunk.z * CHUNK_SIZE) * 0.5) * 0.1;
            return Math.min(1.0, baseLight + heightLight + varLight);
        };

        for (let x = 0; x < CHUNK_SIZE; x++) {
            for (let y = 1; y < WORLD_HEIGHT; y++) {
                for (let z = 0; z < CHUNK_SIZE; z++) {
                    const blockId = chunk.getBlock(x, y, z);
                    if (blockId === BLOCKS.AIR) continue;

                    const wx = worldChunkX + x;
                    const wy = y;
                    const wz = worldChunkZ + z;

                    const baseColor = BLOCK_COLORS[blockId];
                    const color = new THREE.Color(baseColor);
                    const brightness = getLighting(wx, wy);

                    color.multiplyScalar(brightness);

                    this.addBlockFaces(vertices, colors, indices, wx, wy, wz, blockId, color, chunk);
                }
            }
        }

        if (vertices.length > 0) {
            geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(vertices), 3));
            geometry.setAttribute('color', new THREE.BufferAttribute(new Uint8Array(colors), 3, true));
            geometry.setIndex(new THREE.BufferAttribute(new Uint32Array(indices), 1));
            geometry.computeVertexNormals();

            const material = new THREE.MeshPhongMaterial({
                vertexColors: true,
                flatShading: false,
                side: THREE.FrontSide,
                shininess: 30
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
        const faces = [
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

        for (const face of faces) {
            const [dx, dy, dz] = face.dir;
            const neighbor = this.world.getBlock(x + dx, y + dy, z + dz);

            // Skip if neighbor is solid and not water
            if (isBlockSolid(neighbor) && neighbor !== BLOCKS.WATER) continue;

            const startIndex = vertices.length / 3;
            const verts = face.verts;

            for (let i = 0; i < 4; i++) {
                const [vx, vy, vz] = verts[i];
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
        const renderDistance = 8;

        this.world.updateChunksAround(this.player.position.x, this.player.position.z);

        const meshesToRemove = [];
        for (const [key, mesh] of this.chunkMeshes) {
            const [cx, cz] = key.split(',').map(Number);
            if (Math.abs(cx - playerChunkX) > renderDistance || Math.abs(cz - playerChunkZ) > renderDistance) {
                this.scene.remove(mesh);
                if (mesh.geometry) mesh.geometry.dispose();
                if (mesh.material) mesh.material.dispose();
                meshesToRemove.push(key);
            }
        }
        meshesToRemove.forEach(key => this.chunkMeshes.delete(key));

        for (const [key, chunk] of this.world.chunks) {
            const [cx, cz] = key.split(',').map(Number);
            if (Math.abs(cx - playerChunkX) <= renderDistance && !this.chunkMeshes.has(key)) {
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

        try {
            this.player.update();
            this.gameCamera.updateFromPlayer(this.player);

            const eyePos = this.player.getEyePosition();
            this.camera.position.set(eyePos.x, eyePos.y, eyePos.z);

            const cosX = Math.cos(this.gameCamera.rotation.x);
            const direction = new THREE.Vector3(
                Math.sin(this.gameCamera.rotation.y) * cosX,
                Math.sin(this.gameCamera.rotation.x),
                Math.cos(this.gameCamera.rotation.y) * cosX
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

            const hit = this.raycastBlock();
            this.blockOutline.update(hit);

            const fps = this.ui.updateFPS();
            this.ui.updateHUD(this.player.position, this.selectedBlockType, fps);

            if (this.showDebug) {
                this.debugDisplay.update(this);
            }

            this.renderer.render(this.scene, this.camera);
            this.saveGameSettings();
        } catch (error) {
            console.error('Game loop error:', error);
        }
    }

    updateDayNightCycle() {
        const time = Date.now() * 0.00001;
        const sunY = Math.sin(time) * 120 + 120;
        const sunX = Math.cos(time) * 200;
        const sunZ = Math.sin(time) * 100 + 100;
        const sunIntensity = Math.max(0.25, Math.sin(time) + 0.5);

        this.directionalLight.position.set(sunX, sunY, sunZ);
        this.directionalLight.intensity = 0.6 + sunIntensity * 0.2;

        const ambientIntensity = 0.4 + sunIntensity * 0.2;
        this.ambientLight.intensity = ambientIntensity;

        const hue = 0.6;
        const saturation = 0.5 - sunIntensity * 0.2;
        const lightness = 0.4 + sunIntensity * 0.35;
        const skyColor = new THREE.Color();
        skyColor.setHSL(hue, saturation, lightness);
        this.scene.background = skyColor;
    }
}

const game = new MinecraftGame();
