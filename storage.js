export class WorldStorage {
    constructor() {
        this.dbName = 'MinecraftClone';
        this.storeName = 'chunks';
        this.db = null;
        this.initDatabase();
    }

    initDatabase() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, 1);

            request.onerror = () => {
                console.error('Database open failed');
                reject(request.error);
            };

            request.onsuccess = () => {
                this.db = request.result;
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains(this.storeName)) {
                    db.createObjectStore(this.storeName, { keyPath: 'key' });
                }
            };
        });
    }

    async saveChunk(chunkKey, chunkData) {
        if (!this.db) return;

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);

            const data = {
                key: chunkKey,
                blocks: Array.from(chunkData),
                timestamp: Date.now()
            };

            const request = store.put(data);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve();
        });
    }

    async loadChunk(chunkKey) {
        if (!this.db) return null;

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readonly');
            const store = transaction.objectStore(this.storeName);
            const request = store.get(chunkKey);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                const result = request.result;
                resolve(result ? new Uint8Array(result.blocks) : null);
            };
        });
    }

    async deleteChunk(chunkKey) {
        if (!this.db) return;

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);
            const request = store.delete(chunkKey);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve();
        });
    }

    async saveWorld(worldName, worldData) {
        const metadata = {
            key: `world_${worldName}`,
            name: worldName,
            data: worldData,
            timestamp: Date.now()
        };

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);
            const request = store.put(metadata);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve();
        });
    }

    async loadWorld(worldName) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readonly');
            const store = transaction.objectStore(this.storeName);
            const request = store.get(`world_${worldName}`);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                const result = request.result;
                resolve(result ? result.data : null);
            };
        });
    }

    async getAllWorlds() {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readonly');
            const store = transaction.objectStore(this.storeName);
            const request = store.getAll();

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                const results = request.result;
                const worlds = results.filter(r => r.key.startsWith('world_'));
                resolve(worlds);
            };
        });
    }

    async clearWorld(worldName) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);

            const allRequest = store.getAll();
            allRequest.onsuccess = () => {
                const results = allRequest.result;
                const keysToDelete = results
                    .filter(r => r.key.startsWith(`chunk_${worldName}_`) || r.key === `world_${worldName}`)
                    .map(r => r.key);

                let deleteCount = 0;
                keysToDelete.forEach(key => {
                    const deleteRequest = store.delete(key);
                    deleteRequest.onsuccess = () => {
                        deleteCount++;
                        if (deleteCount === keysToDelete.length) {
                            resolve();
                        }
                    };
                });
            };
        });
    }
}
