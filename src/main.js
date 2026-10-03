import * as THREE from 'three';
import { SimplexNoise } from 'simplex-noise';
import { World } from './world.js';
import { Player } from './player.js';
import { UI } from './ui.js';
import { ParticleSystem } from './particles.js';
import { Environment } from './environment.js';

let scene, camera, renderer, world, player, ui, particles, environment;
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
    particles = new ParticleSystem(scene);
    environment = new Environment(scene);
    environment.setSunlight(sunlight);
    environment.setAmbientLight(ambientLight);

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

    const delta = Math.min(clock.getDelta(), 0.016);
    const elapsed = clock.getElapsedTime();

    // Update systems
    player.update(delta, world);
    world.updateChunks(player.position);
    particles.update(delta);
    environment.update(delta);

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
    let targetPoint = null;
    const maxDistance = 10;

    if (intersects.length > 0) {
        for (const intersection of intersects) {
            if (intersection.distance <= maxDistance) {
                selectedBlock = intersection.object;
                targetPoint = intersection.point;
                break;
            }
        }

        // Handle mouse clicks only within reach
        if (targetPoint && selectedBlock) {
            if (player.leftClickPressed) {
                const blockType = getBlockTypeAtPoint(targetPoint, world);
                world.destroyBlock(targetPoint, direction);
                if (blockType) {
                    particles.createBlockBreakParticles(targetPoint, blockType);
                }
                player.leftClickPressed = false;
            }
            if (player.rightClickPressed) {
                world.placeBlock(targetPoint, direction, player.selectedBlockType);
                player.rightClickPressed = false;
            }
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

function getBlockTypeAtPoint(point, world) {
    const blockPos = new THREE.Vector3(
        Math.floor(point.x),
        Math.floor(point.y),
        Math.floor(point.z)
    );

    const chunkX = Math.floor(blockPos.x / 16);
    const chunkZ = Math.floor(blockPos.z / 16);
    const localX = ((blockPos.x % 16) + 16) % 16;
    const localZ = ((blockPos.z % 16) + 16) % 16;

    const chunk = world.chunks.get(`${chunkX},${chunkZ}`);
    if (chunk) {
        return chunk.getBlock(localX, Math.floor(blockPos.y), localZ);
    }
    return null;
}

// Initialize on load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
