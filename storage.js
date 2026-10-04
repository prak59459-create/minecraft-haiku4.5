export class WorldStorage {
    static SAVE_KEY = 'minecraft_world_save';
    static WORLD_NAME_KEY = 'minecraft_world_name';

    static canSave() {
        try {
            const test = '__storage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            return false;
        }
    }

    static saveChunk(chunkX, chunkZ, blockData) {
        if (!this.canSave()) return false;

        try {
            const key = `chunk_${chunkX}_${chunkZ}`;
            const data = {
                x: chunkX,
                z: chunkZ,
                blocks: Array.from(blockData),
                timestamp: Date.now()
            };
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (e) {
            console.warn('Failed to save chunk:', e);
            return false;
        }
    }

    static loadChunk(chunkX, chunkZ) {
        try {
            const key = `chunk_${chunkX}_${chunkZ}`;
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

    static savePlayerPosition(x, y, z) {
        try {
            const data = { x, y, z, timestamp: Date.now() };
            localStorage.setItem('player_position', JSON.stringify(data));
            return true;
        } catch (e) {
            console.warn('Failed to save player position:', e);
            return false;
        }
    }

    static loadPlayerPosition() {
        try {
            const data = localStorage.getItem('player_position');
            if (data) {
                return JSON.parse(data);
            }
            return null;
        } catch (e) {
            console.warn('Failed to load player position:', e);
            return null;
        }
    }

    static getStorageUsage() {
        try {
            let totalSize = 0;
            for (let key in localStorage) {
                if (localStorage.hasOwnProperty(key)) {
                    totalSize += localStorage[key].length + key.length;
                }
            }
            return (totalSize / 1024).toFixed(2);
        } catch (e) {
            return 'unknown';
        }
    }

    static clearAllSaves() {
        try {
            const keysToRemove = [];
            for (let key in localStorage) {
                if (key.startsWith('chunk_') || key.startsWith('player_')) {
                    keysToRemove.push(key);
                }
            }
            keysToRemove.forEach(key => localStorage.removeItem(key));
            return true;
        } catch (e) {
            console.warn('Failed to clear saves:', e);
            return false;
        }
    }
}
