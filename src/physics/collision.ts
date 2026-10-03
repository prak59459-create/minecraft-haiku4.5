import * as THREE from 'three';
import { World } from '../world/world';
import { BLOCK_TYPES } from '../world/blocks';

const EPSILON = 0.01;

export class CollisionDetector {
  static getCollidingBlocks(
    pos: THREE.Vector3,
    radius: number,
    height: number,
    world: World
  ): THREE.Vector3[] {
    const blocks: THREE.Vector3[] = [];

    const minX = Math.floor(pos.x - radius);
    const maxX = Math.ceil(pos.x + radius);
    const minY = Math.floor(pos.y - height);
    const maxY = Math.ceil(pos.y);
    const minZ = Math.floor(pos.z - radius);
    const maxZ = Math.ceil(pos.z + radius);

    for (let x = minX; x <= maxX; x++) {
      for (let y = minY; y <= maxY; y++) {
        for (let z = minZ; z <= maxZ; z++) {
          const blockType = world.getBlockAt(new THREE.Vector3(x, y, z));
          if (this.isCollidable(blockType)) {
            blocks.push(new THREE.Vector3(x, y, z));
          }
        }
      }
    }

    return blocks;
  }

  static isCollidable(blockType: number): boolean {
    return blockType !== BLOCK_TYPES.AIR && blockType !== BLOCK_TYPES.WATER;
  }

  static testAABB(
    playerPos: THREE.Vector3,
    playerRadius: number,
    playerHeight: number,
    blockPos: THREE.Vector3
  ): boolean {
    const px = playerPos.x;
    const py = playerPos.y;
    const pz = playerPos.z;

    const bx = blockPos.x;
    const by = blockPos.y;
    const bz = blockPos.z;

    return (
      px + playerRadius > bx &&
      px - playerRadius < bx + 1 &&
      py < by + 1 &&
      py + playerHeight > by &&
      pz + playerRadius > bz &&
      pz - playerRadius < bz + 1
    );
  }

  static resolveCollision(
    pos: THREE.Vector3,
    vel: THREE.Vector3,
    collidingBlocks: THREE.Vector3[],
    radius: number,
    height: number
  ): { position: THREE.Vector3; velocity: THREE.Vector3; grounded: boolean } {
    let grounded = false;

    for (const block of collidingBlocks) {
      const collision = this.getCollisionSide(
        pos,
        radius,
        height,
        block
      );

      if (collision.side === 'bottom' && vel.y < 0) {
        pos.y = block.y + 1 + height - EPSILON;
        vel.y = 0;
        grounded = true;
      } else if (collision.side === 'top' && vel.y > 0) {
        pos.y = block.y - EPSILON;
        vel.y = 0;
      } else if (collision.side === 'north' && vel.z < 0) {
        pos.z = block.z + 1 + radius + EPSILON;
      } else if (collision.side === 'south' && vel.z > 0) {
        pos.z = block.z - radius - EPSILON;
      } else if (collision.side === 'west' && vel.x < 0) {
        pos.x = block.x + 1 + radius + EPSILON;
      } else if (collision.side === 'east' && vel.x > 0) {
        pos.x = block.x - radius - EPSILON;
      }
    }

    return { position: pos, velocity: vel, grounded };
  }

  private static getCollisionSide(
    pos: THREE.Vector3,
    radius: number,
    height: number,
    block: THREE.Vector3
  ): { side: string } {
    const dx = pos.x - (block.x + 0.5);
    const dy = pos.y + height / 2 - (block.y + 0.5);
    const dz = pos.z - (block.z + 0.5);

    const px = Math.max(0, Math.abs(dx) - (0.5 + radius));
    const py = Math.max(0, Math.abs(dy) - 0.5 - height / 2);
    const pz = Math.max(0, Math.abs(dz) - (0.5 + radius));

    if (px > py && px > pz) {
      return { side: dx > 0 ? 'east' : 'west' };
    } else if (py > px && py > pz) {
      return { side: dy > 0 ? 'top' : 'bottom' };
    } else {
      return { side: dz > 0 ? 'south' : 'north' };
    }
  }
}
