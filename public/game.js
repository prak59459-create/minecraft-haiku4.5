import * as THREE from 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.module.js';
import { World, BLOCK_TYPES, CHUNK_SIZE } from './terrain.js';
import { Player } from './player.js';

const BLOCK_NAMES = {
  [BLOCK_TYPES.GRASS]: 'Grass',
  [BLOCK_TYPES.DIRT]: 'Dirt',
  [BLOCK_TYPES.STONE]: 'Stone',
  [BLOCK_TYPES.WOOD]: 'Wood',
  [BLOCK_TYPES.LEAVES]: 'Leaves',
  [BLOCK_TYPES.WATER]: 'Water',
  [BLOCK_TYPES.SAND]: 'Sand',
  [BLOCK_TYPES.GRAVEL]: 'Gravel',
  [BLOCK_TYPES.COBBLESTONE]: 'Cobblestone'
};

const HOTBAR_BLOCKS = [
  BLOCK_TYPES.GRASS,
  BLOCK_TYPES.DIRT,
  BLOCK_TYPES.STONE,
  BLOCK_TYPES.WOOD,
  BLOCK_TYPES.LEAVES,
  BLOCK_TYPES.SAND,
  BLOCK_TYPES.GRAVEL,
  BLOCK_TYPES.WATER,
  BLOCK_TYPES.COBBLESTONE
];

class Game {
  constructor() {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFShadowShadowMap;
    document.body.appendChild(this.renderer.domElement);

    this.world = new World();
    this.player = new Player(this.camera);

    this.selectedBlockIndex = 0;
    this.highlightedBlock = null;
    this.meshCache = new Map();

    this.setupScene();
    this.setupLighting();
    this.setupEvents();
    this.setupControls();
    this.animate();
  }

  setupScene() {
    this.scene.background = new THREE.Color(0x87ceeb);
    this.scene.fog = new THREE.Fog(0x87ceeb, 200, 400);
  }

  setupLighting() {
    const skyLight = new THREE.DirectionalLight(0xffffff, 1.2);
    skyLight.position.set(100, 100, 100);
    skyLight.castShadow = true;
    skyLight.shadow.mapSize.width = 2048;
    skyLight.shadow.mapSize.height = 2048;
    skyLight.shadow.camera.near = 0.5;
    skyLight.shadow.camera.far = 500;
    skyLight.shadow.camera.left = -200;
    skyLight.shadow.camera.right = 200;
    skyLight.shadow.camera.top = 200;
    skyLight.shadow.camera.bottom = -200;
    this.scene.add(skyLight);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);

    this.dayNightCycle = {
      time: 0.25,
      speed: 0.0001
    };
  }

  setupEvents() {
    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });

    document.addEventListener('click', () => this.handleLeftClick());
    document.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      this.handleRightClick();
    });

    document.addEventListener('wheel', (e) => {
      e.preventDefault();
      this.selectedBlockIndex = (this.selectedBlockIndex + (e.deltaY > 0 ? 1 : -1)) % HOTBAR_BLOCKS.length;
      if (this.selectedBlockIndex < 0) this.selectedBlockIndex = HOTBAR_BLOCKS.length - 1;
      this.updateHotbar();
    });

    for (let i = 1; i <= 9; i++) {
      document.addEventListener('keydown', (e) => {
        if (e.key === i.toString()) {
          this.selectedBlockIndex = i - 1;
          this.updateHotbar();
        }
      });
    }

    document.addEventListener('mousemove', (e) => {
      if (document.pointerLockElement === document.body || document.fullscreenElement) {
        this.camera.rotation.order = 'YXZ';
        this.camera.rotation.y -= e.movementX * 0.003;
        this.camera.rotation.x -= e.movementY * 0.003;
        this.camera.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.camera.rotation.x));
      }
    });

    document.addEventListener('click', () => {
      document.body.requestPointerLock = document.body.requestPointerLock || document.body.mozRequestPointerLock;
      document.body.requestPointerLock();
    });
  }

  setupControls() {
    this.updateHotbar();
  }

  updateHotbar() {
    const hotbar = document.getElementById('hotbar');
    hotbar.innerHTML = '';
    for (let i = 0; i < HOTBAR_BLOCKS.length; i++) {
      const slot = document.createElement('div');
      slot.className = `hotbar-slot ${i === this.selectedBlockIndex ? 'active' : ''}`;
      slot.textContent = i + 1;
      slot.onclick = () => {
        this.selectedBlockIndex = i;
        this.updateHotbar();
      };
      hotbar.appendChild(slot);
    }
  }

  handleLeftClick() {
    const target = this.player.getBlockInSight(this.world);
    if (target) {
      this.world.setBlock(target.blockPos.x, target.blockPos.y, target.blockPos.z, BLOCK_TYPES.AIR);
      this.refreshNearbyChunks(target.blockPos);
    }
  }

  handleRightClick() {
    const blockType = HOTBAR_BLOCKS[this.selectedBlockIndex];
    const target = this.player.getBlockInSight(this.world);
    if (target) {
      const adjacentPos = this.getAdjacentBlock(target.blockPos);
      if (adjacentPos) {
        this.world.setBlock(adjacentPos.x, adjacentPos.y, adjacentPos.z, blockType);
        this.refreshNearbyChunks(adjacentPos);
      }
    }
  }

  getAdjacentBlock(blockPos) {
    const directions = [
      { x: 1, y: 0, z: 0 },
      { x: -1, y: 0, z: 0 },
      { x: 0, y: 1, z: 0 },
      { x: 0, y: -1, z: 0 },
      { x: 0, y: 0, z: 1 },
      { x: 0, y: 0, z: -1 }
    ];

    for (const dir of directions) {
      const pos = {
        x: blockPos.x + dir.x,
        y: blockPos.y + dir.y,
        z: blockPos.z + dir.z
      };
      if (this.world.getBlock(pos.x, pos.y, pos.z) === BLOCK_TYPES.AIR) {
        return pos;
      }
    }
    return null;
  }

  refreshNearbyChunks(pos) {
    const chunkX = Math.floor(pos.x / CHUNK_SIZE);
    const chunkZ = Math.floor(pos.z / CHUNK_SIZE);
    for (let x = chunkX - 1; x <= chunkX + 1; x++) {
      for (let z = chunkZ - 1; z <= chunkZ + 1; z++) {
        const chunk = this.world.getChunk(x, z);
        if (chunk && chunk.mesh) {
          this.scene.remove(chunk.mesh);
          chunk.buildMesh();
          this.scene.add(chunk.mesh);
        }
      }
    }
  }

  updateScene() {
    this.world.updateChunksAround(this.player.position);

    const visibleChunks = new Set();
    for (const chunk of this.world.chunks.values()) {
      visibleChunks.add(chunk);
      if (!chunk.mesh.parent) {
        this.scene.add(chunk.mesh);
      }
    }

    this.updateHighlight();
    this.updateUI();
  }

  updateHighlight() {
    if (this.highlightedBlock) {
      this.scene.remove(this.highlightedBlock);
    }

    const target = this.player.getBlockInSight(this.world);
    if (target && target.distance < 6) {
      const geometry = new THREE.BoxGeometry(1.001, 1.001, 1.001);
      const material = new THREE.LineBasicMaterial({ color: 0x000000, linewidth: 2 });
      const edges = new THREE.EdgesGeometry(geometry);
      const lines = new THREE.LineSegments(edges, material);
      lines.position.set(
        target.blockPos.x + 0.5,
        target.blockPos.y + 0.5,
        target.blockPos.z + 0.5
      );
      this.scene.add(lines);
      this.highlightedBlock = lines;

      const blockType = this.world.getBlock(target.blockPos.x, target.blockPos.y, target.blockPos.z);
      document.getElementById('blockName').textContent = BLOCK_NAMES[blockType] || 'Unknown';
    } else {
      document.getElementById('blockName').textContent = '';
    }
  }

  updateUI() {
    const chunk = this.world.getChunk(
      Math.floor(this.player.position.x / CHUNK_SIZE),
      Math.floor(this.player.position.z / CHUNK_SIZE)
    );

    const debug = document.getElementById('debug');
    debug.innerHTML = `
      X: ${this.player.position.x.toFixed(1)} Y: ${this.player.position.y.toFixed(1)} Z: ${this.player.position.z.toFixed(1)}<br>
      Chunks: ${this.world.chunks.size}<br>
      Block: ${BLOCK_NAMES[HOTBAR_BLOCKS[this.selectedBlockIndex]]}<br>
      FPS: ${Math.round(1000 / 16.67)}
    `;
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    this.player.update(this.world);
    this.updateScene();

    this.renderer.render(this.scene, this.camera);
  }
}

window.addEventListener('load', () => {
  new Game();
});
