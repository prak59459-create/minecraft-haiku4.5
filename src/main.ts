import * as THREE from 'three';
import { World } from './world.js';
import { Player } from './player.js';
import { BlockSelector, HUD } from './ui.js';
import { BlockType } from './blocks.js';

let scene: THREE.Scene;
let camera: THREE.PerspectiveCamera;
let renderer: THREE.WebGLRenderer;
let world: World;
let player: Player;
let hud: HUD;
let blockSelector: BlockSelector;
let sun: THREE.Light;
let ambientLight: THREE.Light;
let meshCache: Map<string, THREE.Mesh> = new Map();

function init(): void {
    const canvas = document.getElementById('canvas') as HTMLCanvasElement;

    renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(0x87ceeb);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowShadowMap;

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87ceeb);
    scene.fog = new THREE.Fog(0x87ceeb, 200, 400);

    world = new World(scene);

    const startPos = new THREE.Vector3(0, 100, 0);
    player = new Player(camera, world, startPos);
    player.setupControls();

    blockSelector = new BlockSelector();
    (window as any).blockSelector = blockSelector;

    hud = new HUD();

    setupLighting();
    setupEventListeners();

    loadChunks();
    animate();
}

function setupLighting(): void {
    const sunLight = new THREE.DirectionalLight(0xffffff, 1);
    sunLight.position.set(100, 100, 100);
    sunLight.castShadow = true;
    sunLight.shadow.camera.left = -100;
    sunLight.shadow.camera.right = 100;
    sunLight.shadow.camera.top = 100;
    sunLight.shadow.camera.bottom = -100;
    sunLight.shadow.camera.far = 200;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    scene.add(sunLight);
    sun = sunLight;

    const ambient = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambient);
    ambientLight = ambient;
}

function setupEventListeners(): void {
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    document.addEventListener('click', () => {
        if (document.pointerLockElement !== document.documentElement) {
            document.documentElement.requestPointerLock?.();
        }
    });
}

function loadChunks(): void {
    const cx = Math.floor(player.position.x / 16);
    const cz = Math.floor(player.position.z / 16);

    for (let dx = -8; dx <= 8; dx++) {
        for (let dz = -8; dz <= 8; dz++) {
            const chunk = world.getChunk(cx + dx, cz + dz);
            if (!chunk.mesh) {
                chunk.mesh = world.buildMesh(chunk);
                chunk.mesh.position.set(chunk.x * 16, 0, chunk.z * 16);
                chunk.mesh.castShadow = true;
                chunk.mesh.receiveShadow = true;
                scene.add(chunk.mesh);
            }
        }
    }
}

let lastChunkUpdate = 0;

function animate(): void {
    requestAnimationFrame(animate);

    const now = performance.now();
    const delta = Math.min(0.016, (now - (lastChunkUpdate || now)) / 1000);

    player.update(delta);
    hud.update(player, world);

    updateDayNightCycle();

    if (now - lastChunkUpdate > 100) {
        updateChunks();
        lastChunkUpdate = now;
    }

    renderer.render(scene, camera);
}

function updateChunks(): void {
    const cx = Math.floor(player.position.x / 16);
    const cz = Math.floor(player.position.z / 16);

    for (let dx = -10; dx <= 10; dx++) {
        for (let dz = -10; dz <= 10; dz++) {
            const chunk = world.getChunk(cx + dx, cz + dz);
            if (!chunk.mesh) {
                chunk.mesh = world.buildMesh(chunk);
                chunk.mesh.position.set(chunk.x * 16, 0, chunk.z * 16);
                chunk.mesh.castShadow = true;
                chunk.mesh.receiveShadow = true;
                scene.add(chunk.mesh);
            }
        }
    }
}

function updateDayNightCycle(): void {
    const t = (Date.now() / 1000 / 20) % 1;
    const angle = t * Math.PI * 2;

    if (sun) {
        sun.position.set(100 * Math.cos(angle), 100 * Math.sin(angle), 100);
        sun.target.position.set(0, 0, 0);
    }

    let sunIntensity = Math.sin(angle);
    sunIntensity = Math.max(0.2, Math.min(1, sunIntensity));

    if (sun) sun.intensity = sunIntensity;
    if (ambientLight) ambientLight.intensity = 0.3 + sunIntensity * 0.4;

    const skyColor = new THREE.Color();
    if (sunIntensity > 0.5) {
        skyColor.setHex(0x87ceeb);
    } else if (sunIntensity > 0.2) {
        skyColor.lerpColors(new THREE.Color(0x1a1a2e), new THREE.Color(0x87ceeb), (sunIntensity - 0.2) / 0.3);
    } else {
        skyColor.setHex(0x1a1a2e);
    }

    renderer.setClearColor(skyColor);
    scene.background = skyColor;
    scene.fog?.color.copy(skyColor);
}

document.addEventListener('DOMContentLoaded', init);
