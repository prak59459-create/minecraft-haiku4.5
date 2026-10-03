import * as THREE from 'three';
import { BLOCKS } from './world.js';

export class Player {
  constructor(camera) {
    this.camera = camera;
    this.position = new THREE.Vector3(0, 100, 0);
    this.velocity = new THREE.Vector3();
    this.acceleration = new THREE.Vector3();

    this.eyeHeight = 1.62;
    this.width = 0.6;
    this.height = 1.8;
    this.isGrounded = false;
    this.isSprinting = false;
    this.isCrouching = false;

    this.moveSpeed = 0.1;
    this.sprintSpeed = 0.15;
    this.gravity = 0.008;
    this.jumpForce = 0.2;

    this.keys = {};
    this.raycaster = new THREE.Raycaster();
    this.selectedBlock = BLOCKS.DIRT;
    this.selectedBlockIndex = 1;

    this.setupControls();
    this.setupBlockSelector();
  }

  setupControls() {
    document.addEventListener('keydown', (e) => {
      this.keys[e.key.toLowerCase()] = true;

      if (e.key === ' ') {
        e.preventDefault();
        if (this.isGrounded) {
          this.velocity.y = this.jumpForce;
          this.isGrounded = false;
        }
      }

      // Block selector
      const num = parseInt(e.key);
      if (num >= 1 && num <= 9) {
        this.selectBlock(num - 1);
      }
    });

    document.addEventListener('keyup', (e) => {
      this.keys[e.key.toLowerCase()] = false;
    });

    document.addEventListener('mousemove', (e) => {
      if (document.pointerLockElement === document.body) {
        this.camera.rotation.order = 'YXZ';
        this.camera.rotation.y -= e.movementX * 0.003;
        this.camera.rotation.x -= e.movementY * 0.003;

        this.camera.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.camera.rotation.x));
      }
    });

    document.addEventListener('wheel', (e) => {
      e.preventDefault();
      if (e.deltaY < 0) {
        this.selectBlock((this.selectedBlockIndex - 1 + 9) % 9);
      } else {
        this.selectBlock((this.selectedBlockIndex + 1) % 9);
      }
    }, { passive: false });
  }

  setupBlockSelector() {
    const blockTypes = [BLOCKS.DIRT, BLOCKS.GRASS, BLOCKS.STONE, BLOCKS.WOOD, BLOCKS.LEAVES, BLOCKS.WATER, BLOCKS.SAND, BLOCKS.STONE, BLOCKS.DIRT];
    const blockNames = ['Dirt', 'Grass', 'Stone', 'Wood', 'Leaves', 'Water', 'Sand', 'Stone', 'Dirt'];
    const selector = document.getElementById('blockSelector');

    blockTypes.forEach((block, i) => {
      const slot = document.createElement('div');
      slot.className = 'blockSlot';
      if (i === 0) slot.classList.add('active');
      slot.textContent = (i + 1);
      slot.title = blockNames[i];
      slot.onclick = () => this.selectBlock(i);
      selector.appendChild(slot);
    });
  }

  selectBlock(index) {
    this.selectedBlockIndex = index % 9;
    const blockTypes = [BLOCKS.DIRT, BLOCKS.GRASS, BLOCKS.STONE, BLOCKS.WOOD, BLOCKS.LEAVES, BLOCKS.WATER, BLOCKS.SAND, BLOCKS.STONE, BLOCKS.DIRT];
    this.selectedBlock = blockTypes[this.selectedBlockIndex];

    document.querySelectorAll('.blockSlot').forEach((slot, i) => {
      slot.classList.toggle('active', i === this.selectedBlockIndex);
    });
  }

  update(world, physics) {
    const forward = new THREE.Vector3();
    const right = new THREE.Vector3(1, 0, 0);

    this.camera.getWorldDirection(forward);
    forward.y = 0;
    forward.normalize();

    this.camera.matrix.extractBasis(right, new THREE.Vector3(), forward);
    right.y = 0;
    right.normalize();

    this.isSprinting = this.keys['shift'];
    this.isCrouching = this.keys['control'];

    let moveDir = new THREE.Vector3();
    const speed = this.isSprinting ? this.sprintSpeed : this.moveSpeed;

    if (this.keys['w']) moveDir.add(forward);
    if (this.keys['s']) moveDir.add(forward.clone().multiplyScalar(-1));
    if (this.keys['a']) moveDir.add(right.clone().multiplyScalar(-1));
    if (this.keys['d']) moveDir.add(right);

    if (moveDir.length() > 0) {
      moveDir.normalize().multiplyScalar(speed);
      this.velocity.x = moveDir.x;
      this.velocity.z = moveDir.z;
    } else {
      this.velocity.x *= 0.9;
      this.velocity.z *= 0.9;
    }
  }

  interact(world, isPlace) {
    const origin = this.position.clone();
    origin.y += this.eyeHeight;

    const direction = new THREE.Vector3();
    this.camera.getWorldDirection(direction);

    const step = 0.1;
    let dist = 0;
    const maxDist = 5;

    while (dist < maxDist) {
      const checkPos = origin.clone().add(direction.clone().multiplyScalar(dist));
      const x = Math.floor(checkPos.x);
      const y = Math.floor(checkPos.y);
      const z = Math.floor(checkPos.z);

      const block = world.getBlockAt(x, y, z);

      if (block !== BLOCKS.AIR && block !== BLOCKS.WATER) {
        if (isPlace) {
          // Place block
          const prevPos = origin.clone().add(direction.clone().multiplyScalar(dist - 0.1));
          const px = Math.floor(prevPos.x);
          const py = Math.floor(prevPos.y);
          const pz = Math.floor(prevPos.z);
          world.setBlockAt(px, py, pz, this.selectedBlock);
        } else {
          // Destroy block
          world.setBlockAt(x, y, z, BLOCKS.AIR);
        }
        break;
      }

      dist += step;
    }
  }
}
