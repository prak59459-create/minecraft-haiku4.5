export class SaveManager {
    static SAVE_KEY = 'minecraft_saves';
    static PLAYER_KEY = 'minecraft_player';

    static getSaves() {
        const data = localStorage.getItem(SaveManager.SAVE_KEY);
        return data ? JSON.parse(data) : {};
    }

    static saveName(name, worldData) {
        const saves = SaveManager.getSaves();
        saves[name] = {
            timestamp: Date.now(),
            chunks: worldData,
            description: `Saved on ${new Date().toLocaleString()}`
        };
        localStorage.setItem(SaveManager.SAVE_KEY, JSON.stringify(saves));
    }

    static loadName(name) {
        const saves = SaveManager.getSaves();
        return saves[name]?.chunks || null;
    }

    static deleteName(name) {
        const saves = SaveManager.getSaves();
        delete saves[name];
        localStorage.setItem(SaveManager.SAVE_KEY, JSON.stringify(saves));
    }

    static listSaves() {
        return Object.keys(SaveManager.getSaves());
    }

    static savePlayerState(playerData) {
        localStorage.setItem(SaveManager.PLAYER_KEY, JSON.stringify(playerData));
    }

    static loadPlayerState() {
        const data = localStorage.getItem(SaveManager.PLAYER_KEY);
        return data ? JSON.parse(data) : null;
    }

    static exportWorldAsJson() {
        const saves = SaveManager.getSaves();
        return JSON.stringify(saves, null, 2);
    }

    static importWorldFromJson(jsonString) {
        try {
            const saves = JSON.parse(jsonString);
            localStorage.setItem(SaveManager.SAVE_KEY, JSON.stringify(saves));
            return true;
        } catch (e) {
            console.error('Failed to import save:', e);
            return false;
        }
    }

    static clearAllSaves() {
        localStorage.removeItem(SaveManager.SAVE_KEY);
        localStorage.removeItem(SaveManager.PLAYER_KEY);
    }
}
