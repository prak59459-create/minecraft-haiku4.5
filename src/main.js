import * as THREE from 'three';
import { Player } from './player.js';
import { World } from './world.js';
import { Physics } from './physics.js';
import { UI } from './ui.js';
import { BLOCK_TYPES } from './blocks.js';

class Game {
    constructor() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87ceeb);
        this.scene.fog = new THREE.Fog(0x87ceeb, 100, 500);

        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );

        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            precision: 'highp',
            stencil: false
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFShadowShadowMap;
        this.renderer.shadowMap.autoUpdate = true;
        document.body.appendChild(this.renderer.domElement);

        this.world = new World(12345);
        this.player = new Player(this.world);
        this.camera = this.player.camera;
        this.scene.add(this.camera);

        this.physics = new Physics(this.world);
        this.ui = new UI(this.player, this.world);
        this.ui.initHotbar();

        this.setupLighting();
        this.setupEventListeners();

        this.lastUpdateTime = Date.now();
        this.loadedChunks = new Map();
        this.time = 0;
        this.dayLength = 20000;
        this.meshUpdateQueue = [];
        this.maxMeshUpdatesPerFrame = 2;

        this.animate();
    }

    setupLighting() {
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.9);
        directionalLight.position.set(100, 100, 100);
        directionalLight.castShadow = true;
        directionalLight.shadow.camera.left = -150;
        directionalLight.shadow.camera.right = 150;
        directionalLight.shadow.camera.top = 150;
        directionalLight.shadow.camera.bottom = -150;
        directionalLight.shadow.camera.near = 0.1;
        directionalLight.shadow.camera.far = 400;
        directionalLight.shadow.mapSize.width = 1024;
        directionalLight.shadow.mapSize.height = 1024;
        directionalLight.shadow.bias = -0.0005;
        this.scene.add(directionalLight);

        this.directionalLight = directionalLight;
    }

    setupEventListeners() {
        window.addEventListener('click', () => {
            this.player.destroyBlock();
        });

        window.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            this.player.placeBlock();
        });

        window.addEventListener('wheel', (e) => {
            e.preventDefault();
            if (e.deltaY < 0) {
                this.player.selectHotbarSlot((this.player.selectedHotbarIndex - 1 + 9) % 9);
            } else {
                this.player.selectHotbarSlot((this.player.selectedHotbarIndex + 1) % 9);
            }
        });

        window.addEventListener('mousemove', (e) => {
            if (document.pointerLockElement !== document.body) {
                return;
            }

            const deltaX = e.movementX;
            const deltaY = e.movementY;

            this.player.euler.setFromQuaternion(this.camera.quaternion);
            this.player.euler.order = 'YXZ';

            this.player.euler.y -= deltaX * 0.003;
            this.player.euler.x -= deltaY * 0.003;

            this.player.euler.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.player.euler.x));

            this.camera.quaternion.setFromEuler(this.player.euler);
        });

        document.addEventListener('click', () => {
            document.body.requestPointerLock();
        });

        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }

    updateChunks() {
        const { chunks, loaded } = this.world.update(this.player.position);

        for (const chunk of chunks) {
            const key = `${chunk.x},${chunk.z}`;

            if (chunk.needsUpdate) {
                this.meshUpdateQueue.push(chunk);
            } else if (!chunk.mesh) {
                this.meshUpdateQueue.push(chunk);
            }
        }

        let updateCount = 0;
        while (this.meshUpdateQueue.length > 0 && updateCount < this.maxMeshUpdatesPerFrame) {
            const chunk = this.meshUpdateQueue.shift();
            const key = `${chunk.x},${chunk.z}`;

            if (chunk.mesh) {
                this.scene.remove(chunk.mesh);
                chunk.mesh.geometry.dispose();
                chunk.mesh.material.dispose();
            }

            const mesh = chunk.generateMesh();
            if (mesh) {
                this.scene.add(mesh);
                this.loadedChunks.set(key, mesh);
            }
            updateCount++;
        }

        for (const [key, mesh] of this.loadedChunks) {
            if (!loaded.has(key)) {
                this.scene.remove(mesh);
                mesh.geometry.dispose();
                mesh.material.dispose();
                this.loadedChunks.delete(key);
            }
        }
    }

    updateLighting() {
        const t = (this.time / this.dayLength) % 1;
        const sunPosition = Math.sin(t * Math.PI) * 1.5;
        const sunHeight = Math.cos(t * Math.PI) * 100;

        this.directionalLight.position.set(
            sunPosition * 200,
            50 + sunHeight,
            100
        );

        const timeOfDay = t;
        let skyColor;
        let lightIntensity;

        if (timeOfDay < 0.25) {
            skyColor = new THREE.Color(0x000033);
            lightIntensity = 0.2;
        } else if (timeOfDay < 0.3) {
            const blend = (timeOfDay - 0.25) / 0.05;
            skyColor = new THREE.Color(0x000033).lerp(new THREE.Color(0x87ceeb), blend);
            lightIntensity = 0.2 + (0.8 - 0.2) * blend;
        } else if (timeOfDay < 0.7) {
            skyColor = new THREE.Color(0x87ceeb);
            lightIntensity = 0.8;
        } else if (timeOfDay < 0.75) {
            const blend = (timeOfDay - 0.7) / 0.05;
            skyColor = new THREE.Color(0x87ceeb).lerp(new THREE.Color(0xff8844), blend);
            lightIntensity = 0.8 - (0.6 * blend);
        } else if (timeOfDay < 1.0) {
            skyColor = new THREE.Color(0x000033);
            lightIntensity = 0.2;
        }

        this.scene.background = skyColor;
        this.scene.fog.color = skyColor;
        this.directionalLight.intensity = Math.max(0.2, lightIntensity);
    }

    animate = () => {
        requestAnimationFrame(this.animate);

        const now = Date.now();
        const dt = Math.min((now - this.lastUpdateTime) / 1000, 0.016);
        this.lastUpdateTime = now;
        this.time += dt * 1000;

        this.physics.update(this.player, dt);
        this.player.updateCamera();

        this.updateChunks();
        this.updateLighting();

        this.ui.update();

        this.renderer.render(this.scene, this.camera);
    };
}

window.addEventListener('DOMContentLoaded', () => {
    new Game();
});
