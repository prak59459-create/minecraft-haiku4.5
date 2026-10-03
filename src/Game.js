import * as THREE from 'three';
import { Player } from './Player.js';
import { WorldManager } from './WorldManager.js';
import { BlockSystem } from './BlockSystem.js';

export class Game {
    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true });

        this.player = null;
        this.world = null;
        this.blockSystem = null;
        this.selectedBlock = 1;

        this.frameCount = 0;
        this.lastTime = performance.now();
        this.fps = 0;

        this.dayNightCycle = 0;
        this.ambientLight = null;
        this.directionalLight = null;
        this.time = 0;

        this.setupScene();
    }

    setupScene() {
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setClearColor(0x87ceeb);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFShadowShadowMap;
        document.body.appendChild(this.renderer.domElement);

        this.ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(this.ambientLight);

        this.directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        this.directionalLight.position.set(100, 150, 100);
        this.directionalLight.castShadow = true;
        this.directionalLight.shadow.mapSize.width = 2048;
        this.directionalLight.shadow.mapSize.height = 2048;
        this.directionalLight.shadow.camera.left = -200;
        this.directionalLight.shadow.camera.right = 200;
        this.directionalLight.shadow.camera.top = 200;
        this.directionalLight.shadow.camera.bottom = -200;
        this.scene.add(this.directionalLight);

        this.scene.fog = new THREE.Fog(0x87ceeb, 500, 1000);
    }

    init() {
        this.blockSystem = new BlockSystem();
        this.world = new WorldManager(this.scene, this.blockSystem);
        this.player = new Player(this.camera, this.world);

        this.setupUI();
        this.setupEventListeners();

        this.world.updateChunks(this.player.position);
    }

    setupUI() {
        const blockSelector = document.getElementById('blockSelector');
        blockSelector.innerHTML = '';

        for (let i = 0; i < 9; i++) {
            const slot = document.createElement('div');
            slot.className = 'blockSlot';
            slot.dataset.index = i + 1;

            const blockName = this.blockSystem.getBlockName(i + 1);
            slot.title = blockName;
            slot.style.backgroundColor = this.blockSystem.getBlockColor(i + 1);

            if (i + 1 === this.selectedBlock) {
                slot.classList.add('selected');
            }

            slot.addEventListener('click', () => this.selectBlock(i + 1));
            blockSelector.appendChild(slot);
        }
    }

    setupEventListeners() {
        document.addEventListener('click', (e) => {
            if (e.button === 0) {
                this.player.destroyBlock();
            } else if (e.button === 2) {
                this.player.placeBlock(this.selectedBlock);
            }
        });

        document.addEventListener('contextmenu', (e) => e.preventDefault());

        document.addEventListener('wheel', (e) => {
            e.preventDefault();
            const direction = e.deltaY > 0 ? 1 : -1;
            let newBlock = this.selectedBlock + direction;
            if (newBlock > 9) newBlock = 1;
            if (newBlock < 1) newBlock = 9;
            this.selectBlock(newBlock);
        });

        document.addEventListener('keydown', (e) => {
            const key = parseInt(e.key);
            if (key >= 1 && key <= 9) {
                this.selectBlock(key);
            }
        });
    }

    selectBlock(blockId) {
        this.selectedBlock = blockId;
        const slots = document.querySelectorAll('.blockSlot');
        slots.forEach(slot => {
            if (parseInt(slot.dataset.index) === blockId) {
                slot.classList.add('selected');
            } else {
                slot.classList.remove('selected');
            }
        });
    }

    updateDayNightCycle(deltaTime) {
        this.time += deltaTime;
        const cycleTime = 30; // 30 second day/night cycle
        const cycleFraction = (this.time % cycleTime) / cycleTime;

        const sunAngle = cycleFraction * Math.PI * 2;
        const sunHeight = Math.sin(sunAngle);
        const sunIntensity = Math.max(0.2, Math.cos(sunAngle * 0.5) * 0.5 + 0.5);

        this.directionalLight.position.set(
            Math.cos(sunAngle) * 150,
            sunHeight * 150 + 50,
            Math.sin(sunAngle) * 150
        );

        this.directionalLight.intensity = sunIntensity * 0.8;
        this.ambientLight.intensity = Math.max(0.2, sunIntensity * 0.6);

        const skyColor = this.interpolateColor(
            0x87ceeb,
            0x1a1a2e,
            Math.max(0, -sunHeight) * 0.5
        );
        this.renderer.setClearColor(skyColor);
    }

    interpolateColor(c1, c2, t) {
        const r1 = (c1 >> 16) & 255;
        const g1 = (c1 >> 8) & 255;
        const b1 = c1 & 255;

        const r2 = (c2 >> 16) & 255;
        const g2 = (c2 >> 8) & 255;
        const b2 = c2 & 255;

        const r = Math.round(r1 + (r2 - r1) * t);
        const g = Math.round(g1 + (g2 - g1) * t);
        const b = Math.round(b1 + (b2 - b1) * t);

        return (r << 16) | (g << 8) | b;
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        const now = performance.now();
        const deltaTime = (now - this.lastTime) / 1000;
        this.lastTime = now;

        this.frameCount++;
        if (this.frameCount >= 10) {
            this.fps = Math.round(1 / (deltaTime * 10));
            this.frameCount = 0;
        }

        this.player.update(deltaTime);
        this.world.updateChunks(this.player.position);
        this.updateDayNightCycle(deltaTime);
        this.updateUI();

        this.renderer.render(this.scene, this.camera);
    }

    updateUI() {
        document.getElementById('fps').textContent = this.fps;
        document.getElementById('chunks').textContent = this.world.getChunkCount();
        const pos = this.player.position;
        document.getElementById('position').textContent =
            `${pos.x.toFixed(1)}, ${pos.y.toFixed(1)}, ${pos.z.toFixed(1)}`;
    }

    onWindowResize() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }
}
