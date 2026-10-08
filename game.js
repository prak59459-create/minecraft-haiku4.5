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
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1500);
        this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true, alpha: false });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setClearColor(0x87CEEB);
        this.renderer.shadowMap.enabled = false;

        this.world = new World();
        this.player = new Player(this.world);
        this.findSpawnLocation();
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
        this.chunksNeedingMesh = new Set();

        this.player.onJump = () => this.audioManager.playJumpSound();

        this.world.onChunkGenerated = (chunk) => {
            const key = `${chunk.x},${chunk.z}`;
            this.chunksNeedingMesh.add(key);
        };

        this.setupLighting();
        this.setupEventListeners();
        this.setupPickBlock();
        this.animate();
    }

    findSpawnLocation() {
        for (let y = 200; y > 0; y--) {
            const block = this.world.getBlock(8, y, 8);
            const blockBelow = this.world.getBlock(8, y - 1, 8);
            if (isBlockSolid(blockBelow) && !isBlockSolid(block)) {
                this.player.position.y = y + 1;
                return;
            }
        }
        this.player.position.y = 100;
    }

    setupLighting() {
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(200, 150, 200);
        directionalLight.castShadow = false;
        directionalLight.shadow.mapSize.width = 1024;
        directionalLight.shadow.mapSize.height = 1024;
        directionalLight.shadow.camera.far = 400;
        directionalLight.shadow.camera.left = -200;
        directionalLight.shadow.camera.right = 200;
        directionalLight.shadow.camera.top = 200;
        directionalLight.shadow.camera.bottom = -200;
        this.scene.add(directionalLight);

        this.directionalLight = directionalLight;
        this.ambientLight = ambientLight;
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
            if (e.key === 'F3' || e.key === 'F3') {
                e.preventDefault();
                this.showDebug = !this.showDebug;
                this.debugDisplay.toggle();
            }
            if (e.key === 'h' || e.key === 'H') {
                this.ui.toggleHelp();
            }
            if (e.key === 'Escape') {
                document.exitPointerLock = document.exitPointerLock || document.mozExitPointerLock;
                document.exitPointerLock();
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

        let hit = null;
        let prevBlock = null;

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

                if (prevBlock) {
                    if (prevBlock.x !== bx) normal.x = prevBlock.x < bx ? -1 : 1;
                    else if (prevBlock.y !== by) normal.y = prevBlock.y < by ? -1 : 1;
                    else if (prevBlock.z !== bz) normal.z = prevBlock.z < bz ? -1 : 1;
                } else {
                    normal.y = 1;
                }

                hit = { x: bx, y: by, z: bz, block, normal, dist };
                break;
            }

            prevBlock = { x: bx, y: by, z: bz };
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

                    const baseLight = 0.75;
                    const heightLight = Math.min(0.25, (wy / WORLD_HEIGHT) * 0.35);
                    const varLight = Math.sin(wx * 0.3 + wz * 0.3) * 0.08;
                    const ambientOcclusion = this.getAmbientOcclusion(chunk, x, y, z);
                    const brightness = (baseLight + heightLight + varLight) * ambientOcclusion;

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

            const material = new THREE.MeshPhongMaterial({
                vertexColors: true,
                wireframe: false,
                flatShading: true,
                side: THREE.FrontSide,
                shininess: 10
            });
            const mesh = new THREE.Mesh(geometry, material);
            mesh.castShadow = false;
            mesh.receiveShadow = false;
            mesh.frustumCulled = true;
            return mesh;
        }

        return null;
    }

    getAmbientOcclusion(chunk, x, y, z) {
        let count = 0;

        const neighbors = [
            [x+1, y, z], [x-1, y, z],
            [x, y+1, z], [x, y-1, z],
            [x, y, z+1], [x, y, z-1]
        ];

        for (const [nx, ny, nz] of neighbors) {
            if (isBlockSolid(chunk.getBlock(nx, ny, nz))) count++;
        }

        return Math.max(0.4, 1 - (count * 0.14));
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
            for (const [vx, vy, vz] of face.verts) {
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

        for (const [key, chunk] of this.world.chunks) {
            const [cx, cz] = key.split(',').map(Number);

            if (Math.abs(cx - playerChunkX) > 8 || Math.abs(cz - playerChunkZ) > 8) {
                if (this.chunkMeshes.has(key)) {
                    const mesh = this.chunkMeshes.get(key);
                    this.scene.remove(mesh);
                    mesh.geometry.dispose();
                    mesh.material.dispose();
                    this.chunkMeshes.delete(key);
                }
                continue;
            }

            if (!this.chunkMeshes.has(key) && chunk.generated) {
                const mesh = this.buildChunkMesh(chunk);
                if (mesh) {
                    mesh.position.set(chunk.x * 16, 0, chunk.z * 16);
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

        if (this.chunksNeedingMesh.size > 0) {
            const chunk = Array.from(this.chunksNeedingMesh).shift();
            this.chunksNeedingMesh.delete(chunk);
            const [cx, cz] = chunk.split(',').map(Number);
            const chunkObj = this.world.chunks.get(chunk);
            if (chunkObj && chunkObj.generated) {
                const mesh = this.buildChunkMesh(chunkObj);
                if (mesh) {
                    mesh.position.set(cx * 16, 0, cz * 16);
                    this.scene.add(mesh);
                    if (this.chunkMeshes.has(chunk)) {
                        const oldMesh = this.chunkMeshes.get(chunk);
                        this.scene.remove(oldMesh);
                        oldMesh.geometry.dispose();
                        oldMesh.material.dispose();
                    }
                    this.chunkMeshes.set(chunk, mesh);
                }
            }
        }

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
    }

    updateDayNightCycle() {
        const time = Date.now() * 0.000015;
        const sunY = Math.sin(time) * 120 + 120;
        const sunX = Math.cos(time) * 120;
        const sunIntensity = Math.max(0.15, Math.sin(time) + 0.5);

        this.directionalLight.position.set(sunX, sunY, 150);
        this.directionalLight.intensity = 0.7 + sunIntensity * 0.3;

        this.ambientLight.intensity = 0.4 + sunIntensity * 0.3;

        const hue = 0.58 + (Math.sin(time) * 0.05);
        const sat = 0.5 - (sunIntensity * 0.2);
        const light = 0.45 + (sunIntensity * 0.35);

        const skyColor = new THREE.Color();
        skyColor.setHSL(hue, sat, light);
        this.scene.background = skyColor;
    }
}

const game = new MinecraftGame();
