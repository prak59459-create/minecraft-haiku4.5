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
        this.renderer.shadowMap.type = THREE.PCFShadowMap;
        this.renderer.setClearAlpha(1);

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
        this.chunksToRebuild = new Set();
        this.chunkMaterial = new THREE.MeshPhongMaterial({
            vertexColors: true,
            wireframe: false,
            flatShading: true,
            side: THREE.FrontSide,
            shininess: 0
        });

        this.raycastDistance = 6;
        this.lastBreakSound = 0;
        this.showDebug = false;
        this.lastChunkUpdateX = -Infinity;
        this.lastChunkUpdateZ = -Infinity;

        this.player.onJump = () => this.audioManager.playJumpSound();

        this.setupLighting();
        this.setupEventListeners();
        this.setupPickBlock();
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
        directionalLight.shadow.camera.left = -256;
        directionalLight.shadow.camera.right = 256;
        directionalLight.shadow.camera.top = 256;
        directionalLight.shadow.camera.bottom = -256;
        this.scene.add(directionalLight);

        this.directionalLight = directionalLight;
        this.scene.fog = new THREE.Fog(0x87CEEB, 300, 1000);
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
                    for (let i = 0; i < this.ui.blocks.length; i++) {
                        if (this.ui.blocks[i] === hit.block) {
                            this.ui.selectBlock(i);
                            break;
                        }
                    }
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
                this.world.setBlock(nx, ny, nz, this.ui.selectedBlock);
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
        const dirX = Math.sin(this.gameCamera.rotation.y) * Math.cos(this.gameCamera.rotation.x);
        const dirY = Math.sin(this.gameCamera.rotation.x);
        const dirZ = Math.cos(this.gameCamera.rotation.y) * Math.cos(this.gameCamera.rotation.x);

        let hit = null;
        const stepSize = 0.1;

        for (let dist = stepSize; dist <= this.raycastDistance; dist += stepSize) {
            const x = eyePos.x + dirX * dist;
            const y = eyePos.y + dirY * dist;
            const z = eyePos.z + dirZ * dist;

            const bx = Math.floor(x);
            const by = Math.floor(y);
            const bz = Math.floor(z);

            const block = this.world.getBlock(bx, by, bz);
            if (isBlockSolid(block)) {
                const prevDist = dist - stepSize;
                const prevX = eyePos.x + dirX * prevDist;
                const prevY = eyePos.y + dirY * prevDist;
                const prevZ = eyePos.z + dirZ * prevDist;

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
                const mesh = this.chunkMeshes.get(key);
                if (mesh) {
                    this.scene.remove(mesh);
                    this.chunkMeshes.delete(key);
                    this.chunksToRebuild.add(key);
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

                    const hexColor = BLOCK_COLORS[blockId] || 0x808080;
                    const baseLight = 0.7;
                    const heightLight = (wy / WORLD_HEIGHT) * 0.3;
                    const varLight = Math.sin(wx * 0.5 + wz * 0.5) * 0.1;
                    const brightness = Math.max(0.3, Math.min(1.0, baseLight + heightLight + varLight));

                    const r = Math.floor((((hexColor >> 16) & 255) * brightness));
                    const g = Math.floor((((hexColor >> 8) & 255) * brightness));
                    const b = Math.floor(((hexColor & 255) * brightness));

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

            const mesh = new THREE.Mesh(geometry, this.chunkMaterial);
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
            const nx = x + dx;
            const ny = y + dy;
            const nz = z + dz;

            const neighbor = this.world.getBlock(nx, ny, nz);
            if (isBlockSolid(neighbor) && neighbor !== BLOCKS.WATER) continue;

            const startIndex = vertices.length / 3;
            for (const [vx, vy, vz] of face.verts) {
                vertices.push(x + vx, y + vy, z + vz);
                colors.push(r, g, b);
            }

            indices.push(startIndex, startIndex + 1, startIndex + 2);
            indices.push(startIndex, startIndex + 2, startIndex + 3);
        }
    }

    updateVisibleChunks() {
        const playerChunkX = Math.floor(this.player.position.x / 16);
        const playerChunkZ = Math.floor(this.player.position.z / 16);
        const RENDER_DIST = 8;

        if (Math.abs(this.lastChunkUpdateX - playerChunkX) > 0.5 || Math.abs(this.lastChunkUpdateZ - playerChunkZ) > 0.5) {
            this.world.updateChunksAround(this.player.position.x, this.player.position.z);
            this.lastChunkUpdateX = playerChunkX;
            this.lastChunkUpdateZ = playerChunkZ;
        }

        const toRemove = [];
        for (const [key, mesh] of this.chunkMeshes) {
            const [cx, cz] = key.split(',').map(Number);
            if (Math.abs(cx - playerChunkX) > RENDER_DIST || Math.abs(cz - playerChunkZ) > RENDER_DIST) {
                this.scene.remove(mesh);
                mesh.geometry.dispose();
                mesh.material.dispose();
                toRemove.push(key);
            }
        }
        toRemove.forEach(key => this.chunkMeshes.delete(key));

        for (const [key, chunk] of this.world.chunks) {
            const [cx, cz] = key.split(',').map(Number);

            if (Math.abs(cx - playerChunkX) > RENDER_DIST || Math.abs(cz - playerChunkZ) > RENDER_DIST) continue;

            if (!this.chunkMeshes.has(key) && !this.chunksToRebuild.has(key)) {
                const mesh = this.buildChunkMesh(chunk);
                if (mesh) {
                    this.scene.add(mesh);
                    this.chunkMeshes.set(key, mesh);
                }
            } else if (this.chunksToRebuild.has(key)) {
                const mesh = this.buildChunkMesh(chunk);
                if (mesh) {
                    this.scene.add(mesh);
                    this.chunkMeshes.set(key, mesh);
                }
                this.chunksToRebuild.delete(key);
            }
        }
    }

    onWindowResize() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        const aspect = width / height;

        if (Math.abs(this.camera.aspect - aspect) > 0.01) {
            this.camera.aspect = aspect;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(width, height);
        }
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

        const cosRotX = Math.cos(this.gameCamera.rotation.x);
        const direction = new THREE.Vector3(
            Math.sin(this.gameCamera.rotation.y) * cosRotX,
            Math.sin(this.gameCamera.rotation.x),
            Math.cos(this.gameCamera.rotation.y) * cosRotX
        );
        this.camera.lookAt(
            eyePos.x + direction.x,
            eyePos.y + direction.y,
            eyePos.z + direction.z
        );

        this.checkUnderwaterEye(eyePos);
        this.updateVisibleChunks();
        this.updateDayNightCycle();
        this.particleSystem.update();
        this.waterRenderer.update();

        const hit = this.raycastBlock();
        this.blockOutline.update(hit);

        const fps = this.ui.updateFPS();
        this.ui.updateHUD(this.player.position, this.ui.selectedBlock, fps);

        if (this.showDebug) {
            this.debugDisplay.update(this);
        }

        this.renderer.render(this.scene, this.camera);
    }

    checkUnderwaterEye(eyePos) {
        const block = this.world.getBlock(Math.floor(eyePos.x), Math.floor(eyePos.y), Math.floor(eyePos.z));
        const isUnderwater = block === BLOCKS.WATER;

        if (isUnderwater) {
            this.scene.fog.far = 80;
            this.scene.background = new THREE.Color(0x1a5f7f);
        } else {
            this.scene.fog.far = 300;
            const time = Date.now() * 0.00002;
            const sunIntensity = Math.max(0.2, Math.sin(time) + 0.5);
            const skyColor = new THREE.Color();
            skyColor.setHSL(0.6, 0.4, 0.5 + sunIntensity * 0.3);
            this.scene.background = skyColor;
        }
    }

    updateDayNightCycle() {
        const time = Date.now() * 0.00002;
        const sunY = Math.sin(time) * 120 + 100;
        const sunIntensity = Math.max(0.2, Math.sin(time) + 0.5);

        this.directionalLight.position.set(200, sunY, 200);
        this.directionalLight.intensity = 0.5 + sunIntensity * 0.3;
    }
}

let game;

try {
    game = new MinecraftGame();
    console.log('Minecraft Haiku 4.5 - Game initialized successfully');
} catch (error) {
    console.error('Failed to initialize game:', error);
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(0, 0, 0, 0.9);
        color: #ff0000;
        padding: 20px;
        border: 2px solid #ff0000;
        font-family: monospace;
        font-size: 14px;
        max-width: 600px;
        white-space: pre-wrap;
        z-index: 1000;
    `;
    errorDiv.textContent = `Game Initialization Error:\n\n${error.message}\n\nStack:\n${error.stack}`;
    document.body.appendChild(errorDiv);
}
