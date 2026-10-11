export class WorldSave {
    constructor(worldName = 'minecraft-world') {
        this.worldName = worldName;
        this.storageKey = `world_${worldName}`;
        this.metaStorageKey = `world_meta_${worldName}`;
    }

    saveChunk(chunk) {
        const chunkData = {
            x: chunk.x,
            z: chunk.z,
            blocks: Array.from(chunk.blocks),
            generated: chunk.generated
        };

        const chunkKey = `${this.storageKey}_chunk_${chunk.x}_${chunk.z}`;
        try {
            localStorage.setItem(chunkKey, JSON.stringify(chunkData));
            return true;
        } catch (e) {
            console.warn(`Failed to save chunk ${chunk.x},${chunk.z}:`, e);
            return false;
        }
    }

    loadChunk(cx, cz) {
        const chunkKey = `${this.storageKey}_chunk_${cx}_${cz}`;
        try {
            const data = localStorage.getItem(chunkKey);
            if (!data) return null;

            const parsed = JSON.parse(data);
            return {
                x: parsed.x,
                z: parsed.z,
                blocks: new Uint8Array(parsed.blocks),
                generated: parsed.generated
            };
        } catch (e) {
            console.warn(`Failed to load chunk ${cx},${cz}:`, e);
            return null;
        }
    }

    saveWorld(world, playerPos) {
        const meta = {
            timestamp: Date.now(),
            playerPosition: playerPos,
            version: 1
        };

        try {
            localStorage.setItem(this.metaStorageKey, JSON.stringify(meta));

            for (const [, chunk] of world.chunks) {
                this.saveChunk(chunk);
            }

            return true;
        } catch (e) {
            console.error('Failed to save world:', e);
            return false;
        }
    }

    loadWorld() {
        try {
            const metaData = localStorage.getItem(this.metaStorageKey);
            if (!metaData) return null;

            const meta = JSON.parse(metaData);
            return meta;
        } catch (e) {
            console.error('Failed to load world metadata:', e);
            return null;
        }
    }

    deleteWorld() {
        try {
            const prefix = `${this.storageKey}_chunk_`;
            const keysToDelete = [];

            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith(prefix)) {
                    keysToDelete.push(key);
                }
            }

            keysToDelete.forEach(key => localStorage.removeItem(key));
            localStorage.removeItem(this.metaStorageKey);

            return true;
        } catch (e) {
            console.error('Failed to delete world:', e);
            return false;
        }
    }

    listWorlds() {
        const worlds = new Set();

        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('world_meta_')) {
                const worldName = key.replace('world_meta_', '');
                worlds.add(worldName);
            }
        }

        return Array.from(worlds);
    }

    getWorldSize() {
        let size = 0;
        const prefix = `${this.storageKey}_chunk_`;

        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(prefix)) {
                const data = localStorage.getItem(key);
                size += data ? data.length : 0;
            }
        }

        return size;
    }
}
