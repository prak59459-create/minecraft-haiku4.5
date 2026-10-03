import * as THREE from 'three';
import { SimplexNoise } from 'simplex-noise';
import { ChunkManager } from './world/ChunkManager.js';
import { Player } from './player/Player.js';
import { InputManager } from './input/InputManager.js';
import { UI } from './ui/UI.js';
import { Lighting } from './environment/Lighting.js';
import { ParticleSystem } from './effects/ParticleSystem.js';
import { SoundManager } from './utils/Sound.js';
import { PerformanceOptimizer } from './utils/Performance.js';
import { BlockHighlight } from './world/BlockHighlight.js';
import { WeatherSystem } from './environment/Weather.js';
import { Profiler } from './utils/Profiler.js';

const WORLD_CONFIG = {
    chunkSize: 16,
    chunkHeight: 64,
    renderDistance: 8,
    seed: 12345
};

class MinecraftClone {
    constructor() {
        this.initScene();
        this.initPhysics();
        this.initWorld();
        this.initPlayer();
        this.initUI();
        this.setupEventListeners();
        this.animate();
    }

    initScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87ceeb);
        this.scene.fog = new THREE.Fog(0x87ceeb, 200, 500);

        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.set(8, 70, 8);

        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            powerPreference: 'high-performance'
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFShadowShadowMap;
        document.body.appendChild(this.renderer.domElement);

        window.addEventListener('resize', () => this.onWindowResize());
    }

    initPhysics() {
        this.gravity = 0.08;
        this.velocity = new THREE.Vector3();
    }

    initWorld() {
        this.chunkManager = new ChunkManager(
            this.scene,
            WORLD_CONFIG.chunkSize,
            WORLD_CONFIG.chunkHeight,
            WORLD_CONFIG.renderDistance,
            WORLD_CONFIG.seed
        );
    }

    initPlayer() {
        this.player = new Player(this.camera, this.chunkManager);
        this.inputManager = new InputManager(this.camera, this.player);
    }

    setupParticlesAndSound() {
        this.player.particleSystem = this.particles;
        this.player.soundManager = this.soundManager;
    }

    initUI() {
        this.ui = new UI(this.player);
        this.lighting = new Lighting(this.scene);
        this.particles = new ParticleSystem(this.scene);
        this.soundManager = new SoundManager();
        this.soundManager.init();
        this.performanceOptimizer = new PerformanceOptimizer(this.renderer);
        this.blockHighlight = new BlockHighlight(this.scene);
        this.weather = new WeatherSystem(this.scene);
        this.profiler = new Profiler();
        this.ui.inputManager = this.inputManager;
        this.setupParticlesAndSound();
    }

    setupEventListeners() {
        this.renderer.domElement.addEventListener('click', () => {
            this.renderer.domElement.requestPointerLock();
        });

        document.addEventListener('pointerlockchange', () => {
            this.inputManager.locked = document.pointerLockElement === this.renderer.domElement;
        });
    }

    updateWorldAround(playerPos) {
        const chunkX = Math.floor(playerPos.x / WORLD_CONFIG.chunkSize);
        const chunkZ = Math.floor(playerPos.z / WORLD_CONFIG.chunkSize);
        this.chunkManager.updateVisibleChunks(chunkX, chunkZ);
    }

    updatePhysics() {
        this.player.updatePhysics(this.velocity, this.gravity, this.chunkManager);
    }

    updateEnvironment() {
        this.lighting.update();
        this.weather.updateRain();
        this.scene.background.copy(this.lighting.skyColor);
        this.scene.fog.color.copy(this.lighting.fogColor);

        // Update block highlight
        const direction = new THREE.Vector3(0, 0, -1);
        direction.applyQuaternion(this.camera.quaternion);
        const hit = this.chunkManager.raycast(this.camera.position, direction, this.player.blockReachDistance);
        this.blockHighlight.updateHighlight(hit);
    }

    updateUI() {
        this.ui.update(this.player, this.chunkManager, this.lighting);
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        this.updateWorldAround(this.player.camera.position);
        this.updatePhysics();
        this.updateEnvironment();
        this.particles.update();
        this.updateUI();

        this.renderer.render(this.scene, this.camera);
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
}

new MinecraftClone();
