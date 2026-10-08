import { BLOCKS, isBlockSolid } from './blocks.js';

export class Raycaster {
    constructor(world, raycastDistance = 6, stepSize = 0.05) {
        this.world = world;
        this.raycastDistance = raycastDistance;
        this.stepSize = stepSize;
    }

    raycast(eyePos, direction) {
        let hit = null;

        for (let dist = this.stepSize; dist <= this.raycastDistance; dist += this.stepSize) {
            const x = eyePos.x + direction.x * dist;
            const y = eyePos.y + direction.y * dist;
            const z = eyePos.z + direction.z * dist;

            const bx = Math.floor(x);
            const by = Math.floor(y);
            const bz = Math.floor(z);

            const block = this.world.getBlock(bx, by, bz);
            if (isBlockSolid(block)) {
                const prevDist = Math.max(this.stepSize, dist - this.stepSize);
                const prevX = eyePos.x + direction.x * prevDist;
                const prevY = eyePos.y + direction.y * prevDist;
                const prevZ = eyePos.z + direction.z * prevDist;

                const prevBx = Math.floor(prevX);
                const prevBy = Math.floor(prevY);
                const prevBz = Math.floor(prevZ);

                let normal = { x: 0, y: 0, z: 0 };
                if (prevBx !== bx) normal.x = prevBx < bx ? -1 : 1;
                else if (prevBy !== by) normal.y = prevBy < by ? -1 : 1;
                else if (prevBz !== bz) normal.z = prevBz < bz ? -1 : 1;

                hit = { x: bx, y: by, z: bz, block, normal, dist, prevX, prevY, prevZ };
                break;
            }
        }

        if (!hit) {
            hit = {
                x: 0,
                y: 0,
                z: 0,
                block: BLOCKS.AIR,
                normal: { x: 0, y: 1, z: 0 },
                dist: this.raycastDistance
            };
        }

        return hit;
    }

    setRaycastDistance(distance) {
        this.raycastDistance = Math.max(1, Math.min(15, distance));
    }

    getHitBlock(raycastHit) {
        if (!raycastHit || raycastHit.block === BLOCKS.AIR) {
            return null;
        }
        return raycastHit;
    }

    getPlacePosition(raycastHit) {
        if (!raycastHit || raycastHit.block === BLOCKS.AIR) {
            return null;
        }

        const norm = raycastHit.normal;
        return {
            x: raycastHit.x + norm.x,
            y: raycastHit.y + norm.y,
            z: raycastHit.z + norm.z
        };
    }
}
