import * as THREE from 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.module.js';

const PLAYER_HEIGHT = 1.8;
const PLAYER_WIDTH = 0.6;
const GRAVITY = 0.0098;
const JUMP_FORCE = 0.25;
const WALK_SPEED = 0.1;
const SPRINT_SPEED = 0.18;
const CROUCH_SPEED = 0.05;

export class Player {
  constructor(camera) {
    this.camera = camera;
    this.position = new THREE.Vector3(0, 80, 0);
    this.velocity = new THREE.Vector3(0, 0, 0);
    this.direction = new THREE.Vector3(0, 0, 0);

    this.isJumping = false;
    this.isSprinting = false;
    this.isCrouching = false;
    this.onGround = false;

    this.keys = {};
    this.camera.position.copy(this.position);
    this.camera.position.y += PLAYER_HEIGHT - 0.2;

    this.setupControls();
  }

  setupControls() {
    document.addEventListener('keydown', (e) => {
      this.keys[e.key.toLowerCase()] = true;
      if (e.key === ' ') {
        e.preventDefault();
        this.jump();
      }
    });

    document.addEventListener('keyup', (e) => {
      this.keys[e.key.toLowerCase()] = false;
    });
  }

  jump() {
    if (this.onGround) {
      this.velocity.y = JUMP_FORCE;
      this.onGround = false;
    }
  }

  update(world) {
    this.isSprinting = this.keys['shift'] && !this.isCrouching;
    const speed = this.isSprinting ? SPRINT_SPEED : (this.isCrouching ? CROUCH_SPEED : WALK_SPEED);

    this.direction.set(0, 0, 0);

    if (this.keys['w']) {
      const forward = new THREE.Vector3(0, 0, -1);
      forward.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.camera.rotation.y);
      this.direction.add(forward);
    }
    if (this.keys['s']) {
      const backward = new THREE.Vector3(0, 0, 1);
      backward.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.camera.rotation.y);
      this.direction.add(backward);
    }
    if (this.keys['a']) {
      const left = new THREE.Vector3(-1, 0, 0);
      left.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.camera.rotation.y);
      this.direction.add(left);
    }
    if (this.keys['d']) {
      const right = new THREE.Vector3(1, 0, 0);
      right.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.camera.rotation.y);
      this.direction.add(right);
    }

    if (this.direction.length() > 0) {
      this.direction.normalize();
      this.direction.multiplyScalar(speed);
    }

    this.position.x += this.direction.x;
    this.position.z += this.direction.z;

    this.velocity.y -= GRAVITY;
    this.position.y += this.velocity.y;

    this.handleCollisions(world);

    this.camera.position.copy(this.position);
    this.camera.position.y += PLAYER_HEIGHT - 0.2;
  }

  handleCollisions(world) {
    const px = this.position.x;
    const py = this.position.y;
    const pz = this.position.z;

    this.onGround = false;

    const checkBlocks = (offset) => {
      for (let x = -PLAYER_WIDTH / 2; x <= PLAYER_WIDTH / 2; x += 0.3) {
        for (let z = -PLAYER_WIDTH / 2; z <= PLAYER_WIDTH / 2; z += 0.3) {
          const block = world.getBlock(
            Math.floor(px + x),
            Math.floor(py + offset),
            Math.floor(pz + z)
          );
          if (block > 0) return true;
        }
      }
      return false;
    };

    if (checkBlocks(0)) {
      this.position.y = py;
      this.velocity.y = 0;
      this.onGround = true;
    }

    if (checkBlocks(PLAYER_HEIGHT)) {
      this.velocity.y = -Math.abs(this.velocity.y);
    }

    if (checkBlocks(PLAYER_HEIGHT / 2)) {
      this.position.x = px;
      this.position.z = pz;
    }

    if (this.position.y < 0) {
      this.position.y = 80;
      this.velocity.y = 0;
    }
  }

  getDirection() {
    const direction = new THREE.Vector3(0, 0, -1);
    direction.applyQuaternion(this.camera.quaternion);
    return direction;
  }

  getBlockInSight(world, maxDistance = 100) {
    const start = this.camera.position.clone();
    const direction = this.getDirection();
    const raycaster = new THREE.Raycaster(start, direction);

    for (let dist = 0; dist < maxDistance; dist += 0.1) {
      const point = start.clone().addScaledVector(direction, dist);
      const block = world.getBlock(
        Math.floor(point.x),
        Math.floor(point.y),
        Math.floor(point.z)
      );
      if (block > 0) {
        return {
          position: point,
          blockPos: {
            x: Math.floor(point.x),
            y: Math.floor(point.y),
            z: Math.floor(point.z)
          },
          distance: dist
        };
      }
    }
    return null;
  }

  getAdjucentBlockPos(world, side) {
    const target = this.getBlockInSight(world);
    if (!target) return null;

    const { blockPos } = target;
    const faces = {
      right: { x: 1, y: 0, z: 0 },
      left: { x: -1, y: 0, z: 0 },
      top: { x: 0, y: 1, z: 0 },
      bottom: { x: 0, y: -1, z: 0 },
      front: { x: 0, y: 0, z: 1 },
      back: { x: 0, y: 0, z: -1 }
    };

    const offset = faces[side] || faces.top;
    return {
      x: blockPos.x + offset.x,
      y: blockPos.y + offset.y,
      z: blockPos.z + offset.z
    };
  }
}
