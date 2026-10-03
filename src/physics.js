import { BLOCK_INFO } from './block-types.js';

const EPS = 1e-4;

// Voxel traversal (Amanatides & Woo). Returns the first targetable block and the face normal that was hit.
export function raycast(world, origin, dir, maxDist) {
    let x = Math.floor(origin.x);
    let y = Math.floor(origin.y);
    let z = Math.floor(origin.z);
    const stepX = Math.sign(dir.x);
    const stepY = Math.sign(dir.y);
    const stepZ = Math.sign(dir.z);
    const tDeltaX = stepX !== 0 ? Math.abs(1 / dir.x) : Infinity;
    const tDeltaY = stepY !== 0 ? Math.abs(1 / dir.y) : Infinity;
    const tDeltaZ = stepZ !== 0 ? Math.abs(1 / dir.z) : Infinity;
    let tMaxX = stepX > 0 ? (x + 1 - origin.x) * tDeltaX : stepX < 0 ? (origin.x - x) * tDeltaX : Infinity;
    let tMaxY = stepY > 0 ? (y + 1 - origin.y) * tDeltaY : stepY < 0 ? (origin.y - y) * tDeltaY : Infinity;
    let tMaxZ = stepZ > 0 ? (z + 1 - origin.z) * tDeltaZ : stepZ < 0 ? (origin.z - z) * tDeltaZ : Infinity;
    const normal = [0, 0, 0];
    let t = 0;

    while (t <= maxDist) {
        const id = world.getBlock(x, y, z);
        if (BLOCK_INFO[id].targetable) {
            return { x, y, z, id, normal: [...normal], distance: t };
        }
        if (tMaxX < tMaxY && tMaxX < tMaxZ) {
            x += stepX;
            t = tMaxX;
            tMaxX += tDeltaX;
            normal[0] = -stepX; normal[1] = 0; normal[2] = 0;
        } else if (tMaxY < tMaxZ) {
            y += stepY;
            t = tMaxY;
            tMaxY += tDeltaY;
            normal[0] = 0; normal[1] = -stepY; normal[2] = 0;
        } else {
            z += stepZ;
            t = tMaxZ;
            tMaxZ += tDeltaZ;
            normal[0] = 0; normal[1] = 0; normal[2] = -stepZ;
        }
    }
    return null;
}

export function aabbOverlapsSolid(world, minX, minY, minZ, maxX, maxY, maxZ) {
    const x0 = Math.floor(minX), x1 = Math.ceil(maxX) - 1;
    const y0 = Math.floor(minY), y1 = Math.ceil(maxY) - 1;
    const z0 = Math.floor(minZ), z1 = Math.ceil(maxZ) - 1;
    for (let y = y0; y <= y1; y++) {
        for (let z = z0; z <= z1; z++) {
            for (let x = x0; x <= x1; x++) {
                if (world.isSolid(x, y, z)) return true;
            }
        }
    }
    return false;
}

// Moves a feet-anchored box along one axis and clamps it against solid blocks. Returns true on collision.
export function moveAxis(world, pos, halfWidth, height, axis, amount) {
    if (amount === 0) return false;
    pos[axis] += amount;

    const minX = pos.x - halfWidth, maxX = pos.x + halfWidth;
    const minY = pos.y, maxY = pos.y + height;
    const minZ = pos.z - halfWidth, maxZ = pos.z + halfWidth;
    const x0 = Math.floor(minX), x1 = Math.ceil(maxX) - 1;
    const y0 = Math.floor(minY), y1 = Math.ceil(maxY) - 1;
    const z0 = Math.floor(minZ), z1 = Math.ceil(maxZ) - 1;

    let hit = false;
    let limit = amount > 0 ? Infinity : -Infinity;
    for (let y = y0; y <= y1; y++) {
        for (let z = z0; z <= z1; z++) {
            for (let x = x0; x <= x1; x++) {
                if (!world.isSolid(x, y, z)) continue;
                hit = true;
                const b = axis === 'x' ? x : axis === 'y' ? y : z;
                limit = amount > 0 ? Math.min(limit, b) : Math.max(limit, b + 1);
            }
        }
    }
    if (!hit) return false;

    if (axis === 'y') pos.y = amount > 0 ? limit - height - EPS : limit + EPS;
    else pos[axis] = amount > 0 ? limit - halfWidth - EPS : limit + halfWidth + EPS;
    return true;
}
