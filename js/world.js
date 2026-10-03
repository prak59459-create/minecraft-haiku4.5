class World {
    constructor(scene, noise) {
        this.scene = scene;
        this.noise = noise;
        this.chunks = new Map();
        this.loadedChunks = new Set();
        this.toLoad = new Set();
        this.toUnload = new Set();
        this.chunkCache = new Map();
        this.meshScene = new THREE.Group();
        this.scene.add(this.meshScene);
    }

    getChunkKey(x, z) {
        return `${x},${z}`;
    }

    getChunk(x, z, create = false) {
        const key = this.getChunkKey(x, z);
        if (!this.chunks.has(key)) {
            if (!create) return null;
            const chunk = new Chunk(x, z, this.noise);
            this.chunks.set(key, chunk);
            this.loadedChunks.add(key);
            return chunk;
        }
        return this.chunks.get(key);
    }

    getBlock(x, y, z) {
        const chunkX = Math.floor(x / CHUNK_SIZE);
        const chunkZ = Math.floor(z / CHUNK_SIZE);
        const localX = ((x % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
        const localZ = ((z % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;

        const chunk = this.getChunk(chunkX, chunkZ);
        if (!chunk) return BLOCK_TYPES.AIR;

        return chunk.getBlock(localX, y, localZ);
    }

    setBlock(x, y, z, type) {
        const chunkX = Math.floor(x / CHUNK_SIZE);
        const chunkZ = Math.floor(z / CHUNK_SIZE);
        const localX = ((x % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
        const localZ = ((z % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;

        const chunk = this.getChunk(chunkX, chunkZ);
        if (!chunk) return false;

        chunk.setBlock(localX, y, localZ, type);

        this.updateChunkMesh(chunkX, chunkZ);

        if (localX === 0) this.updateChunkMesh(chunkX - 1, chunkZ);
        if (localX === CHUNK_SIZE - 1) this.updateChunkMesh(chunkX + 1, chunkZ);
        if (localZ === 0) this.updateChunkMesh(chunkX, chunkZ - 1);
        if (localZ === CHUNK_SIZE - 1) this.updateChunkMesh(chunkX, chunkZ + 1);

        return true;
    }

    update(playerX, playerZ) {
        const playerChunkX = Math.floor(playerX / CHUNK_SIZE);
        const playerChunkZ = Math.floor(playerZ / CHUNK_SIZE);

        this.toLoad.clear();
        this.toUnload.clear();

        for (let x = playerChunkX - RENDER_DISTANCE; x <= playerChunkX + RENDER_DISTANCE; x++) {
            for (let z = playerChunkZ - RENDER_DISTANCE; z <= playerChunkZ + RENDER_DISTANCE; z++) {
                const key = this.getChunkKey(x, z);
                if (!this.loadedChunks.has(key)) {
                    this.toLoad.add(key);
                    const chunk = this.getChunk(x, z, true);
                    this.loadedChunks.add(key);
                    if (chunk.dirty) this.updateChunkMesh(x, z);
                }
            }
        }

        this.loadedChunks.forEach(key => {
            const [x, z] = key.split(',').map(Number);
            const dist = Math.abs(x - playerChunkX) + Math.abs(z - playerChunkZ);
            if (dist > RENDER_DISTANCE) {
                this.toUnload.add(key);
            }
        });

        this.toUnload.forEach(key => {
            const chunk = this.chunks.get(key);
            if (chunk && chunk.mesh) {
                this.meshScene.remove(chunk.mesh);
            }
            this.loadedChunks.delete(key);
        });
    }

    updateChunkMesh(chunkX, chunkZ) {
        const chunk = this.getChunk(chunkX, chunkZ);
        if (!chunk || !chunk.dirty) return;

        if (chunk.mesh) {
            this.meshScene.remove(chunk.mesh);
        }

        chunk.createMesh();

        if (chunk.mesh) {
            this.meshScene.add(chunk.mesh);
        }
    }

    raycast(origin, direction, maxDistance = 100) {
        let current = origin.clone();
        const step = 0.01;
        let distance = 0;

        while (distance < maxDistance) {
            const x = Math.floor(current.x);
            const y = Math.floor(current.y);
            const z = Math.floor(current.z);

            const block = this.getBlock(x, y, z);
            if (block !== BLOCK_TYPES.AIR) {
                return {
                    hit: true,
                    position: current.clone(),
                    blockPos: new THREE.Vector3(x, y, z),
                    blockType: block,
                    distance: distance
                };
            }

            current.addScaledVector(direction, step);
            distance += step;
        }

        return { hit: false };
    }

    dispose() {
        this.chunks.forEach(chunk => chunk.dispose());
        this.chunks.clear();
        this.loadedChunks.clear();
    }
}
