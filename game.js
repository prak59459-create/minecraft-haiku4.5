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
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true,
            precision: 'highp',
            powerPreference: 'high-performance'
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.setClearColor(0x87CEEB);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFShadowShadowMap;
        this.renderer.sortObjects = false;

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
        this.colorCache = new Map();
        this.selectedBlockType = BLOCKS.STONE;
        this.raycastDistance = 6;
        this.lastBreakSound = 0;
        this.showDebug = false;

        this.player.onJump = () => this.audioManager.playJumpSound();

        this.setupLighting();
        this.setupEventListeners();
        this.setupPickBlock();
        this.syncBlockSelection();
        this.animate();
    }

    syncBlockSelection() {
        const slots = document.querySelectorAll('.inventory-slot');
        slots.forEach((slot, index) => {
            slot.addEventListener('click', () => {
                this.selectedBlockType = parseInt(slot.dataset.block);
            });
        });

        document.addEventListener('keydown', (e) => {
            const num = parseInt(e.key);
            if (num >= 1 && num <= 9) {
                const slots = document.querySelectorAll('.inventory-slot');
                if (slots[num - 1]) {
                    this.selectedBlockType = parseInt(slots[num - 1].dataset.block);
                }
            }
        });

        document.addEventListener('wheel', (e) => {
            if (document.pointerLockElement !== document.body) return;
            e.preventDefault();
            const slots = document.querySelectorAll('.inventory-slot');
            const direction = e.deltaY > 0 ? 1 : -1;
            let currentIdx = -1;
            for (let i = 0; i < slots.length; i++) {
                if (slots[i].classList.contains('selected')) {
                    currentIdx = i;
                    break;
                }
            }
            let newIdx = currentIdx + direction;
            if (newIdx < 0) newIdx = slots.length - 1;
            if (newIdx >= slots.length) newIdx = 0;
            this.selectedBlockType = parseInt(slots[newIdx].dataset.block);
        }, { passive: false });
    }

    setupLighting() {
        const time = Date.now() * 0.0001;
        const sunY = Math.sin(time) * 100 + 100;
        const sunIntensity = Math.max(0.3, Math.sin(time) + 0.5);

        this.ambientLight = new THREE.AmbientLight(0xffffff, 0.45 + sunIntensity * 0.15);
        this.scene.add(this.ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.65 + sunIntensity * 0.25);
        directionalLight.position.set(200, sunY, 200);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        directionalLight.shadow.camera.far = 600;
        directionalLight.shadow.camera.near = 0.1;
        directionalLight.shadow.bias = -0.001;
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
            this.world.setBlock(hit.x, hit.y, hit.z, BLOCKS.AIR);
            this.updateChunkMesh(hit.x, hit.y, hit.z);

            const color = BLOCK_COLORS[hit.block] || 0x808080;
            this.particleSystem.addBlockBreakParticles(hit.x + 0.5, hit.y + 0.5, hit.z + 0.5, color);

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

        const stepSize = 0.05;
        let lastBx = Math.floor(eyePos.x);
        let lastBy = Math.floor(eyePos.y);
        let lastBz = Math.floor(eyePos.z);

        for (let dist = stepSize; dist <= this.raycastDistance; dist += stepSize) {
            const x = eyePos.x + direction.x * dist;
            const y = eyePos.y + direction.y * dist;
            const z = eyePos.z + direction.z * dist;

            const bx = Math.floor(x);
            const by = Math.floor(y);
            const bz = Math.floor(z);

            if (bx === lastBx && by === lastBy && bz === lastBz) continue;

            const block = this.world.getBlock(bx, by, bz);
            if (isBlockSolid(block)) {
                let normal = { x: 0, y: 0, z: 0 };
                if (lastBx !== bx) normal.x = lastBx < bx ? -1 : 1;
                else if (lastBy !== by) normal.y = lastBy < by ? -1 : 1;
                else if (lastBz !== bz) normal.z = lastBz < bz ? -1 : 1;

                return { x: bx, y: by, z: bz, block, normal, dist };
            }

            lastBx = bx;
            lastBy = by;
            lastBz = bz;
        }

        return { x: 0, y: 0, z: 0, block: BLOCKS.AIR, normal: { x: 0, y: 1, z: 0 }, dist: this.raycastDistance };
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
                    if (mesh.geometry) mesh.geometry.dispose();
                    if (mesh.material) mesh.material.dispose();
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

                    const baseLight = 0.65;
                    const heightLight = Math.min((wy / WORLD_HEIGHT) * 0.35, 0.35);
                    const varLight = Math.sin(wx * 0.5 + wz * 0.5) * 0.08;
                    const brightness = baseLight + heightLight + varLight;

                    const r = Math.floor((BLOCK_COLORS[blockId] >> 16 & 255) * brightness);
                    const g = Math.floor((BLOCK_COLORS[blockId] >> 8 & 255) * brightness);
                    const b = Math.floor((BLOCK_COLORS[blockId] & 255) * brightness);

                    this.addBlockFaces(vertices, colors, indices, wx, wy, wz, blockId, r, g, b, chunk);
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
                flatShading: false,
                side: THREE.FrontSide,
                shininess: 25,
                fog: true
            });
            const mesh = new THREE.Mesh(geometry, material);
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            mesh.frustumCulled = true;
            return mesh;
        }

        return null;
    }

    addBlockFaces(vertices, colors, indices, x, y, z, blockId, r, g, b, chunk) {
        const faces = [
            { dir: [1, 0, 0], verts: [[0, 0, 0], [0, 1, 0], [0, 1, 1], [0, 0, 1]] },
            { dir: [-1, 0, 0], verts: [[1, 0, 1], [1, 1, 1], [1, 1, 0], [1, 0, 0]] },
            { dir: [0, 1, 0], verts: [[0, 1, 1], [0, 1, 0], [1, 1, 0], [1, 1, 1]] },
            { dir: [0, -1, 0], verts: [[0, 0, 0], [0, 0, 1], [1, 0, 1], [1, 0, 0]] },
            { dir: [0, 0, 1], verts: [[1, 0, 0], [1, 1, 0], [0, 1, 0], [0, 0, 0]] },
            { dir: [0, 0, -1], verts: [[0, 0, 1], [0, 1, 1], [1, 1, 1], [1, 0, 1]] }
        ];

        for (const face of faces) {
            const [dx, dy, dz] = face.dir;
            const neighbor = this.world.getBlock(x + dx, y + dy, z + dz);
            if (isBlockSolid(neighbor) && neighbor !== BLOCKS.WATER) continue;

            const startIndex = vertices.length / 3;
            for (const [vx, vy, vz] of face.verts) {
                vertices.push(x + vx, y + vy, z + vz);
                colors.push(r, g, b);
            }

            indices.push(startIndex, startIndex + 1, startIndex + 2);
            indices.push(startIndex, startIndex + 2, startIndex + 3);
        }

        return true;
    }

    updateVisibleChunks() {
        const playerChunkX = Math.floor(this.player.position.x / 16);
        const playerChunkZ = Math.floor(this.player.position.z / 16);

        this.world.updateChunksAround(this.player.position.x, this.player.position.z);

        const renderDistance = 8;
        const unloadDistance = 10;

        for (const [key, chunk] of this.world.chunks) {
            const [cx, cz] = key.split(',').map(Number);
            const dist = Math.abs(cx - playerChunkX) + Math.abs(cz - playerChunkZ);

            if (dist > unloadDistance) {
                if (this.chunkMeshes.has(key)) {
                    const mesh = this.chunkMeshes.get(key);
                    this.scene.remove(mesh);
                    if (mesh.geometry) mesh.geometry.dispose();
                    if (mesh.material) mesh.material.dispose();
                    this.chunkMeshes.delete(key);
                }
                continue;
            }

            if (dist <= renderDistance) {
                if (!this.chunkMeshes.has(key)) {
                    const mesh = this.buildChunkMesh(chunk);
                    if (mesh) {
                        this.scene.add(mesh);
                        this.chunkMeshes.set(key, mesh);
                    }
                }
            } else if (this.chunkMeshes.has(key)) {
                const mesh = this.chunkMeshes.get(key);
                this.scene.remove(mesh);
                if (mesh.geometry) mesh.geometry.dispose();
                if (mesh.material) mesh.material.dispose();
                this.chunkMeshes.delete(key);
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

        const startTime = performance.now();

        this.player.update();
        this.gameCamera.updateFromPlayer(this.player);

        const eyePos = this.player.getEyePosition();
        const bob = this.player.cameraBob || 0;
        this.camera.position.set(eyePos.x, eyePos.y + bob, eyePos.z);

        const targetFOV = this.player.isSprinting ? 85 : 75;
        this.camera.fov += (targetFOV - this.camera.fov) * 0.15;
        this.camera.updateProjectionMatrix();

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

        const hit = this.raycastBlock();
        this.blockOutline.update(hit);

        const fps = this.ui.updateFPS();
        this.ui.updateHUD(this.player.position, this.selectedBlockType, fps);

        if (this.showDebug) {
            this.debugDisplay.update(this);
        }

        this.renderer.render(this.scene, this.camera);

        const frameTime = performance.now() - startTime;
        if (frameTime > 20) {
            console.debug(`Frame took ${frameTime.toFixed(1)}ms`);
        }
    }

    updateDayNightCycle() {
        const time = Date.now() * 0.00002;
        const sunY = Math.sin(time) * 120 + 100;
        const sunIntensity = Math.max(0.2, Math.sin(time) + 0.5);
        const timeOfDay = (time % (Math.PI * 2)) / (Math.PI * 2);

        this.directionalLight.position.set(200, sunY, 200);
        this.directionalLight.intensity = 0.5 + sunIntensity * 0.35;
        this.ambientLight.intensity = 0.4 + sunIntensity * 0.15;

        let skyColor = new THREE.Color();
        if (timeOfDay < 0.25) {
            skyColor.setHSL(0.6, 0.5, 0.4);
        } else if (timeOfDay < 0.35) {
            const t = (timeOfDay - 0.25) / 0.1;
            skyColor.setHSL(0.6, 0.5, 0.4 + t * 0.3);
        } else if (timeOfDay < 0.65) {
            skyColor.setHSL(0.6, 0.4, 0.65 + sunIntensity * 0.15);
        } else if (timeOfDay < 0.75) {
            const t = (timeOfDay - 0.65) / 0.1;
            skyColor.setHSL(0.05, 0.6, 0.6 - t * 0.3);
        } else {
            skyColor.setHSL(0.8, 0.3, 0.15);
        }
        this.scene.background = skyColor;

        const fogColor = skyColor.clone();
        this.scene.fog = new THREE.Fog(fogColor, 300, 50);
    }
}

const game = new MinecraftGame();
