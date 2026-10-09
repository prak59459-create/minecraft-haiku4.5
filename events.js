export class EventSystem {
    constructor() {
        this.listeners = new Map();
        this.eventHistory = [];
        this.maxHistorySize = 1000;
    }

    on(eventType, callback) {
        if (!this.listeners.has(eventType)) {
            this.listeners.set(eventType, []);
        }
        this.listeners.get(eventType).push(callback);

        return () => this.off(eventType, callback);
    }

    off(eventType, callback) {
        if (!this.listeners.has(eventType)) return;

        const callbacks = this.listeners.get(eventType);
        const index = callbacks.indexOf(callback);
        if (index > -1) {
            callbacks.splice(index, 1);
        }
    }

    emit(eventType, data = {}) {
        const event = {
            type: eventType,
            data,
            timestamp: Date.now()
        };

        this.eventHistory.push(event);
        if (this.eventHistory.length > this.maxHistorySize) {
            this.eventHistory.shift();
        }

        if (this.listeners.has(eventType)) {
            for (const callback of this.listeners.get(eventType)) {
                try {
                    callback(event);
                } catch (error) {
                    console.error(`Error in event listener for ${eventType}:`, error);
                }
            }
        }
    }

    getHistory(eventType = null) {
        if (!eventType) {
            return [...this.eventHistory];
        }
        return this.eventHistory.filter(event => event.type === eventType);
    }

    clearHistory() {
        this.eventHistory = [];
    }
}

export const GameEvents = {
    BLOCK_BROKEN: 'block:broken',
    BLOCK_PLACED: 'block:placed',
    PLAYER_MOVED: 'player:moved',
    PLAYER_JUMPED: 'player:jumped',
    CHUNK_LOADED: 'chunk:loaded',
    CHUNK_UNLOADED: 'chunk:unloaded',
    PLAYER_DIED: 'player:died',
    PLAYER_SPAWNED: 'player:spawned',
    INVENTORY_CHANGED: 'inventory:changed',
    GAME_STARTED: 'game:started',
    GAME_PAUSED: 'game:paused',
    GAME_RESUMED: 'game:resumed'
};
