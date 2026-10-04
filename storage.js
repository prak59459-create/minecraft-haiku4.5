export class WorldStorage {
    constructor() {
        this.storageKey = 'minecraft_world_chunks';
        this.metadataKey = 'minecraft_world_metadata';
        this.maxStorageSize = 5 * 1024 * 1024; // 5MB limit
    }

    saveWorld(chunks) {
        try {
            const chunkArray = [];
            let totalSize = 0;

            for (const [key, chunkData] of Object.entries(chunks)) {
                const compressed = this.compressChunk(chunkData);
                chunkArray.push({ key, data: compressed });
                totalSize += compressed.length;

                if (totalSize > this.maxStorageSize) {
                    console.warn('Storage limit reached, saving partial world');
                    break;
                }
            }

            const saveData = {
                timestamp: Date.now(),
                version: '1.0',
                chunks: chunkArray,
                playerPos: null
            };

            localStorage.setItem(this.storageKey, JSON.stringify(saveData));
            localStorage.setItem(this.metadataKey, JSON.stringify({
                timestamp: Date.now(),
                chunkCount: chunkArray.length
            }));

            return true;
        } catch (e) {
            console.error('Failed to save world:', e);
            return false;
        }
    }

    loadWorld() {
        try {
            const data = localStorage.getItem(this.storageKey);
            if (!data) return null;

            const saveData = JSON.parse(data);
            const chunks = {};

            for (const { key, data: compressed } of saveData.chunks) {
                chunks[key] = this.decompressChunk(compressed);
            }

            return chunks;
        } catch (e) {
            console.error('Failed to load world:', e);
            return null;
        }
    }

    deleteWorld() {
        try {
            localStorage.removeItem(this.storageKey);
            localStorage.removeItem(this.metadataKey);
            return true;
        } catch (e) {
            console.error('Failed to delete world:', e);
            return false;
        }
    }

    compressChunk(chunkData) {
        if (!chunkData || !chunkData.blocks) return '';

        const blocks = chunkData.blocks;
        let compressed = '';

        for (let i = 0; i < blocks.length; i++) {
            compressed += String.fromCharCode(blocks[i]);
        }

        return btoa(compressed);
    }

    decompressChunk(compressed) {
        if (!compressed) return null;

        const decoded = atob(compressed);
        const blocks = new Uint8Array(decoded.length);

        for (let i = 0; i < decoded.length; i++) {
            blocks[i] = decoded.charCodeAt(i);
        }

        return { blocks, generated: true };
    }

    getStorageInfo() {
        try {
            const data = localStorage.getItem(this.storageKey);
            const metadata = localStorage.getItem(this.metadataKey);

            if (!metadata) return null;

            const meta = JSON.parse(metadata);
            const size = data ? data.length : 0;

            return {
                timestamp: meta.timestamp,
                chunkCount: meta.chunkCount,
                storageSize: size,
                maxSize: this.maxStorageSize
            };
        } catch (e) {
            return null;
        }
    }

    exportWorld() {
        try {
            const data = localStorage.getItem(this.storageKey);
            if (!data) return null;

            const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(data);
            const link = document.createElement('a');
            link.setAttribute('href', dataStr);
            link.setAttribute('download', `minecraft_world_${Date.now()}.json`);
            link.click();

            return true;
        } catch (e) {
            console.error('Failed to export world:', e);
            return false;
        }
    }

    importWorld(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    localStorage.setItem(this.storageKey, JSON.stringify(data));
                    resolve(true);
                } catch (err) {
                    reject(err);
                }
            };
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsText(file);
        });
    }
}
