export class WorldSave {
    static STORAGE_KEY = 'minecraft_world';
    static VERSION = 1;

    static saveWorld(world) {
        try {
            const data = {
                version: this.VERSION,
                timestamp: Date.now(),
                chunks: []
            };

            for (const [key, chunk] of world.chunks) {
                if (chunk.generated) {
                    data.chunks.push({
                        key: key,
                        blocks: Array.from(chunk.blocks)
                    });
                }
            }

            const compressed = this.compressData(data);
            localStorage.setItem(this.STORAGE_KEY, compressed);
            return true;
        } catch (error) {
            console.error('Failed to save world:', error);
            return false;
        }
    }

    static loadWorld(world) {
        try {
            const compressed = localStorage.getItem(this.STORAGE_KEY);
            if (!compressed) return false;

            const data = this.decompressData(compressed);
            if (data.version !== this.VERSION) {
                console.warn('World version mismatch, starting fresh');
                return false;
            }

            for (const chunkData of data.chunks) {
                const [cx, cz] = chunkData.key.split(',').map(Number);
                const chunk = world.getChunk(cx, cz);
                chunk.blocks = new Uint8Array(chunkData.blocks);
                chunk.generated = true;
            }

            return true;
        } catch (error) {
            console.error('Failed to load world:', error);
            return false;
        }
    }

    static clearWorld() {
        try {
            localStorage.removeItem(this.STORAGE_KEY);
            return true;
        } catch (error) {
            console.error('Failed to clear world:', error);
            return false;
        }
    }

    static compressData(data) {
        const json = JSON.stringify(data);
        return btoa(json);
    }

    static decompressData(compressed) {
        const json = atob(compressed);
        return JSON.parse(json);
    }

    static getWorldInfo() {
        try {
            const compressed = localStorage.getItem(this.STORAGE_KEY);
            if (!compressed) return null;

            const data = this.decompressData(compressed);
            return {
                version: data.version,
                timestamp: new Date(data.timestamp),
                chunkCount: data.chunks.length
            };
        } catch (error) {
            return null;
        }
    }
}
