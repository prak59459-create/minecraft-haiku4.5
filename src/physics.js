class Physics {
    constructor(world) {
        this.world = world;
        this.gravity = CONFIG.GRAVITY;
    }

    getBlockAt(x, y, z) {
        const blockCoords = Utils.getBlockCoords(x, y, z);
        if (blockCoords.y < 0 || blockCoords.y >= CONFIG.CHUNK_HEIGHT) {
            return BLOCK_TYPES.AIR;
        }

        const chunk = this.world.getChunk(blockCoords.x, blockCoords.z);
        if (!chunk) return BLOCK_TYPES.AIR;

        const localCoords = Utils.getLocalBlockCoords(blockCoords.x, blockCoords.y, blockCoords.z);
        return chunk.getBlock(localCoords.x, localCoords.y, localCoords.z) || BLOCK_TYPES.AIR;
    }

    isBlockSolid(x, y, z) {
        const block = this.getBlockAt(x, y, z);
        return block !== BLOCK_TYPES.AIR && BLOCK_PROPERTIES[block]?.solid;
    }

    checkCollision(position, radius) {
        const margin = 0.01;
        const checkPoints = [
            [0, 0, 0],
            [radius, 0, 0],
            [-radius, 0, 0],
            [0, 0, radius],
            [0, 0, -radius],
            [radius, 0, radius],
            [-radius, 0, radius],
            [radius, 0, -radius],
            [-radius, 0, -radius],
            [0, radius - 0.1, 0],
            [0, -radius, 0]
        ];

        for (const offset of checkPoints) {
            const x = position.x + offset[0];
            const y = position.y + offset[1];
            const z = position.z + offset[2];

            if (this.isBlockSolid(x, y, z)) {
                return true;
            }
        }
        return false;
    }

    raycast(origin, direction, maxDistance = 1000) {
        let current = origin.clone();
        const step = 0.1;
        let distance = 0;

        const hits = [];

        while (distance < maxDistance) {
            current.addScaledVector(direction, step);
            distance += step;

            const block = this.getBlockAt(current.x, current.y, current.z);
            if (block !== BLOCK_TYPES.AIR && BLOCK_PROPERTIES[block]?.solid) {
                const coords = Utils.getBlockCoords(current.x, current.y, current.z);
                const blockKey = Utils.blockKey(coords.x, coords.y, coords.z);

                if (hits.length === 0 || hits[hits.length - 1].blockKey !== blockKey) {
                    hits.push({
                        position: current.clone(),
                        blockCoords: coords,
                        blockKey: blockKey,
                        distance: distance,
                        block: block
                    });
                }

                if (hits.length >= 2) break;
            }
        }

        return hits.length > 0 ? hits[0] : null;
    }

    update(player, deltaTime) {
        if (!player.onGround) {
            player.velocity.y -= this.gravity * deltaTime;
        } else {
            player.velocity.y = Math.max(0, player.velocity.y);
        }

        player.velocity.y = Math.max(-100, Math.min(100, player.velocity.y));

        let newPos = player.position.clone();
        newPos.addScaledVector(player.velocity, deltaTime);

        if (!this.checkCollision(newPos, CONFIG.PLAYER_WIDTH / 2)) {
            player.position.copy(newPos);
        } else {
            player.onGround = player.velocity.y <= 0;
            player.velocity.y = 0;
        }

        const floorY = Math.floor(player.position.y);
        const ceilY = Math.ceil(player.position.y);
        player.onGround = false;

        if (floorY > 0 && floorY < CONFIG.CHUNK_HEIGHT) {
            if (this.isBlockSolid(player.position.x, floorY - 0.1, player.position.z)) {
                player.onGround = true;
            }
        }
    }
}
