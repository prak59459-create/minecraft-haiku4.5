export class WorldStorage {
    static SAVE_KEY = 'minecraft-world-data';
    static CHUNK_PREFIX = 'chunk-';
    static METADATA_KEY = 'world-metadata';

    static saveChunk(cx, cz, blocks) {
        try {
            const chunkKey = `${WorldStorage.CHUNK_PREFIX}${cx},${cz}`;
            const data = {
                blocks: Array.from(blocks),
                timestamp: Date.now()
            };
            localStorage.setItem(chunkKey, JSON.stringify(data));
        } catch (error) {
            console.warn('Failed to save chunk:', error);
        }
    }

    static loadChunk(cx, cz) {
        try {
            const chunkKey = `${WorldStorage.CHUNK_PREFIX}${cx},${cz}`;
            const data = localStorage.getItem(chunkKey);
            if (data) {
                const parsed = JSON.parse(data);
                return new Uint8Array(parsed.blocks);
            }
        } catch (error) {
            console.warn('Failed to load chunk:', error);
        }
        return null;
    }

    static hasChunk(cx, cz) {
        const chunkKey = `${WorldStorage.CHUNK_PREFIX}${cx},${cz}`;
        return localStorage.getItem(chunkKey) !== null;
    }

    static deleteChunk(cx, cz) {
        try {
            const chunkKey = `${WorldStorage.CHUNK_PREFIX}${cx},${cz}`;
            localStorage.removeItem(chunkKey);
        } catch (error) {
            console.warn('Failed to delete chunk:', error);
        }
    }

    static getAllChunks() {
        const chunks = [];
        try {
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith(WorldStorage.CHUNK_PREFIX)) {
                    const coords = key.substring(WorldStorage.CHUNK_PREFIX.length).split(',');
                    chunks.push({
                        cx: parseInt(coords[0]),
                        cz: parseInt(coords[1])
                    });
                }
            }
        } catch (error) {
            console.warn('Failed to get all chunks:', error);
        }
        return chunks;
    }

    static saveMetadata(metadata) {
        try {
            localStorage.setItem(WorldStorage.METADATA_KEY, JSON.stringify({
                ...metadata,
                lastSaved: Date.now()
            }));
        } catch (error) {
            console.warn('Failed to save metadata:', error);
        }
    }

    static loadMetadata() {
        try {
            const data = localStorage.getItem(WorldStorage.METADATA_KEY);
            if (data) {
                return JSON.parse(data);
            }
        } catch (error) {
            console.warn('Failed to load metadata:', error);
        }
        return null;
    }

    static clearWorld() {
        try {
            const chunks = WorldStorage.getAllChunks();
            for (const chunk of chunks) {
                WorldStorage.deleteChunk(chunk.cx, chunk.cz);
            }
            localStorage.removeItem(WorldStorage.METADATA_KEY);
        } catch (error) {
            console.warn('Failed to clear world:', error);
        }
    }

    static getWorldSize() {
        let size = 0;
        try {
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && (key.startsWith(WorldStorage.CHUNK_PREFIX) || key === WorldStorage.METADATA_KEY)) {
                    const value = localStorage.getItem(key);
                    size += key.length + (value ? value.length : 0);
                }
            }
        } catch (error) {
            console.warn('Failed to calculate world size:', error);
        }
        return Math.round(size / 1024);
    }
}
