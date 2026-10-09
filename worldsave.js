export class WorldSave {
    static async saveWorld(world, name = 'minecraft-world') {
        const saveData = {
            name: name,
            timestamp: Date.now(),
            version: '1.0',
            chunks: []
        };

        for (const [key, chunk] of world.chunks) {
            const [cx, cz] = key.split(',').map(Number);
            const chunkData = {
                x: cx,
                z: cz,
                blocks: Array.from(chunk.blocks)
            };
            saveData.chunks.push(chunkData);
        }

        try {
            const json = JSON.stringify(saveData);
            const blob = new Blob([json], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${name}-${Date.now()}.json`;
            a.click();
            URL.revokeObjectURL(url);
            return true;
        } catch (error) {
            console.error('Error saving world:', error);
            return false;
        }
    }

    static loadWorldFromFile(file, world) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const saveData = JSON.parse(e.target.result);

                    for (const chunkData of saveData.chunks) {
                        const key = `${chunkData.x},${chunkData.z}`;
                        const chunk = world.getChunk(chunkData.x, chunkData.z);
                        chunk.blocks = new Uint8Array(chunkData.blocks);
                        chunk.generated = true;
                    }

                    resolve(true);
                } catch (error) {
                    console.error('Error loading world:', error);
                    reject(error);
                }
            };
            reader.onerror = () => reject(new Error('File read error'));
            reader.readAsText(file);
        });
    }

    static async loadWorldFromIndexedDB(name) {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('MinecraftClone', 1);

            request.onsuccess = (e) => {
                const db = e.target.result;
                const transaction = db.transaction(['worlds'], 'readonly');
                const store = transaction.objectStore('worlds');
                const getRequest = store.get(name);

                getRequest.onsuccess = () => {
                    resolve(getRequest.result);
                };
                getRequest.onerror = () => {
                    reject(new Error('Failed to load world from IndexedDB'));
                };
            };

            request.onerror = () => {
                reject(new Error('Failed to open IndexedDB'));
            };
        });
    }

    static async saveWorldToIndexedDB(world, name = 'minecraft-world') {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('MinecraftClone', 1);

            request.onupgradeneeded = (e) => {
                const db = e.target.result;
                if (!db.objectStoreNames.contains('worlds')) {
                    db.createObjectStore('worlds', { keyPath: 'name' });
                }
            };

            request.onsuccess = (e) => {
                const db = e.target.result;
                const saveData = {
                    name: name,
                    timestamp: Date.now(),
                    version: '1.0',
                    chunks: []
                };

                for (const [key, chunk] of world.chunks) {
                    const [cx, cz] = key.split(',').map(Number);
                    const chunkData = {
                        x: cx,
                        z: cz,
                        blocks: Array.from(chunk.blocks)
                    };
                    saveData.chunks.push(chunkData);
                }

                const transaction = db.transaction(['worlds'], 'readwrite');
                const store = transaction.objectStore('worlds');
                const putRequest = store.put(saveData);

                putRequest.onsuccess = () => {
                    resolve(true);
                };
                putRequest.onerror = () => {
                    reject(new Error('Failed to save world to IndexedDB'));
                };
            };

            request.onerror = () => {
                reject(new Error('Failed to open IndexedDB'));
            };
        });
    }

    static getWorldStats(world) {
        let totalBlocks = 0;
        let blockTypes = {};

        for (const [key, chunk] of world.chunks) {
            for (let i = 0; i < chunk.blocks.length; i++) {
                const blockId = chunk.blocks[i];
                if (blockId !== 0) {
                    totalBlocks++;
                    blockTypes[blockId] = (blockTypes[blockId] || 0) + 1;
                }
            }
        }

        return {
            chunkCount: world.chunks.size,
            totalBlocks: totalBlocks,
            blockTypes: blockTypes
        };
    }
}
