export class SaveSystem {
    constructor() {
        this.storageKey = 'minecraft-world-save';
        this.maxChunksToSave = 32;
    }

    saveWorld(world, playerPos) {
        try {
            const saveData = {
                version: 1,
                timestamp: Date.now(),
                playerPos: {
                    x: playerPos.x,
                    y: playerPos.y,
                    z: playerPos.z
                },
                chunks: []
            };

            let chunkCount = 0;
            for (const [key, chunk] of world.chunks) {
                if (chunkCount >= this.maxChunksToSave) break;

                saveData.chunks.push({
                    key: key,
                    x: chunk.x,
                    z: chunk.z,
                    blocks: Array.from(chunk.blocks)
                });
                chunkCount++;
            }

            const json = JSON.stringify(saveData);
            localStorage.setItem(this.storageKey, json);
            return true;
        } catch (e) {
            console.error('Failed to save world:', e);
            return false;
        }
    }

    loadWorld(world) {
        try {
            const json = localStorage.getItem(this.storageKey);
            if (!json) return null;

            const saveData = JSON.parse(json);
            if (saveData.version !== 1) return null;

            const loadedChunks = [];
            for (const chunkData of saveData.chunks) {
                const chunk = world.getChunk(chunkData.x, chunkData.z);
                chunk.blocks = new Uint8Array(chunkData.blocks);
                chunk.generated = true;
                loadedChunks.push(chunk);
            }

            return {
                playerPos: saveData.playerPos,
                chunkCount: loadedChunks.length,
                timestamp: saveData.timestamp
            };
        } catch (e) {
            console.error('Failed to load world:', e);
            return null;
        }
    }

    clearSave() {
        try {
            localStorage.removeItem(this.storageKey);
            return true;
        } catch (e) {
            console.error('Failed to clear save:', e);
            return false;
        }
    }

    hasSave() {
        return localStorage.getItem(this.storageKey) !== null;
    }

    getSaveInfo() {
        try {
            const json = localStorage.getItem(this.storageKey);
            if (!json) return null;

            const saveData = JSON.parse(json);
            const date = new Date(saveData.timestamp);
            return {
                timestamp: saveData.timestamp,
                date: date.toLocaleString(),
                playerPos: saveData.playerPos,
                chunkCount: saveData.chunks.length
            };
        } catch (e) {
            return null;
        }
    }
}
