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

        const shouldUseAntialias = window.devicePixelRatio <= 1.5;
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: shouldUseAntialias,
            powerPreference: 'high-performance',
            precision: 'mediump'
        });
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
        this.raycastDistance = 6;
        this.lastBreakSound = 0;
        this.showDebug = false;

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

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.4 + sunIntensity * 0.15);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xfffacd, 0.7 + sunIntensity * 0.25);
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
        this.ambientLight = ambientLight;
    }

    setupEventListeners() {
        window.addEventListener('resize', () => this.onWindowResize());
        document.addEventListener('mousedown', (e) => this.onMouseClick(e));
    }

    setupPickBlock() {
        document.addEventListener('keydown', (e) => {
            if ((e.key === 'c' || e.key === 'C') && document.pointerLockElement === document.body) {
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
            if (hit.block !== BLOCKS.BEDROCK) {
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
        } else if (event.button === 2) {
            const norm = hit.normal;
            const nx = hit.x + norm.x;
            const ny = hit.y + norm.y;
            const nz = hit.z + norm.z;

            const selectedBlockType = this.ui.getSelectedBlockType();
            const blockAtTarget = this.world.getBlock(nx, ny, nz);

            if (!this.isPlayerOccupying(nx, ny, nz) && selectedBlockType !== BLOCKS.AIR && blockAtTarget === BLOCKS.AIR) {
                this.world.setBlock(nx, ny, nz, selectedBlockType);
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
        ).normalize();

        let hit = null;
        let prevBx = Math.floor(eyePos.x);
        let prevBy = Math.floor(eyePos.y);
        let prevBz = Math.floor(eyePos.z);

        for (let dist = 0.1; dist <= this.raycastDistance; dist += 0.1) {
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

        const colorCache = {};

        for (let x = 0; x < CHUNK_SIZE; x++) {
            for (let y = 1; y < WORLD_HEIGHT; y++) {
                for (let z = 0; z < CHUNK_SIZE; z++) {
                    const blockId = chunk.getBlock(x, y, z);
                    if (blockId === BLOCKS.AIR) continue;

                    const wx = chunk.x * CHUNK_SIZE + x;
                    const wy = y;
                    const wz = chunk.z * CHUNK_SIZE + z;

                    const cacheKey = `${blockId}_${Math.floor(wy / 16)}`;
                    let color;

                    if (colorCache[cacheKey]) {
                        color = colorCache[cacheKey];
                    } else {
                        color = new THREE.Color(BLOCK_COLORS[blockId]);
                        const baseLight = 0.7;
                        const heightLight = (wy / WORLD_HEIGHT) * 0.3;
                        const varLight = Math.sin(wx * 0.5 + wz * 0.5) * 0.1;
                        const brightness = Math.max(0.3, Math.min(1.0, baseLight + heightLight + varLight));
                        color.multiplyScalar(brightness);
                        colorCache[cacheKey] = color;
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
                flatShading: true,
                side: THREE.FrontSide,
                shininess: 10
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

        this.world.updateChunksAround(this.player.position.x, this.player.position.z);

        const meshChunksToRemove = [];
        for (const [key, mesh] of this.chunkMeshes) {
            const [cx, cz] = key.split(',').map(Number);
            const dist = Math.abs(cx - playerChunkX) + Math.abs(cz - playerChunkZ);

            if (dist > 12) {
                this.scene.remove(mesh);
                meshChunksToRemove.push(key);
                mesh.geometry.dispose();
                mesh.material.dispose();
            }
        }
        meshChunksToRemove.forEach(key => this.chunkMeshes.delete(key));

        const chunksToLoad = [];
        for (const [key, chunk] of this.world.chunks) {
            const [cx, cz] = key.split(',').map(Number);
            const dist = Math.abs(cx - playerChunkX) + Math.abs(cz - playerChunkZ);

            if (dist > 12) continue;

            if (!this.chunkMeshes.has(key)) {
                const priority = this.getChunkLoadPriority(cx, cz, playerChunkX, playerChunkZ);
                chunksToLoad.push({ key, chunk, dist, priority });
            }
        }

        chunksToLoad.sort((a, b) => {
            if (a.priority !== b.priority) return a.priority - b.priority;
            return a.dist - b.dist;
        });

        const maxChunksPerFrame = 2;
        for (let i = 0; i < Math.min(maxChunksPerFrame, chunksToLoad.length); i++) {
            const { key, chunk } = chunksToLoad[i];
            const mesh = this.buildChunkMesh(chunk);
            if (mesh) {
                this.scene.add(mesh);
                this.chunkMeshes.set(key, mesh);
            }
        }
    }

    getChunkLoadPriority(cx, cz, playerCx, playerCz) {
        const dx = cx - playerCx;
        const dz = cz - playerCz;
        const playerDir = this.gameCamera.rotation.y;
        const dirToChunk = Math.atan2(dz, dx);
        const angleDiff = Math.abs(dirToChunk - playerDir);
        return Math.min(angleDiff, Math.PI * 2 - angleDiff);
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
        this.ui.updateHUD(this.player.position, this.ui.getSelectedBlockType(), fps);

        if (this.showDebug) {
            this.debugDisplay.update(this);
        }

        this.renderer.render(this.scene, this.camera);
    }

    updateDayNightCycle() {
        const time = Date.now() * 0.00002;
        const sunY = Math.sin(time) * 120 + 100;
        const sunIntensity = Math.max(0.15, Math.sin(time) + 0.55);

        this.directionalLight.position.set(200, Math.max(sunY, 20), 200);
        this.directionalLight.intensity = Math.max(0.2, 0.7 + sunIntensity * 0.3);

        const isNight = sunY < 40;
        const ambientIntensity = isNight ? 0.2 + sunIntensity * 0.08 : 0.4 + sunIntensity * 0.15;
        this.ambientLight.intensity = ambientIntensity;

        let skyColor = new THREE.Color();
        if (isNight) {
            skyColor.setHSL(0.6, 0.3, 0.15 + sunIntensity * 0.1);
        } else {
            const hue = 0.6 - sunIntensity * 0.15;
            const saturation = 0.6 + sunIntensity * 0.2;
            const lightness = 0.5 + sunIntensity * 0.35;
            skyColor.setHSL(Math.max(0.5, hue), saturation, lightness);
        }

        this.scene.background = skyColor;
    }
}

const game = new MinecraftGame();
