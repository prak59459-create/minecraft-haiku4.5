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
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.05, 1200);
        this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true, powerPreference: 'high-performance' });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setClearColor(0x87CEEB);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFShadowShadowMap;
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;

        this.world = new World(12);
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
        this.frameCounter = 0;
        this.targetFPS = 60;

        this.lastRaycastResult = null;
        this.lastRaycastPlayerPos = null;
        this.colorCache = new Map();

        this.player.onJump = () => this.audioManager.playJumpSound();

        this.setupLighting();
        this.setupEventListeners();
        this.setupPickBlock();
        this.animate();
    }

    setupLighting() {
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.55);
        this.scene.add(ambientLight);
        this.ambientLight = ambientLight;

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.65);
        directionalLight.position.set(150, 120, 150);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 500;
        directionalLight.shadow.camera.left = -200;
        directionalLight.shadow.camera.right = 200;
        directionalLight.shadow.camera.top = 200;
        directionalLight.shadow.camera.bottom = -200;
        directionalLight.shadow.bias = -0.0001;
        this.scene.add(directionalLight);

        this.directionalLight = directionalLight;

        this.createSkyDome();
    }

    createSkyDome() {
        const skyGeometry = new THREE.SphereGeometry(500, 32, 32);
        const skyMaterial = new THREE.MeshBasicMaterial({
            side: THREE.BackSide,
            fog: false
        });
        this.skyDome = new THREE.Mesh(skyGeometry, skyMaterial);
        this.skyDome.position.y = 100;
        this.scene.add(this.skyDome);
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
                    const blockName = BLOCK_NAMES[hit.block] || 'Unknown';
                    console.log(`Selected: ${blockName}`);
                }
            }
            if (e.key === 'F3' || e.key === 'f3') {
                e.preventDefault();
                this.showDebug = !this.showDebug;
                this.debugDisplay.toggle();
            }
            if (e.key === 'h' || e.key === 'H') {
                this.ui.toggleHelp();
            }
            if (e.key === 'Escape') {
                if (document.pointerLockElement === document.body) {
                    document.exitPointerLock();
                }
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

        const playerPosDist = Math.hypot(
            eyePos.x - (this.lastRaycastPlayerPos?.x || eyePos.x),
            eyePos.y - (this.lastRaycastPlayerPos?.y || eyePos.y),
            eyePos.z - (this.lastRaycastPlayerPos?.z || eyePos.z)
        );

        if (this.lastRaycastResult && playerPosDist < 0.1 &&
            Math.abs(this.gameCamera.rotation.x - (this.lastRaycastResult.cameraRotX || 0)) < 0.02 &&
            Math.abs(this.gameCamera.rotation.y - (this.lastRaycastResult.cameraRotY || 0)) < 0.02) {
            return this.lastRaycastResult;
        }

        const direction = new THREE.Vector3(
            Math.sin(this.gameCamera.rotation.y) * Math.cos(this.gameCamera.rotation.x),
            Math.sin(this.gameCamera.rotation.x),
            Math.cos(this.gameCamera.rotation.y) * Math.cos(this.gameCamera.rotation.x)
        );

        let hit = null;
        let prevBlockCoords = { x: Math.floor(eyePos.x), y: Math.floor(eyePos.y), z: Math.floor(eyePos.z) };

        for (let dist = 0.1; dist <= this.raycastDistance; dist += 0.1) {
            const x = eyePos.x + direction.x * dist;
            const y = eyePos.y + direction.y * dist;
            const z = eyePos.z + direction.z * dist;

            const bx = Math.floor(x);
            const by = Math.floor(y);
            const bz = Math.floor(z);

            const block = this.world.getBlock(bx, by, bz);
            if (isBlockSolid(block)) {
                let normal = { x: 0, y: 0, z: 0 };
                if (prevBlockCoords.x !== bx) normal.x = prevBlockCoords.x < bx ? -1 : 1;
                else if (prevBlockCoords.y !== by) normal.y = prevBlockCoords.y < by ? -1 : 1;
                else if (prevBlockCoords.z !== bz) normal.z = prevBlockCoords.z < bz ? -1 : 1;

                hit = { x: bx, y: by, z: bz, block, normal, dist, cameraRotX: this.gameCamera.rotation.x, cameraRotY: this.gameCamera.rotation.y };
                break;
            }
            prevBlockCoords = { x: bx, y: by, z: bz };
        }

        if (!hit) {
            hit = { x: 0, y: 0, z: 0, block: BLOCKS.AIR, normal: { x: 0, y: 1, z: 0 }, dist: this.raycastDistance, cameraRotX: this.gameCamera.rotation.x, cameraRotY: this.gameCamera.rotation.y };
        }

        this.lastRaycastResult = hit;
        this.lastRaycastPlayerPos = { x: eyePos.x, y: eyePos.y, z: eyePos.z };
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

                    const cacheKey = `${blockId}_${wy}`;
                    let color;
                    if (this.colorCache.has(cacheKey)) {
                        color = this.colorCache.get(cacheKey);
                    } else {
                        color = new THREE.Color(BLOCK_COLORS[blockId]);
                        const baseLight = 0.75;
                        const heightLight = (wy / WORLD_HEIGHT) * 0.25;
                        const varLight = Math.sin(wx * 0.3 + wz * 0.3) * 0.08;
                        const brightness = Math.min(1, baseLight + heightLight + varLight);
                        color.multiplyScalar(brightness);
                        this.colorCache.set(cacheKey, color);
                    }

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
                flatShading: false,
                side: THREE.FrontSide,
                shininess: 25,
                fog: false
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

        const r = Math.floor(color.r * 255);
        const g = Math.floor(color.g * 255);
        const b = Math.floor(color.b * 255);

        for (const face of faces) {
            const [dx, dy, dz] = face.dir;
            const nx = x + dx;
            const ny = y + dy;
            const nz = z + dz;

            const neighbor = this.world.getBlock(nx, ny, nz);
            if (isBlockSolid(neighbor) && neighbor !== BLOCKS.WATER) continue;

            const startIndex = vertices.length / 3;

            const aoFactor = 0.92 + Math.random() * 0.08;
            const finalR = Math.floor(r * aoFactor);
            const finalG = Math.floor(g * aoFactor);
            const finalB = Math.floor(b * aoFactor);

            for (const [vx, vy, vz] of face.verts) {
                vertices.push(x + vx, y + vy, z + vz);
                colors.push(finalR, finalG, finalB);
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

        const chunksToProcess = [];
        for (const [key, chunk] of this.world.chunks) {
            const [cx, cz] = key.split(',').map(Number);

            if (Math.abs(cx - playerChunkX) > 8 || Math.abs(cz - playerChunkZ) > 8) {
                if (this.chunkMeshes.has(key)) {
                    this.scene.remove(this.chunkMeshes.get(key));
                    this.chunkMeshes.delete(key);
                }
                continue;
            }

            if (!this.chunkMeshes.has(key)) {
                const dist = Math.hypot(cx - playerChunkX, cz - playerChunkZ);
                chunksToProcess.push({ key, chunk, dist });
            }
        }

        chunksToProcess.sort((a, b) => a.dist - b.dist);

        for (const { key, chunk } of chunksToProcess) {
            const mesh = this.buildChunkMesh(chunk);
            if (mesh) {
                this.scene.add(mesh);
                this.chunkMeshes.set(key, mesh);
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
        this.waterRenderer.update();

        const hit = this.raycastBlock();
        this.blockOutline.update(hit);

        const fps = this.ui.updateFPS();
        this.ui.updateHUD(this.player.position, this.selectedBlockType, fps);

        if (this.showDebug) {
            this.debugDisplay.update(this);
        }

        if (Math.random() < 0.01) {
            if (this.colorCache.size > 1000) {
                const entriesToDelete = this.colorCache.size - 800;
                let deleted = 0;
                for (const [key] of this.colorCache) {
                    if (deleted >= entriesToDelete) break;
                    this.colorCache.delete(key);
                    deleted++;
                }
            }
        }

        this.renderer.render(this.scene, this.camera);
    }

    updateDayNightCycle() {
        const time = Date.now() * 0.00002;
        const sunCycle = Math.sin(time);
        const sunY = Math.sin(time) * 140 + 120;

        let sunIntensity = Math.max(0.15, sunCycle + 0.5);
        if (sunIntensity < 0.25) {
            sunIntensity = sunIntensity * 0.5;
        }

        this.directionalLight.position.set(250, sunY, 250);
        this.directionalLight.intensity = 0.4 + sunIntensity * 0.35;

        if (this.ambientLight) {
            this.ambientLight.intensity = 0.45 + sunIntensity * 0.25;
        }

        const skyBrightness = Math.max(0.2, sunIntensity);
        const skyColor = new THREE.Color();

        if (sunCycle > 0.3) {
            skyColor.setHSL(0.58, 0.6, 0.45 + skyBrightness * 0.35);
        } else if (sunCycle > -0.3) {
            const twilightFactor = Math.abs(sunCycle);
            const twilightHue = 0.85 + (1 - twilightFactor) * 0.1;
            skyColor.setHSL(twilightHue, 0.8, 0.25 + twilightFactor * 0.3);
        } else {
            skyColor.setHSL(0.65, 0.2, 0.08 + sunIntensity * 0.12);
        }

        this.scene.background = skyColor;
        if (this.skyDome) {
            this.skyDome.material.color.copy(skyColor);
            this.skyDome.position.copy(this.camera.position);
        }
    }
}

const game = new MinecraftGame();
