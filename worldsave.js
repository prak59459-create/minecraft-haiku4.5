export class WorldSave {
    static SAVE_KEY = 'minecraft_world_save';
    static MAX_SAVE_SIZE = 5 * 1024 * 1024;

    static canSave() {
        try {
            const test = '__test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            return false;
        }
    }

    static getSaveSize() {
        let totalSize = 0;
        for (const key in localStorage) {
            if (key.startsWith('minecraft_chunk_')) {
                totalSize += localStorage[key].length;
            }
        }
        return totalSize;
    }

    static saveChunk(cx, cz, chunkData) {
        try {
            const key = `minecraft_chunk_${cx},${cz}`;
            const totalSize = this.getSaveSize();

            if (totalSize > this.MAX_SAVE_SIZE) {
                this.clearOldestChunk();
            }

            const data = {
                x: cx,
                z: cz,
                timestamp: Date.now(),
                blocks: Array.from(chunkData)
            };
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (e) {
            console.warn('Failed to save chunk:', e);
            return false;
        }
    }

    static loadChunk(cx, cz) {
        try {
            const key = `minecraft_chunk_${cx},${cz}`;
            const data = localStorage.getItem(key);
            if (data) {
                const parsed = JSON.parse(data);
                return new Uint8Array(parsed.blocks);
            }
            return null;
        } catch (e) {
            console.warn('Failed to load chunk:', e);
            return null;
        }
    }

    static deleteChunk(cx, cz) {
        try {
            const key = `minecraft_chunk_${cx},${cz}`;
            localStorage.removeItem(key);
            return true;
        } catch (e) {
            console.warn('Failed to delete chunk:', e);
            return false;
        }
    }

    static clearOldestChunk() {
        let oldestKey = null;
        let oldestTime = Infinity;

        for (const key in localStorage) {
            if (key.startsWith('minecraft_chunk_')) {
                try {
                    const data = JSON.parse(localStorage[key]);
                    if (data.timestamp < oldestTime) {
                        oldestTime = data.timestamp;
                        oldestKey = key;
                    }
                } catch (e) {}
            }
        }

        if (oldestKey) {
            localStorage.removeItem(oldestKey);
        }
    }

    static savePlayerPosition(x, y, z) {
        try {
            localStorage.setItem('minecraft_player_pos', JSON.stringify({ x, y, z }));
        } catch (e) {
            console.warn('Failed to save player position:', e);
        }
    }

    static loadPlayerPosition() {
        try {
            const data = localStorage.getItem('minecraft_player_pos');
            if (data) return JSON.parse(data);
        } catch (e) {
            console.warn('Failed to load player position:', e);
        }
        return null;
    }

    static getAllSavedChunks() {
        const chunks = [];
        for (const key in localStorage) {
            if (key.startsWith('minecraft_chunk_')) {
                try {
                    const data = JSON.parse(localStorage[key]);
                    chunks.push({ x: data.x, z: data.z });
                } catch (e) {}
            }
        }
        return chunks;
    }

    static clearAllSaves() {
        const keysToDelete = [];
        for (const key in localStorage) {
            if (key.startsWith('minecraft_')) {
                keysToDelete.push(key);
            }
        }
        keysToDelete.forEach(key => localStorage.removeItem(key));
        console.log(`Cleared ${keysToDelete.length} saved chunks`);
    }
}
