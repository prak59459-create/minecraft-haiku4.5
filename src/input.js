export class Input {
    constructor(element) {
        this.element = element;
        this.keys = new Set();
        this.buttons = new Set();
        this.mouseDX = 0;
        this.mouseDY = 0;
        this.wheel = 0;
        this.pressed = [];
        this.locked = false;
        this.onLockChange = () => {};
        this.onLockError = () => {};

        // Listen on the document: the start overlay sits on top of the canvas and would swallow canvas clicks.
        document.addEventListener('click', () => {
            if (this.locked) return;
            try {
                const result = element.requestPointerLock();
                if (result && typeof result.catch === 'function') result.catch((err) => this.onLockError(err));
            } catch (err) {
                this.onLockError(err);
            }
        });
        document.addEventListener('pointerlockerror', () => this.onLockError(null));
        document.addEventListener('pointerlockchange', () => {
            this.locked = document.pointerLockElement === element;
            if (!this.locked) {
                this.keys.clear();
                this.buttons.clear();
            }
            this.onLockChange(this.locked);
        });

        document.addEventListener('keydown', (e) => {
            if (!this.locked) return;
            if (e.code === 'Space') e.preventDefault();
            if (!e.repeat) this.pressed.push(e.code);
            this.keys.add(e.code);
        });
        document.addEventListener('keyup', (e) => this.keys.delete(e.code));
        window.addEventListener('blur', () => this.keys.clear());

        document.addEventListener('mousemove', (e) => {
            if (!this.locked) return;
            this.mouseDX += e.movementX;
            this.mouseDY += e.movementY;
        });
        // Only act on clicks made while already locked, so the click that captures the mouse doesn't break a block.
        document.addEventListener('mousedown', (e) => {
            if (this.locked) this.buttons.add(e.button);
        });
        document.addEventListener('mouseup', (e) => this.buttons.delete(e.button));
        document.addEventListener('contextmenu', (e) => e.preventDefault());
        document.addEventListener('wheel', (e) => {
            if (this.locked) this.wheel += Math.sign(e.deltaY);
        }, { passive: true });
    }

    isDown(code) {
        return this.keys.has(code);
    }

    consumeFrame() {
        const frame = {
            dx: this.mouseDX,
            dy: this.mouseDY,
            wheel: this.wheel,
            pressed: this.pressed
        };
        this.mouseDX = 0;
        this.mouseDY = 0;
        this.wheel = 0;
        this.pressed = [];
        return frame;
    }
}
