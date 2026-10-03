export class InputManager {
    constructor(settings) {
        this.settings = settings;
        this.keys = {};
        this.setupControls();
    }

    setupControls() {
        document.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;
        });

        document.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
        });
    }

    isKeyPressed(key) {
        return this.keys[key.toLowerCase()] || false;
    }

    isMovingForward() {
        return this.isKeyPressed('w');
    }

    isMovingBackward() {
        return this.isKeyPressed('s');
    }

    isMovingLeft() {
        return this.isKeyPressed('a');
    }

    isMovingRight() {
        return this.isKeyPressed('d');
    }

    isJumping() {
        return this.isKeyPressed(' ');
    }

    isSprinting() {
        return this.isKeyPressed('shift');
    }

    isCrouching() {
        return this.isKeyPressed('control') || this.isKeyPressed('c');
    }

    getMouseSensitivity() {
        return this.settings.mouseSensitivity * 0.005;
    }
}
