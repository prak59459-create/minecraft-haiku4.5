import * as THREE from 'three';
import { Player } from './Player.js';
import { WorldManager } from './WorldManager.js';
import { BlockSystem } from './BlockSystem.js';
import { Settings } from './Settings.js';
import { InputManager } from './InputManager.js';
import { CameraController } from './CameraController.js';
import { LightingSystem } from './LightingSystem.js';

export class Game {
    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true });

        this.settings = new Settings();
        this.inputManager = new InputManager(this.settings);
        this.cameraController = new CameraController(this.camera, this.settings);

        this.player = null;
        this.world = null;
        this.blockSystem = null;
        this.lightingSystem = null;
        this.selectedBlock = 1;

        this.frameCount = 0;
        this.lastTime = performance.now();
        this.fps = 0;

        this.setupScene();
    }

    setupScene() {
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setClearColor(0x87ceeb);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFShadowShadowMap;
        document.body.appendChild(this.renderer.domElement);

        this.scene.fog = new THREE.Fog(0x87ceeb, this.settings.viewDistance, this.settings.fogDistance);

        this.lightingSystem = new LightingSystem(this.scene);
    }

    init() {
        this.blockSystem = new BlockSystem();
        this.world = new WorldManager(this.scene, this.blockSystem, this.settings.renderDistance);
        this.player = new Player(this.camera, this.world, this.inputManager, this.cameraController);

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

        document.addEventListener('click', () => {
            document.body.requestPointerLock =
                document.body.requestPointerLock || document.body.mozRequestPointerLock;
            document.body.requestPointerLock();
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

    animate() {
        requestAnimationFrame(() => this.animate());

        const now = performance.now();
        const deltaTime = Math.min((now - this.lastTime) / 1000, 0.016);
        this.lastTime = now;

        this.frameCount++;
        if (this.frameCount >= 10) {
            this.fps = Math.round(1 / deltaTime);
            this.frameCount = 0;
        }

        this.player.update(deltaTime);
        this.world.updateChunks(this.player.position);
        this.lightingSystem.update(deltaTime, this.scene);
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
