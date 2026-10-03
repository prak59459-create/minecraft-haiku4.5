import * as THREE from 'three';
import { CHUNK_SIZE, RENDER_DISTANCE, SKY_COLOR, WORLD_SEED, PLAYER } from './config.js';
import { BLOCK, BLOCK_INFO, HOTBAR } from './block-types.js';
import { World } from './world.js';
import { Player } from './player.js';
import { Input } from './input.js';
import { raycast } from './physics.js';

const ACTION_REPEAT = 0.25;

const renderer = new THREE.WebGLRenderer({ antialias: false });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(SKY_COLOR);
scene.fog = new THREE.Fog(SKY_COLOR, (RENDER_DISTANCE - 2) * CHUNK_SIZE, RENDER_DISTANCE * CHUNK_SIZE);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.05, 1000);

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

const world = new World(scene, WORLD_SEED, RENDER_DISTANCE);
world.loadImmediate(0, 0, 2);

const player = new Player(camera, world);
player.spawnAt(0.5, 0.5);

const input = new Input(renderer.domElement);

const highlight = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.BoxGeometry(1.002, 1.002, 1.002)),
    new THREE.LineBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.6 })
);
highlight.visible = false;
scene.add(highlight);

// HUD
const hotbarEl = document.getElementById('hotbar');
const blockNameEl = document.getElementById('block-name');
const debugEl = document.getElementById('debug');
const overlayEl = document.getElementById('overlay');
let selected = 0;
let blockNameTimer = 0;

HOTBAR.forEach((id, i) => {
    const slot = document.createElement('div');
    slot.className = 'slot';
    slot.innerHTML = `<div class="swatch"></div><span>${i + 1}</span>`;
    slot.querySelector('.swatch').style.background = '#' + BLOCK_INFO[id].hex.toString(16).padStart(6, '0');
    hotbarEl.appendChild(slot);
});

function selectSlot(index) {
    selected = ((index % HOTBAR.length) + HOTBAR.length) % HOTBAR.length;
    hotbarEl.querySelectorAll('.slot').forEach((el, i) => el.classList.toggle('active', i === selected));
    blockNameEl.textContent = BLOCK_INFO[HOTBAR[selected]].name;
    blockNameEl.style.opacity = 1;
    blockNameTimer = 1.5;
}
selectSlot(0);

input.onLockChange = (locked) => {
    overlayEl.style.display = locked ? 'none' : 'flex';
};

// Interaction
let actionCooldown = 0;
let target = null;
const eye = new THREE.Vector3();
const dir = new THREE.Vector3();

function breakBlock() {
    if (!target || !BLOCK_INFO[target.id].breakable) return;
    world.setBlock(target.x, target.y, target.z, BLOCK.AIR);
}

function placeBlock() {
    if (!target) return;
    const x = target.x + target.normal[0];
    const y = target.y + target.normal[1];
    const z = target.z + target.normal[2];
    const current = world.getBlock(x, y, z);
    if (current !== BLOCK.AIR && current !== BLOCK.WATER) return;
    const id = HOTBAR[selected];
    if (BLOCK_INFO[id].solid && player.intersectsBlock(x, y, z)) return;
    world.setBlock(x, y, z, id);
}

function handleInteraction(dt) {
    player.getEyePosition(eye);
    player.getLookDirection(dir);
    target = raycast(world, eye, dir, PLAYER.reach);

    if (target) {
        highlight.position.set(target.x + 0.5, target.y + 0.5, target.z + 0.5);
        highlight.visible = true;
    } else {
        highlight.visible = false;
    }

    actionCooldown -= dt;
    const left = input.buttons.has(0);
    const right = input.buttons.has(2);
    if (!left && !right) {
        actionCooldown = 0;
        return;
    }
    if (actionCooldown > 0) return;
    if (left) breakBlock();
    else if (right) placeBlock();
    actionCooldown = ACTION_REPEAT;
}

// Loop
const clock = new THREE.Clock();
let fpsFrames = 0;
let fpsTime = 0;
let fps = 0;

function frame() {
    requestAnimationFrame(frame);
    const dt = Math.min(clock.getDelta(), 0.05);

    const f = input.consumeFrame();
    if (input.locked) {
        player.look(f.dx, f.dy);
        if (f.wheel) selectSlot(selected + f.wheel);
        for (const code of f.pressed) {
            const m = /^Digit([1-9])$/.exec(code);
            if (m) selectSlot(Number(m[1]) - 1);
        }
    }

    world.update(player.position.x, player.position.z);
    player.update(dt, input);
    handleInteraction(dt);

    if (blockNameTimer > 0) {
        blockNameTimer -= dt;
        if (blockNameTimer <= 0) blockNameEl.style.opacity = 0;
    }

    fpsFrames++;
    fpsTime += dt;
    if (fpsTime >= 0.5) {
        fps = Math.round(fpsFrames / fpsTime);
        fpsFrames = 0;
        fpsTime = 0;
        const p = player.position;
        debugEl.textContent =
            `FPS ${fps}\n` +
            `XYZ ${p.x.toFixed(1)} ${p.y.toFixed(1)} ${p.z.toFixed(1)}\n` +
            `Chunk ${Math.floor(p.x / CHUNK_SIZE)} ${Math.floor(p.z / CHUNK_SIZE)}  loaded ${world.chunkCount}\n` +
            `Draw calls ${renderer.info.render.calls}`;
    }

    renderer.render(scene, camera);
}

frame();

window.game = { world, player, scene, camera, renderer };
