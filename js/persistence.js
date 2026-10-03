class WorldSaver {
    constructor(worldName = 'minecraft-default') {
        this.worldName = worldName;
        this.storageKey = `world_${worldName}`;
        this.chunkCacheKey = `chunks_${worldName}`;
        this.playerDataKey = `player_${worldName}`;
    }

    savePlayerData(player) {
        const data = {
            position: {
                x: player.position.x,
                y: player.position.y,
                z: player.position.z
            },
            rotation: {
                pitch: player.pitch,
                yaw: player.yaw
            },
            currentBlock: player.currentBlock,
            timestamp: Date.now()
        };

        try {
            localStorage.setItem(this.playerDataKey, JSON.stringify(data));
            return true;
        } catch (e) {
            console.warn('Failed to save player data:', e);
            return false;
        }
    }

    loadPlayerData() {
        try {
            const data = localStorage.getItem(this.playerDataKey);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            console.warn('Failed to load player data:', e);
            return null;
        }
    }

    saveChunkData(chunkKey, blocks) {
        const data = {
            key: chunkKey,
            blocks: Array.from(blocks),
            timestamp: Date.now()
        };

        try {
            const existing = this.loadAllChunkData();
            existing[chunkKey] = data;

            if (Object.keys(existing).length > 100) {
                this.pruneOldChunks(existing, 50);
            }

            localStorage.setItem(this.chunkCacheKey, JSON.stringify(existing));
            return true;
        } catch (e) {
            console.warn('Failed to save chunk data:', e);
            return false;
        }
    }

    loadChunkData(chunkKey) {
        try {
            const data = localStorage.getItem(this.chunkCacheKey);
            if (!data) return null;

            const chunks = JSON.parse(data);
            return chunks[chunkKey] ? new Uint8Array(chunks[chunkKey].blocks) : null;
        } catch (e) {
            console.warn('Failed to load chunk data:', e);
            return null;
        }
    }

    loadAllChunkData() {
        try {
            const data = localStorage.getItem(this.chunkCacheKey);
            return data ? JSON.parse(data) : {};
        } catch (e) {
            return {};
        }
    }

    pruneOldChunks(chunks, keepCount) {
        const sorted = Object.entries(chunks)
            .sort((a, b) => b[1].timestamp - a[1].timestamp)
            .slice(0, keepCount);

        return Object.fromEntries(sorted);
    }

    clearAllData() {
        try {
            localStorage.removeItem(this.playerDataKey);
            localStorage.removeItem(this.chunkCacheKey);
            return true;
        } catch (e) {
            console.warn('Failed to clear data:', e);
            return false;
        }
    }

    getStorageInfo() {
        try {
            const playerData = localStorage.getItem(this.playerDataKey);
            const chunkData = localStorage.getItem(this.chunkCacheKey);

            let playerSize = playerData ? playerData.length : 0;
            let chunkSize = chunkData ? chunkData.length : 0;
            let totalSize = (playerSize + chunkSize) / 1024;

            return {
                playerDataSize: (playerSize / 1024).toFixed(2) + ' KB',
                chunkDataSize: (chunkSize / 1024).toFixed(2) + ' KB',
                totalSize: totalSize.toFixed(2) + ' KB',
                chunkCount: chunkData ? Object.keys(JSON.parse(chunkData)).length : 0
            };
        } catch (e) {
            return null;
        }
    }
}

class Inventory {
    constructor() {
        this.slots = new Array(36).fill(null);
        this.hotbarSize = 9;
        this.selectedSlot = 0;
        this.loadFromStorage();
    }

    addItem(blockType, count = 1) {
        for (let i = 0; i < this.slots.length; i++) {
            if (this.slots[i] === null) {
                this.slots[i] = { type: blockType, count: count };
                this.saveToStorage();
                return true;
            } else if (this.slots[i].type === blockType) {
                this.slots[i].count += count;
                this.saveToStorage();
                return true;
            }
        }
        return false;
    }

    removeItem(blockType, count = 1) {
        for (let i = 0; i < this.slots.length; i++) {
            if (this.slots[i] && this.slots[i].type === blockType) {
                this.slots[i].count -= count;
                if (this.slots[i].count <= 0) {
                    this.slots[i] = null;
                }
                this.saveToStorage();
                return true;
            }
        }
        return false;
    }

    getItemCount(blockType) {
        let total = 0;
        this.slots.forEach(slot => {
            if (slot && slot.type === blockType) {
                total += slot.count;
            }
        });
        return total;
    }

    selectSlot(index) {
        if (index >= 0 && index < this.hotbarSize) {
            this.selectedSlot = index;
        }
    }

    getSelectedItem() {
        return this.slots[this.selectedSlot];
    }

    saveToStorage() {
        try {
            localStorage.setItem(`inventory_${Date.now()}`, JSON.stringify(this.slots));
        } catch (e) {
            console.warn('Failed to save inventory:', e);
        }
    }

    loadFromStorage() {
        try {
            const data = localStorage.getItem('inventory');
            if (data) {
                const loaded = JSON.parse(data);
                this.slots = loaded.length > 0 ? loaded : this.slots;
            }
        } catch (e) {
            console.warn('Failed to load inventory:', e);
        }
    }
}
