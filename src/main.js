import * as THREE from 'three';
import { SimplexNoise } from 'simplex-noise';
import { World } from './world.js';
import { Player } from './player.js';
import { UI } from './ui.js';

let scene, camera, renderer, world, player, ui;
let clock = new THREE.Clock();
let frameCount = 0;
let lastFpsTime = 0;

function init() {
    // Scene setup
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87ceeb);
    scene.fog = new THREE.Fog(0x87ceeb, 200, 500);

    // Camera
    camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.set(0, 65, 0);

    // Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowShadowMap;
    document.body.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const sunlight = new THREE.DirectionalLight(0xffffff, 0.8);
    sunlight.position.set(100, 100, 100);
    sunlight.castShadow = true;
    sunlight.shadow.mapSize.width = 2048;
    sunlight.shadow.mapSize.height = 2048;
    sunlight.shadow.camera.left = -200;
    sunlight.shadow.camera.right = 200;
    sunlight.shadow.camera.top = 200;
    sunlight.shadow.camera.bottom = -200;
    sunlight.shadow.camera.near = 0.5;
    sunlight.shadow.camera.far = 500;
    scene.add(sunlight);

    // Initialize game objects
    world = new World(scene);
    player = new Player(camera);
    ui = new UI();

    // Handle window resize
    window.addEventListener('resize', onWindowResize);

    // Start game loop
    animate();
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);

    const delta = clock.getDelta();
    const elapsed = clock.getElapsedTime();

    // Update player
    player.update(delta, world);

    // Update world chunks
    world.updateChunks(player.position);

    // Update camera position
    camera.position.copy(player.position);
    camera.position.y += player.eyeHeight;

    // Handle block selection
    const raycaster = new THREE.Raycaster();
    const direction = new THREE.Vector3(0, 0, -1);
    direction.applyQuaternion(camera.quaternion);
    raycaster.set(camera.position, direction);

    const intersects = raycaster.intersectObjects(world.getVisibleBlocks(), false);
    let selectedBlock = null;

    if (intersects.length > 0) {
        const intersection = intersects[0];
        selectedBlock = intersection.object;

        // Update UI with selected block
        if (selectedBlock) {
            ui.updateSelectedBlock(selectedBlock.userData.type);
        }

        // Handle mouse clicks
        if (player.leftClickPressed) {
            world.destroyBlock(intersection.point, direction);
            player.leftClickPressed = false;
        }
        if (player.rightClickPressed) {
            world.placeBlock(intersection.point, direction, player.selectedBlockType);
            player.rightClickPressed = false;
        }
    }

    // Update UI
    ui.updateStats({
        fps: Math.round(1 / delta),
        position: player.position,
        chunkCount: world.chunks.size,
        selectedBlock: player.selectedBlockType
    });

    // Render
    renderer.render(scene, camera);

    frameCount++;
}

// Initialize on load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
