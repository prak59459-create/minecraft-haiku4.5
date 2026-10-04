import * as THREE from 'three';
import { World } from './world.js';
import { Player } from './player.js';
import { Physics } from './physics.js';
import { UI } from './ui.js';

class Game {
    constructor() {
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.Fog(0x87ceeb, 0, 500);
        this.scene.background = new THREE.Color(0x87ceeb);

        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.y = 64;

        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFShadowShadowMap;
        document.body.appendChild(this.renderer.domElement);

        this.setupLighting();
        this.world = new World(this.scene);
        this.player = new Player(this.camera);
        this.physics = new Physics(this.world);
        this.ui = new UI(this.player, this.world);

        this.clock = new THREE.Clock();
        this.lastFrameTime = 0;

        this.handleInput();
        this.setupEventListeners();
    }

    setupLighting() {
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);

        this.sun = new THREE.DirectionalLight(0xffffff, 0.8);
        this.sun.position.set(100, 100, 100);
        this.sun.castShadow = true;
        this.sun.shadow.mapSize.width = 2048;
        this.sun.shadow.mapSize.height = 2048;
        this.sun.shadow.camera.far = 500;
        this.sun.shadow.camera.left = -200;
        this.sun.shadow.camera.right = 200;
        this.sun.shadow.camera.top = 200;
        this.sun.shadow.camera.bottom = -200;
        this.scene.add(this.sun);
    }

    handleInput() {
        const keys = {};

        window.addEventListener('keydown', (e) => {
            keys[e.code] = true;
            this.player.handleKey(e.code, true);
        });

        window.addEventListener('keyup', (e) => {
            keys[e.code] = false;
            this.player.handleKey(e.code, false);
        });

        window.addEventListener('mousemove', (e) => {
            if (document.pointerLockElement === document.body) {
                this.player.handleMouseMove(e.movementX, e.movementY);
            }
        });

        window.addEventListener('click', (e) => {
            if (document.pointerLockElement !== document.body) {
                document.body.requestPointerLock();
            } else {
                this.handleClickAt(e);
            }
        });

        window.addEventListener('mousedown', (e) => {
            if (document.pointerLockElement === document.body) {
                if (e.button === 0) this.player.isDestroyingBlock = true;
                if (e.button === 2) this.player.isPlacingBlock = true;
            }
        });

        window.addEventListener('mouseup', (e) => {
            if (e.button === 0) this.player.isDestroyingBlock = false;
            if (e.button === 2) this.player.isPlacingBlock = false;
        });

        window.addEventListener('contextmenu', (e) => e.preventDefault());

        window.addEventListener('wheel', (e) => {
            e.preventDefault();
            if (e.deltaY > 0) {
                this.player.selectNextBlock();
            } else {
                this.player.selectPrevBlock();
            }
        });

        for (let i = 1; i <= 9; i++) {
            window.addEventListener('keypress', (e) => {
                if (e.key === i.toString()) {
                    this.player.selectBlock(i - 1);
                }
            });
        }

        this.keys = keys;
    }

    handleClickAt(e) {
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();
        mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
        raycaster.setFromCamera(mouse, this.camera);

        const intersects = raycaster.intersectObjects(this.world.chunks, true);

        if (intersects.length > 0) {
            const point = intersects[0].point;
            const normal = intersects[0].face.normal;

            if (e.button === 0) {
                this.world.destroyBlock(Math.floor(point.x), Math.floor(point.y), Math.floor(point.z));
            } else if (e.button === 2) {
                const placePos = new THREE.Vector3(point.x, point.y, point.z).add(normal.multiplyScalar(0.5));
                this.world.placeBlock(Math.floor(placePos.x), Math.floor(placePos.y), Math.floor(placePos.z), this.player.selectedBlockType);
            }
        }
    }

    setupEventListeners() {
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }

    updateDayNightCycle(deltaTime) {
        const cycleTime = 600;
        const time = (Date.now() / 1000) % cycleTime;
        const timeOfDay = time / cycleTime;

        const angle = timeOfDay * Math.PI * 2;
        const sunY = Math.sin(angle) * 100;
        const sunZ = Math.cos(angle) * 150;

        this.sun.position.set(0, sunY + 50, sunZ);

        const brightness = Math.max(0.2, (Math.sin(angle) + 1) / 2);
        this.sun.intensity = brightness;

        const skyColor = new THREE.Color();
        if (sunY > -50) {
            skyColor.setHSL(0.6, 1, 0.5 + (sunY / 150) * 0.2);
        } else {
            skyColor.setHSL(0.6, 0.3, 0.1);
        }
        this.scene.background = skyColor;
        this.scene.fog.color = skyColor;
    }

    update(deltaTime) {
        this.updateDayNightCycle(deltaTime);
        this.player.update(deltaTime, this.world);
        this.physics.update(this.player, this.world, deltaTime);
        this.world.updateChunks(this.player.position);

        this.world.handleBlockOperations(this.player);

        this.camera.position.copy(this.player.position);
        this.camera.position.y += this.player.eyeHeight;

        this.ui.update(this.player, this.world, this.camera);
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        const deltaTime = this.clock.getDelta();
        this.update(deltaTime);
        this.renderer.render(this.scene, this.camera);
    }
}

const game = new Game();
game.animate();
