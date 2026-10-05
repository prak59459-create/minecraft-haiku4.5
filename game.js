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
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFShadowShadowMap;
        this.renderer.shadowMap.autoUpdate = true;
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
        this.cloudMesh = null;

        this.player.onJump = () => this.audioManager.playJumpSound();

        this.setupLighting();
        this.createClouds();
        this.setupEventListeners();
        this.setupPickBlock();
        this.animate();
    }

    createClouds() {
        const cloudGeometry = new THREE.BufferGeometry();
        const cloudPositions = [];
        const SimplexNoise = window.SimplexNoise;

        if (!SimplexNoise) return;

        const noise = new SimplexNoise();
        const cloudScale = 20;
        const cloudHeight = 120;
        const gridSize = 8;

        for (let x = -gridSize; x < gridSize; x++) {
            for (let z = -gridSize; z < gridSize; z++) {
                const noisVal = noise.noise2D(x * 0.1, z * 0.1);
                if (noisVal > 0.3) {
                    const px = x * cloudScale;
                    const pz = z * cloudScale;
                    cloudPositions.push(px, cloudHeight, pz);
                }
            }
        }

        if (cloudPositions.length > 0) {
            cloudGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(cloudPositions), 3));
            const cloudMaterial = new THREE.PointsMaterial({
                color: 0xffffff,
                size: 25,
                sizeAttenuation: true,
                transparent: true,
                opacity: 0.6
            });

            this.cloudMesh = new THREE.Points(cloudGeometry, cloudMaterial);
            this.scene.add(this.cloudMesh);
        }
    }

    setupLighting() {
        const time = Date.now() * 0.0001;
        const sunY = Math.sin(time) * 100 + 100;
        const sunIntensity = Math.max(0.2, Math.sin(time) + 0.5);

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.4 + sunIntensity * 0.15);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5 + sunIntensity * 0.35);
        directionalLight.position.set(150, sunY, 150);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        directionalLight.shadow.camera.far = 500;
        directionalLight.shadow.bias = -0.0005;
        this.scene.add(directionalLight);

        this.scene.fog = new THREE.Fog(0x87CEEB, 200, 400);

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
                    this.audioManager.playBlockSound('place');
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

        const slots = document.querySelectorAll('.inventory-slot');
        slots.forEach((slot, index) => {
            slot.addEventListener('click', () => {
                const blockId = parseInt(slot.dataset.block);
                this.selectedBlockType = blockId;
            });
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
            for (let i = 0; i < 2; i++) {
                this.particleSystem.addBlockBreakParticles(hit.x + 0.5, hit.y + 0.5, hit.z + 0.5, color);
            }

            const now = Date.now();
            if (now - this.lastBreakSound > 80) {
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

                const color = BLOCK_COLORS[this.selectedBlockType] || 0x808080;
                for (let i = 0; i < 2; i++) {
                    this.particleSystem.addBlockPlaceParticles(nx + 0.5, ny + 0.5, nz + 0.5, color);
                }

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
        const dir = new THREE.Vector3(
            Math.sin(this.gameCamera.rotation.y) * Math.cos(this.gameCamera.rotation.x),
            Math.sin(this.gameCamera.rotation.x),
            Math.cos(this.gameCamera.rotation.y) * Math.cos(this.gameCamera.rotation.x)
        );

        let x = Math.floor(eyePos.x);
        let y = Math.floor(eyePos.y);
        let z = Math.floor(eyePos.z);

        const stepX = dir.x > 0 ? 1 : dir.x < 0 ? -1 : 0;
        const stepY = dir.y > 0 ? 1 : dir.y < 0 ? -1 : 0;
        const stepZ = dir.z > 0 ? 1 : dir.z < 0 ? -1 : 0;

        const tDeltaX = Math.abs(1 / (dir.x || 0.0001));
        const tDeltaY = Math.abs(1 / (dir.y || 0.0001));
        const tDeltaZ = Math.abs(1 / (dir.z || 0.0001));

        let tMaxX = (stepX > 0) ? tDeltaX * 0.5 : (stepX < 0) ? tDeltaX * 0.5 : Infinity;
        let tMaxY = (stepY > 0) ? tDeltaY * 0.5 : (stepY < 0) ? tDeltaY * 0.5 : Infinity;
        let tMaxZ = (stepZ > 0) ? tDeltaZ * 0.5 : (stepZ < 0) ? tDeltaZ * 0.5 : Infinity;

        let hit = null;
        let normal = { x: 0, y: 0, z: 0 };

        for (let i = 0; i < this.raycastDistance * 20; i++) {
            const block = this.world.getBlock(x, y, z);
            if (isBlockSolid(block)) {
                hit = { x, y, z, block, normal, dist: i * 0.05 };
                break;
            }

            if (tMaxX < tMaxY) {
                if (tMaxX < tMaxZ) {
                    tMaxX += tDeltaX;
                    x += stepX;
                    normal = { x: -stepX, y: 0, z: 0 };
                } else {
                    tMaxZ += tDeltaZ;
                    z += stepZ;
                    normal = { x: 0, y: 0, z: -stepZ };
                }
            } else {
                if (tMaxY < tMaxZ) {
                    tMaxY += tDeltaY;
                    y += stepY;
                    normal = { x: 0, y: -stepY, z: 0 };
                } else {
                    tMaxZ += tDeltaZ;
                    z += stepZ;
                    normal = { x: 0, y: 0, z: -stepZ };
                }
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

                    let brightness = 0.6;
                    brightness += (wy / WORLD_HEIGHT) * 0.25;
                    brightness += Math.sin(wx * 0.1 + wz * 0.1) * 0.08;
                    brightness += Math.cos(wx * 0.15 - wz * 0.15) * 0.06;

                    color.multiplyScalar(Math.min(1, brightness));

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
        const renderDist = 10;

        this.world.updateChunksAround(this.player.position.x, this.player.position.z);

        for (const [key, chunk] of this.world.chunks) {
            const [cx, cz] = key.split(',').map(Number);
            const dist = Math.max(Math.abs(cx - playerChunkX), Math.abs(cz - playerChunkZ));

            if (dist > renderDist) {
                if (this.chunkMeshes.has(key)) {
                    const mesh = this.chunkMeshes.get(key);
                    this.scene.remove(mesh);
                    mesh.geometry.dispose();
                    mesh.material.dispose();
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

        if (this.cloudMesh) {
            const windOffset = Date.now() * 0.00001;
            this.cloudMesh.position.x = eyePos.x + Math.sin(windOffset) * 10;
            this.cloudMesh.position.z = eyePos.z + Math.cos(windOffset * 0.7) * 10;
        }

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
    }

    updateDayNightCycle() {
        const time = Date.now() * 0.00002;
        const sunY = Math.sin(time) * 120 + 100;
        const sunIntensity = Math.sin(time);
        const brightness = Math.max(0.15, sunIntensity + 0.5);

        this.directionalLight.position.set(200, sunY, 200);
        this.directionalLight.intensity = 0.4 + brightness * 0.5;

        let hue = 0.6;
        let saturation = 0.5;
        let lightness = 0.4 + brightness * 0.35;

        if (sunIntensity < 0.1) {
            hue = 0.75 + Math.sin(time * 2) * 0.1;
            saturation = 0.3;
            lightness = 0.15 + sunIntensity * 0.15;
        } else if (sunIntensity < 0.3) {
            hue = 0.65 - (0.3 - sunIntensity) * 0.5;
            saturation = 0.6;
            lightness = 0.25 + sunIntensity * 0.3;
        } else if (sunIntensity > 0.7) {
            hue = 0.55 + (sunIntensity - 0.7) * 0.3;
            saturation = 0.4;
        }

        const skyColor = new THREE.Color();
        skyColor.setHSL(hue, saturation, lightness);
        this.scene.background = skyColor;

        this.scene.fog.color.copy(skyColor);
        this.scene.fog.near = 80 + brightness * 70;
        this.scene.fog.far = 300 + brightness * 150;
    }
}

const game = new MinecraftGame();
