export class InputBinder {
    constructor() {
        this.bindings = new Map();
        this.defaultBindings = {
            'move_forward': 'KeyW',
            'move_backward': 'KeyS',
            'move_left': 'KeyA',
            'move_right': 'KeyD',
            'jump': 'Space',
            'sprint': 'ShiftLeft',
            'place_block': 'Mouse2',
            'break_block': 'Mouse0',
            'hotbar_1': 'Digit1',
            'hotbar_2': 'Digit2',
            'hotbar_3': 'Digit3',
            'hotbar_4': 'Digit4',
            'hotbar_5': 'Digit5',
            'hotbar_6': 'Digit6',
            'hotbar_7': 'Digit7',
            'hotbar_8': 'Digit8',
            'hotbar_9': 'Digit9'
        };

        this.loadBindings();
    }

    bind(action, key) {
        this.bindings.set(action, key);
        this.saveBindings();
    }

    getBinding(action) {
        return this.bindings.get(action) || this.defaultBindings[action];
    }

    getAllBindings() {
        return new Map(this.bindings);
    }

    resetBindings() {
        this.bindings.clear();
        this.saveBindings();
    }

    saveBindings() {
        const data = Object.fromEntries(this.bindings);
        localStorage.setItem('minecraft-keybindings', JSON.stringify(data));
    }

    loadBindings() {
        try {
            const data = localStorage.getItem('minecraft-keybindings');
            if (data) {
                const bindings = JSON.parse(data);
                Object.entries(bindings).forEach(([action, key]) => {
                    this.bindings.set(action, key);
                });
            }
        } catch (e) {
            console.error('Failed to load keybindings:', e);
        }
    }

    isPressed(action, event) {
        const key = this.getBinding(action);
        return event.code === key || (event.key === ' ' && action === 'jump' && event.code === 'Space');
    }
}
