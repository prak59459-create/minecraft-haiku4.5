import * as THREE from 'three';
import { BlockType } from '../world/BlockType.js';

export class CollisionDetector {
    constructor(chunkManager) {
        this.chunkManager = chunkManager;
        this.playerRadius = 0.3;
        this.playerHeight = 1.6;
    }

    isBlockSolid(blockType) {
        return blockType > 0 && blockType !== BlockType.WATER;
    }

    checkPointCollision(point) {
        const x = Math.floor(point.x);
        const y = Math.floor(point.y);
        const z = Math.floor(point.z);

        const block = this.chunkManager.getBlock(x, y, z);
        return this.isBlockSolid(block);
    }

    checkSphereCollision(center, radius) {
        const minX = Math.floor(center.x - radius);
        const maxX = Math.floor(center.x + radius);
        const minY = Math.floor(center.y - radius);
        const maxY = Math.floor(center.y + radius);
        const minZ = Math.floor(center.z - radius);
        const maxZ = Math.floor(center.z + radius);

        for (let x = minX; x <= maxX; x++) {
            for (let y = minY; y <= maxY; y++) {
                for (let z = minZ; z <= maxZ; z++) {
                    const block = this.chunkManager.getBlock(x, y, z);
                    if (this.isBlockSolid(block)) {
                        const blockCenter = new THREE.Vector3(x + 0.5, y + 0.5, z + 0.5);
                        const dist = blockCenter.distanceTo(center);
                        if (dist < radius + Math.sqrt(3) * 0.5) {
                            return true;
                        }
                    }
                }
            }
        }

        return false;
    }

    checkCylinderCollision(position, radius, height) {
        const checkPoints = [];

        // Create check points around the cylinder
        for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 4) {
            checkPoints.push(new THREE.Vector3(
                position.x + Math.cos(angle) * radius,
                position.y + height / 2,
                position.z + Math.sin(angle) * radius
            ));
        }

        // Check top and bottom
        checkPoints.push(new THREE.Vector3(position.x, position.y, position.z));
        checkPoints.push(new THREE.Vector3(position.x, position.y + height, position.z));

        for (const point of checkPoints) {
            if (this.checkPointCollision(point)) {
                return true;
            }
        }

        return false;
    }

    resolveCollision(position, velocity, radius, height) {
        const checkPositions = [
            position.clone(),
            position.clone().add(velocity)
        ];

        for (const checkPos of checkPositions) {
            if (this.checkCylinderCollision(checkPos, radius, height)) {
                return { collision: true, position: position.clone() };
            }
        }

        position.add(velocity);
        return { collision: false, position };
    }
}
