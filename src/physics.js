import * as THREE from 'three';
import { BLOCKS } from './world.js';

export class Physics {
  constructor(world) {
    this.world = world;
    this.gravity = 0.008;
    this.friction = 0.95;
  }

  update(player, world, deltaTime) {
    // Apply gravity
    player.velocity.y -= this.gravity;
    player.velocity.y = Math.max(player.velocity.y, -0.3);

    // Update position
    player.position.add(player.velocity);

    // Collision detection
    this.resolveCollisions(player, world);
  }

  resolveCollisions(player, world) {
    const minX = player.position.x - player.width / 2;
    const maxX = player.position.x + player.width / 2;
    const minY = player.position.y;
    const maxY = player.position.y + player.height;
    const minZ = player.position.z - player.width / 2;
    const maxZ = player.position.z + player.width / 2;

    player.isGrounded = false;

    const checkX = [
      Math.floor(minX), Math.floor(minX) + 1,
      Math.floor(maxX), Math.floor(maxX) + 1
    ];
    const checkY = [
      Math.floor(minY), Math.floor(minY) + 1,
      Math.floor(maxY), Math.floor(maxY) + 1
    ];
    const checkZ = [
      Math.floor(minZ), Math.floor(minZ) + 1,
      Math.floor(maxZ), Math.floor(maxZ) + 1
    ];

    for (const x of checkX) {
      for (const y of checkY) {
        for (const z of checkZ) {
          const block = world.getBlockAt(x, y, z);
          if (block !== BLOCKS.AIR && block !== BLOCKS.WATER) {
            this.resolveBlockCollision(player, x, y, z);
          }
        }
      }
    }
  }

  resolveBlockCollision(player, bx, by, bz) {
    const px = player.position.x;
    const py = player.position.y;
    const pz = player.position.z;

    const dx = px - (bx + 0.5);
    const dy = py + player.height / 2 - (by + 0.5);
    const dz = pz - (bz + 0.5);

    const minDist = Math.min(
      Math.abs(dx) - player.width / 2 - 0.5,
      Math.abs(dy) - player.height / 2 - 0.5,
      Math.abs(dz) - player.width / 2 - 0.5
    );

    if (minDist < 0.01) {
      if (Math.abs(dx) - player.width / 2 < Math.abs(dy) - player.height / 2 &&
          Math.abs(dx) - player.width / 2 < Math.abs(dz) - player.width / 2) {
        player.position.x += dx > 0 ? -minDist : minDist;
        player.velocity.x = 0;
      } else if (Math.abs(dy) - player.height / 2 < Math.abs(dz) - player.width / 2) {
        player.position.y += dy > 0 ? -minDist : minDist;

        if (dy > 0) {
          player.isGrounded = true;
          player.velocity.y = 0;
        } else {
          player.velocity.y = 0;
        }
      } else {
        player.position.z += dz > 0 ? -minDist : minDist;
        player.velocity.z = 0;
      }
    }
  }
}
