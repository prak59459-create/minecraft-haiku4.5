export class SaveGameManager {
    constructor() {
        this.dbName = 'MinecraftClone';
        this.storeName = 'chunks';
        this.playerStore = 'playerData';
        this.db = null;
        this.initDB();
    }

    initDB() {
        const request = indexedDB.open(this.dbName, 1);

        request.onerror = () => {
            console.error('Failed to open IndexedDB');
        };

        request.onsuccess = (event) => {
            this.db = event.target.result;
        };

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(this.storeName)) {
                db.createObjectStore(this.storeName, { keyPath: 'key' });
            }
            if (!db.objectStoreNames.contains(this.playerStore)) {
                db.createObjectStore(this.playerStore, { keyPath: 'id' });
            }
        };
    }

    saveChunk(chunkKey, chunkData) {
        if (!this.db) return Promise.reject('DB not initialized');

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);
            const request = store.put({
                key: chunkKey,
                data: chunkData.blocks,
                timestamp: Date.now()
            });

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    loadChunk(chunkKey) {
        if (!this.db) return Promise.reject('DB not initialized');

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readonly');
            const store = transaction.objectStore(this.storeName);
            const request = store.get(chunkKey);

            request.onsuccess = () => {
                if (request.result) {
                    resolve(request.result.data);
                } else {
                    resolve(null);
                }
            };
            request.onerror = () => reject(request.error);
        });
    }

    savePlayerData(position, rotation) {
        if (!this.db) return Promise.reject('DB not initialized');

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.playerStore], 'readwrite');
            const store = transaction.objectStore(this.playerStore);
            const request = store.put({
                id: 'player',
                position,
                rotation,
                timestamp: Date.now()
            });

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    loadPlayerData() {
        if (!this.db) return Promise.reject('DB not initialized');

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.playerStore], 'readonly');
            const store = transaction.objectStore(this.playerStore);
            const request = store.get('player');

            request.onsuccess = () => {
                resolve(request.result || null);
            };
            request.onerror = () => reject(request.error);
        });
    }

    clearAllData() {
        if (!this.db) return Promise.reject('DB not initialized');

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName, this.playerStore], 'readwrite');
            const chunksStore = transaction.objectStore(this.storeName);
            const playerStore = transaction.objectStore(this.playerStore);

            chunksStore.clear();
            playerStore.clear();

            transaction.oncomplete = () => resolve();
            transaction.onerror = () => reject(transaction.error);
        });
    }
}
