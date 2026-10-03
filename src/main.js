import * as THREE from 'three';
import { SimplexNoise } from 'simplex-noise';
import { World } from './world.js';
import { Player } from './player.js';
import { Physics } from './physics.js';
import { UI } from './ui.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true, logarithmicDepthBuffer: false });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowShadowMap;
renderer.pixelRatio = Math.min(window.devicePixelRatio, 2);
renderer.sortObjects = true;
document.body.appendChild(renderer.domElement);

const world = new World(new SimplexNoise());
const player = new Player(camera);
const physics = new Physics(world);
const ui = new UI(player);

// Lighting
const skyLight = new THREE.HemisphereLight(0x87CEEB, 0x654321, 0.6);
scene.add(skyLight);

const sunLight = new THREE.DirectionalLight(0xFFFFDD, 0.8);
sunLight.position.set(100, 150, 100);
sunLight.castShadow = true;
sunLight.shadow.camera.left = -300;
sunLight.shadow.camera.right = 300;
sunLight.shadow.camera.top = 300;
sunLight.shadow.camera.bottom = -300;
sunLight.shadow.mapSize.width = 2048;
sunLight.shadow.mapSize.height = 2048;
sunLight.shadow.bias = -0.0001;
scene.add(sunLight);

// Ambient light for day/night
const ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.3);
scene.add(ambientLight);

// Moon light for night time
const moonLight = new THREE.DirectionalLight(0x8899FF, 0.1);
moonLight.position.set(-100, 150, -100);
scene.add(moonLight);

scene.background = new THREE.Color(0x87CEEB);
scene.fog = new THREE.Fog(0x87CEEB, 300, 500);

// Initialize world
world.init();
world.loadChunksAroundPlayer(player.position);

let lastUpdate = Date.now();
let dayTime = 0.25; // 0-1, 0.25 = sunrise

function updateDayNightCycle(deltaTime) {
  dayTime += deltaTime / 600000; // Full cycle in 10 minutes
  if (dayTime > 1) dayTime -= 1;

  const sunAngle = dayTime * Math.PI * 2;
  const sunIntensity = Math.max(0.1, Math.sin(sunAngle - Math.PI * 0.5)) * 0.9;
  const sunHeight = Math.sin(sunAngle - Math.PI * 0.5) * 150;

  const moonIntensity = Math.max(0, -Math.sin(sunAngle - Math.PI * 0.5)) * 0.3;

  sunLight.intensity = sunIntensity;
  moonLight.intensity = moonIntensity;
  skyLight.intensity = 0.4 + sunIntensity * 0.6;
  ambientLight.intensity = 0.15 + sunIntensity * 0.5 + moonIntensity * 0.3;

  sunLight.position.y = Math.max(50, sunHeight);
  moonLight.position.y = Math.max(50, -sunHeight);

  const fogColor = new THREE.Color();
  fogColor.setHSL(0.58, 0.7, 0.4 + sunIntensity * 0.3);
  scene.background = fogColor;
  scene.fog.color = fogColor;
}

function animate() {
  requestAnimationFrame(animate);

  const now = Date.now();
  const deltaTime = now - lastUpdate;
  lastUpdate = now;

  updateDayNightCycle(deltaTime);

  player.update(world, physics);
  world.loadChunksAroundPlayer(player.position);
  physics.update(player, world, deltaTime);
  ui.update(player, world);

  camera.position.copy(player.position);
  camera.position.y += player.eyeHeight;

  renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

window.addEventListener('click', (e) => {
  if (document.pointerLockElement === document.body) {
    player.interact(world, e.button === 2);
  }
});

document.addEventListener('contextmenu', (e) => {
  if (document.pointerLockElement === document.body) {
    e.preventDefault();
  }
});

document.body.requestPointerLock = document.body.requestPointerLock || document.body.mozRequestPointerLock;
document.addEventListener('click', () => {
  if (document.pointerLockElement !== document.body) {
    document.body.requestPointerLock();
  }
});

window.gameState = { scene, world, player, camera, renderer, physics };

window.startGame = () => {
  document.getElementById('helpOverlay').style.display = 'none';
  document.body.requestPointerLock();
};

animate();
