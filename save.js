export class SaveManager {
    constructor(storageKey = 'minecraft-save') {
        this.storageKey = storageKey;
        this.loadData();
    }

    loadData() {
        try {
            const data = localStorage.getItem(this.storageKey);
            this.data = data ? JSON.parse(data) : this.getDefaultData();
        } catch (e) {
            console.warn('Failed to load save data:', e);
            this.data = this.getDefaultData();
        }
    }

    getDefaultData() {
        const randomSpawn = Math.random() < 0.5;
        return {
            playerPosition: randomSpawn ?
                { x: Math.random() * 200 - 100, y: 100, z: Math.random() * 200 - 100 } :
                { x: 0, y: 100, z: 0 },
            selectedBlock: 1,
            worldSeed: Math.random()
        };
    }

    save(gameState) {
        try {
            this.data.playerPosition = {
                x: gameState.player.position.x,
                y: gameState.player.position.y,
                z: gameState.player.position.z
            };
            this.data.selectedBlock = gameState.selectedBlockType;
            localStorage.setItem(this.storageKey, JSON.stringify(this.data));
        } catch (e) {
            console.warn('Failed to save game state:', e);
        }
    }

    loadPlayerPosition(player) {
        if (this.data.playerPosition) {
            player.position = { ...this.data.playerPosition };
        }
    }

    getSelectedBlock() {
        return this.data.selectedBlock || 1;
    }

    clear() {
        localStorage.removeItem(this.storageKey);
        this.data = this.getDefaultData();
    }
}
