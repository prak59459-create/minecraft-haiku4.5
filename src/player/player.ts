import * as THREE from 'three';
import { World } from '../world/world';
import { BLOCK_TYPES } from '../world/blocks';
import { CollisionDetector } from '../physics/collision';
import { SoundManager } from '../audio/sound';

const PLAYER_HEIGHT = 1.7;
const PLAYER_RADIUS = 0.3;
const MOVE_SPEED = 6;
const SPRINT_SPEED = 12;
const JUMP_FORCE = 12;
const GRAVITY = 30;

export class Player {
  camera: THREE.PerspectiveCamera;
  canvas: HTMLCanvasElement;
  sound: SoundManager;
  position: THREE.Vector3 = new THREE.Vector3(0, 80, 0);
  velocity: THREE.Vector3 = new THREE.Vector3(0, 0, 0);

  pitch: number = 0;
  yaw: number = 0;

  isOnGround: boolean = false;
  isSprinting: boolean = false;
  wasOnGround: boolean = false;

  keys: { [key: string]: boolean } = {};
  mouseDown: { [key: string]: boolean } = { left: false, right: false };

  constructor(camera: THREE.PerspectiveCamera, canvas: HTMLCanvasElement, sound: SoundManager) {
    this.camera = camera;
    this.canvas = canvas;
    this.sound = sound;
    this.position.copy(camera.position);

    this.setupInputListeners();
  }

  private setupInputListeners() {
    window.addEventListener('keydown', (e) => {
      this.keys[e.key.toLowerCase()] = true;
      if (e.key === 'Shift') this.isSprinting = true;
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.key.toLowerCase()] = false;
      if (e.key === 'Shift') this.isSprinting = false;
    });

    document.addEventListener('mousemove', (e) => {
      if (document.pointerLockElement === this.canvas) {
        this.yaw -= e.movementX * 0.003;
        this.pitch -= e.movementY * 0.003;
        this.pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.pitch));
      }
    });

    this.canvas.addEventListener('click', () => {
      if (document.pointerLockElement !== this.canvas) {
        this.canvas.requestPointerLock();
      }
    });

    document.addEventListener('mousedown', (e) => {
      if (e.button === 0) this.mouseDown.left = true;
      if (e.button === 2) this.mouseDown.right = true;
    });

    document.addEventListener('mouseup', (e) => {
      if (e.button === 0) this.mouseDown.left = false;
      if (e.button === 2) this.mouseDown.right = false;
    });

    document.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  update(deltaTime: number, world: World) {
    this.updateMovement(deltaTime, world);
    this.updateInteraction(world);

    this.camera.position.copy(this.position);
    this.camera.position.y += PLAYER_HEIGHT / 2;

    this.camera.rotation.order = 'YXZ';
    this.camera.rotation.y = this.yaw;
    this.camera.rotation.x = this.pitch;
  }

  private updateMovement(deltaTime: number, world: World) {
    const moveDirection = new THREE.Vector3();
    const speed = this.isSprinting ? SPRINT_SPEED : MOVE_SPEED;

    if (this.keys['w']) moveDirection.z -= 1;
    if (this.keys['s']) moveDirection.z += 1;
    if (this.keys['a']) moveDirection.x -= 1;
    if (this.keys['d']) moveDirection.x += 1;

    if (moveDirection.length() > 0) {
      moveDirection.normalize();

      const xAxis = new THREE.Vector3(Math.cos(this.yaw + Math.PI / 2), 0, Math.sin(this.yaw + Math.PI / 2));
      const zAxis = new THREE.Vector3(Math.cos(this.yaw), 0, Math.sin(this.yaw));

      const moveX = xAxis.multiplyScalar(moveDirection.x);
      const moveZ = zAxis.multiplyScalar(moveDirection.z);
      moveX.add(moveZ);
      moveX.multiplyScalar(speed);

      this.velocity.x = moveX.x;
      this.velocity.z = moveX.z;
    } else {
      this.velocity.x *= 0.8;
      this.velocity.z *= 0.8;
    }

    this.velocity.y -= GRAVITY * deltaTime;

    if (this.keys[' '] && this.isOnGround) {
      this.velocity.y = JUMP_FORCE;
      this.isOnGround = false;
      this.sound.playJump();
    }

    const newPos = this.position.clone().addScaledVector(this.velocity, deltaTime);
    this.updateCollision(newPos, world);
  }

  private updateCollision(newPos: THREE.Vector3, world: World) {
    const collidingBlocks = CollisionDetector.getCollidingBlocks(
      newPos,
      PLAYER_RADIUS,
      PLAYER_HEIGHT,
      world
    );

    if (collidingBlocks.length > 0) {
      const result = CollisionDetector.resolveCollision(
        newPos,
        this.velocity,
        collidingBlocks,
        PLAYER_RADIUS,
        PLAYER_HEIGHT
      );
      this.position.copy(result.position);
      this.velocity.copy(result.velocity);

      if (result.grounded && !this.wasOnGround) {
        this.sound.playFootstep();
      }

      this.isOnGround = result.grounded;
    } else {
      this.position.copy(newPos);
      this.isOnGround = false;
    }

    this.wasOnGround = this.isOnGround;
  }

  private updateInteraction(world: World) {
    const direction = new THREE.Vector3(0, 0, -1);
    direction.applyAxisAngle(new THREE.Vector3(1, 0, 0), this.pitch);
    direction.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.yaw);

    const eyePos = this.position.clone();
    eyePos.y += PLAYER_HEIGHT / 2;

    if (this.mouseDown.left) {
      const hit = world.raycast(eyePos, direction, 4);
      if (hit) {
        world.destroyBlock(hit.blockPos);
      }
      this.mouseDown.left = false;
    }

    if (this.mouseDown.right) {
      const hit = world.raycast(eyePos, direction, 4);
      if (hit) {
        const placePos = hit.blockPos.clone().add(hit.normal);
        world.placeBlock(placePos, world.selectedBlock);
      }
      this.mouseDown.right = false;
    }

    for (let i = 1; i <= 9; i++) {
      if (this.keys[i.toString()]) {
        world.selectedBlock = i;
      }
    }
  }
}
