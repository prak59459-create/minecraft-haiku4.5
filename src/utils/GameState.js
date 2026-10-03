export class GameState {
    constructor() {
        this.states = {
            LOADING: 'loading',
            PLAYING: 'playing',
            PAUSED: 'paused',
            MENU: 'menu',
            SETTINGS: 'settings'
        };

        this.current = this.states.LOADING;
        this.previous = null;
        this.listeners = new Map();
    }

    setState(newState) {
        if (!Object.values(this.states).includes(newState)) {
            console.warn(`Invalid state: ${newState}`);
            return false;
        }

        this.previous = this.current;
        this.current = newState;
        this.emit('stateChanged', { previous: this.previous, current: this.current });
        return true;
    }

    getState() {
        return this.current;
    }

    isState(state) {
        return this.current === state;
    }

    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
    }

    off(event, callback) {
        if (this.listeners.has(event)) {
            const callbacks = this.listeners.get(event);
            const index = callbacks.indexOf(callback);
            if (index > -1) {
                callbacks.splice(index, 1);
            }
        }
    }

    emit(event, data = null) {
        if (this.listeners.has(event)) {
            this.listeners.get(event).forEach(callback => callback(data));
        }
    }
}
