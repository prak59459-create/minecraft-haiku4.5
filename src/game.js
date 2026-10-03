import * as THREE from 'three';
import { Player } from './player.js';
import { World } from './world/world.js';
import { Input } from './input.js';
import { Physics } from './physics.js';
import { ParticleSystem } from './particles.js';
import { SoundManager } from './sound.js';

export class Game {
    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setClearColor(0x87ceeb);
        document.body.appendChild(this.renderer.domElement);

        this.player = new Player();
        this.world = new World(this.scene);
        this.particles = new ParticleSystem(this.scene);
        this.sound = new SoundManager();
        this.input = new Input(this.player, this.world, this);
        this.physics = new Physics();

        this.lastTime = Date.now();
        this.frameCount = 0;
        this.lastFpsTime = Date.now();

        this.setupLighting();
        this.setupEventListeners();
    }

    setupLighting() {
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(100, 100, 100);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        this.scene.add(directionalLight);

        this.directionalLight = directionalLight;
    }

    setupEventListeners() {
        window.addEventListener('resize', () => this.onWindowResize());
        this.renderer.domElement.addEventListener('click', () => {
            this.renderer.domElement.requestPointerLock();
        });
        document.addEventListener('pointerlockchange', () => {
            this.input.pointerLocked = document.pointerLockElement === this.renderer.domElement;
        });
    }

    init() {
        this.camera.position.copy(this.player.position);
        this.world.generate();
    }

    update(deltaTime) {
        const clampedDelta = Math.min(deltaTime, 0.016);
        this.input.update(clampedDelta);
        this.player.update(clampedDelta, this.world);
        this.physics.update(this.player, this.world, clampedDelta);
        this.particles.update(clampedDelta);
        this.world.update(this.player);
        this.updateLighting();
        this.updateUI();
    }

    updateLighting() {
        const time = (Date.now() % 120000) / 120000;
        const dayNightCycle = Math.sin(time * Math.PI * 2) * 0.5 + 0.5;

        const ambientIntensity = 0.4 + dayNightCycle * 0.3;
        const directionalIntensity = 0.3 + dayNightCycle * 0.6;

        this.scene.children
            .filter(obj => obj instanceof THREE.Light && obj.type === 'AmbientLight')
            .forEach(light => light.intensity = ambientIntensity);

        this.directionalLight.intensity = directionalIntensity;

        const timeOfDay = (time * 24).toFixed(1);
        document.getElementById('time').textContent = time < 0.5 ? 'Day' : 'Night';
    }

    updateUI() {
        const pos = this.player.position;
        document.getElementById('pos').textContent = `${pos.x.toFixed(1)}, ${pos.y.toFixed(1)}, ${pos.z.toFixed(1)}`;

        const raycast = this.world.rayCastFromPlayer(this.player);
        if (raycast) {
            const blockName = raycast.block.name || 'Unknown';
            document.getElementById('block').textContent = blockName.charAt(0).toUpperCase() + blockName.slice(1);
        } else {
            document.getElementById('block').textContent = 'None';
        }
    }

    render() {
        const eyePos = this.player.position.clone().add(new THREE.Vector3(0, this.player.eyeHeight, 0));
        this.camera.position.copy(eyePos);
        this.camera.quaternion.copy(this.player.camera.quaternion);
        this.renderer.render(this.scene, this.camera);
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        const now = Date.now();
        const deltaTime = (now - this.lastTime) / 1000;
        this.lastTime = now;

        this.update(deltaTime);
        this.render();

        this.frameCount++;
        if (now - this.lastFpsTime >= 1000) {
            document.getElementById('fps').textContent = this.frameCount;
            this.frameCount = 0;
            this.lastFpsTime = now;
        }
    }

    onWindowResize() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }
}
