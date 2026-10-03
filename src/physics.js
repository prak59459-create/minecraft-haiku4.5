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
        const step = 0.2;
        let distance = 0;
        let current = origin.clone();
        let lastBlockKey = null;

        while (distance < maxDistance) {
            current.addScaledVector(direction, step);
            distance += step;

            const coords = Utils.getBlockCoords(current.x, current.y, current.z);
            const blockKey = Utils.blockKey(coords.x, coords.y, coords.z);

            if (lastBlockKey !== blockKey) {
                const block = this.getBlockAt(coords.x, coords.y, coords.z);
                if (block !== BLOCK_TYPES.AIR && BLOCK_PROPERTIES[block]?.solid) {
                    return {
                        position: current.clone(),
                        blockCoords: coords,
                        blockKey: blockKey,
                        distance: distance,
                        block: block
                    };
                }
                lastBlockKey = blockKey;
            }
        }

        return null;
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
