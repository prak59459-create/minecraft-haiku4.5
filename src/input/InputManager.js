import * as THREE from 'three';

export class InputManager {
    constructor(camera, player) {
        this.camera = camera;
        this.player = player;

        this.locked = false;
        this.keys = {
            forward: false,
            backward: false,
            left: false,
            right: false
        };

        this.mouse = {
            x: 0,
            y: 0,
            deltaX: 0,
            deltaY: 0
        };

        this.euler = new THREE.Euler(0, 0, 0, 'YXZ');
        this.PI_2 = Math.PI / 2;
        this.sensitivity = 0.002;

        this.setupKeyboardListeners();
        this.setupMouseListeners();
        this.setupBlockSelectionListeners();

        this.player.keys = this.keys;
    }

    setupKeyboardListeners() {
        document.addEventListener('keydown', (e) => {
            switch (e.key.toLowerCase()) {
                case 'w': this.keys.forward = true; e.preventDefault(); break;
                case 's': this.keys.backward = true; e.preventDefault(); break;
                case 'a': this.keys.left = true; e.preventDefault(); break;
                case 'd': this.keys.right = true; e.preventDefault(); break;
                case ' ':
                    this.player.jump();
                    e.preventDefault();
                    break;
                case 'shift':
                    this.player.isSprinting = true;
                    e.preventDefault();
                    break;
            }
        });

        document.addEventListener('keyup', (e) => {
            switch (e.key.toLowerCase()) {
                case 'w': this.keys.forward = false; break;
                case 's': this.keys.backward = false; break;
                case 'a': this.keys.left = false; break;
                case 'd': this.keys.right = false; break;
                case 'shift':
                    this.player.isSprinting = false;
                    break;
            }
        });
    }

    setupMouseListeners() {
        document.addEventListener('mousemove', (e) => {
            if (!this.locked) return;

            this.mouse.deltaX = e.movementX;
            this.mouse.deltaY = e.movementY;

            this.euler.setFromQuaternion(this.camera.quaternion);
            this.euler.rotateY(-this.mouse.deltaX * this.sensitivity);
            this.euler.rotateX(-this.mouse.deltaY * this.sensitivity);
            this.euler.x = Math.max(-this.PI_2, Math.min(this.PI_2, this.euler.x));
            this.camera.quaternion.setFromEuler(this.euler);
        });

        document.addEventListener('mousedown', (e) => {
            if (!this.locked) return;

            if (e.button === 0) {
                this.player.destroy();
            } else if (e.button === 2) {
                this.player.place();
            }
        });

        document.addEventListener('contextmenu', (e) => e.preventDefault());
        document.addEventListener('wheel', (e) => {
            e.preventDefault();
            if (e.deltaY < 0) {
                this.player.selectedSlot = (this.player.selectedSlot - 1 + this.player.blocks.length) % this.player.blocks.length;
            } else {
                this.player.selectedSlot = (this.player.selectedSlot + 1) % this.player.blocks.length;
            }
            this.player.selectBlock(this.player.selectedSlot);
        });
    }

    setupBlockSelectionListeners() {
        for (let i = 0; i < 9; i++) {
            document.addEventListener('keydown', (e) => {
                const key = parseInt(e.key);
                if (key >= 1 && key <= 9) {
                    this.player.selectBlock(key - 1);
                }
            });
        }

        const selector = document.getElementById('blockSelector');
        for (let i = 0; i < 9; i++) {
            const slot = document.createElement('div');
            slot.className = 'blockSlot';
            slot.textContent = i + 1;
            slot.addEventListener('click', () => {
                this.player.selectBlock(i);
            });
            selector.appendChild(slot);
        }

        this.updateBlockSelector();
    }

    updateBlockSelector() {
        const slots = document.querySelectorAll('.blockSlot');
        slots.forEach((slot, i) => {
            slot.classList.toggle('selected', i === this.player.selectedSlot);
        });
    }
}
