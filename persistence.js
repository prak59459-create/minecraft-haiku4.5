export class WorldPersistence {
    constructor(worldName = 'minecraft-world') {
        this.worldName = worldName;
        this.storageKey = `world_${worldName}`;
        this.chunkStorageKey = `chunks_${worldName}`;
        this.playerStorageKey = `player_${worldName}`;
    }

    savePlayerState(position, rotation) {
        const playerData = {
            position: { ...position },
            rotation: { ...rotation },
            timestamp: Date.now()
        };
        try {
            localStorage.setItem(this.playerStorageKey, JSON.stringify(playerData));
            return true;
        } catch (e) {
            console.warn('Failed to save player state:', e);
            return false;
        }
    }

    loadPlayerState() {
        try {
            const data = localStorage.getItem(this.playerStorageKey);
            if (data) {
                return JSON.parse(data);
            }
        } catch (e) {
            console.warn('Failed to load player state:', e);
        }
        return null;
    }

    saveChunkData(chunkKey, blockData) {
        const chunkData = {
            key: chunkKey,
            blocks: Array.from(blockData),
            timestamp: Date.now()
        };
        try {
            const chunks = this.loadAllChunks() || {};
            chunks[chunkKey] = chunkData;
            localStorage.setItem(this.chunkStorageKey, JSON.stringify(chunks));
            return true;
        } catch (e) {
            console.warn('Failed to save chunk data:', e);
            return false;
        }
    }

    loadChunkData(chunkKey) {
        try {
            const chunks = localStorage.getItem(this.chunkStorageKey);
            if (chunks) {
                const chunkData = JSON.parse(chunks);
                if (chunkData[chunkKey]) {
                    return new Uint8Array(chunkData[chunkKey].blocks);
                }
            }
        } catch (e) {
            console.warn('Failed to load chunk data:', e);
        }
        return null;
    }

    loadAllChunks() {
        try {
            const data = localStorage.getItem(this.chunkStorageKey);
            if (data) {
                return JSON.parse(data);
            }
        } catch (e) {
            console.warn('Failed to load all chunks:', e);
        }
        return null;
    }

    clearWorld() {
        try {
            localStorage.removeItem(this.playerStorageKey);
            localStorage.removeItem(this.chunkStorageKey);
            localStorage.removeItem(this.storageKey);
            return true;
        } catch (e) {
            console.warn('Failed to clear world:', e);
            return false;
        }
    }

    getWorldStats() {
        try {
            const chunks = localStorage.getItem(this.chunkStorageKey);
            const playerData = localStorage.getItem(this.playerStorageKey);

            let chunkCount = 0;
            if (chunks) {
                chunkCount = Object.keys(JSON.parse(chunks)).length;
            }

            return {
                worldName: this.worldName,
                chunkCount,
                hasPlayerData: !!playerData,
                storageSize: this.estimateStorageSize()
            };
        } catch (e) {
            console.warn('Failed to get world stats:', e);
            return null;
        }
    }

    estimateStorageSize() {
        let size = 0;
        try {
            const chunks = localStorage.getItem(this.chunkStorageKey);
            const playerData = localStorage.getItem(this.playerStorageKey);

            if (chunks) size += chunks.length;
            if (playerData) size += playerData.length;

            return Math.round(size / 1024);
        } catch (e) {
            return 0;
        }
    }
}
