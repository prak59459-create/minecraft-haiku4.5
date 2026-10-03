export class SaveManager {
    constructor() {
        this.saveSlots = 3;
        this.storageKey = 'minecraft-saves';
    }

    saveWorld(playerPos, selectedBlock, chunkData) {
        const save = {
            timestamp: Date.now(),
            player: {
                x: playerPos.x,
                y: playerPos.y,
                z: playerPos.z
            },
            selectedBlock: selectedBlock,
            version: '1.0'
        };

        const saves = this.getSaves();
        saves[0] = save;
        localStorage.setItem(this.storageKey, JSON.stringify(saves));

        return save;
    }

    loadWorld(slotIndex = 0) {
        const saves = this.getSaves();
        if (slotIndex < saves.length && saves[slotIndex]) {
            return saves[slotIndex];
        }
        return null;
    }

    getSaves() {
        try {
            const data = localStorage.getItem(this.storageKey);
            return data ? JSON.parse(data) : Array(this.saveSlots).fill(null);
        } catch (e) {
            return Array(this.saveSlots).fill(null);
        }
    }

    deleteSave(slotIndex) {
        const saves = this.getSaves();
        if (slotIndex < saves.length) {
            saves[slotIndex] = null;
            localStorage.setItem(this.storageKey, JSON.stringify(saves));
        }
    }

    export() {
        const saves = this.getSaves();
        const dataStr = JSON.stringify(saves, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `minecraft-saves-${Date.now()}.json`;
        link.click();
        URL.revokeObjectURL(url);
    }
}
