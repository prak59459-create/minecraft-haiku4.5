export class CreativeMode {
    constructor(player) {
        this.player = player;
        this.enabled = false;
        this.originalGravity = player.gravity;
        this.setupKeyBindings();
    }

    setupKeyBindings() {
        document.addEventListener('keydown', (e) => {
            if ((e.key === 'g' || e.key === 'G') && e.ctrlKey) {
                e.preventDefault();
                this.toggle();
            }
        });
    }

    toggle() {
        this.enabled = !this.enabled;

        if (this.enabled) {
            this.enable();
        } else {
            this.disable();
        }
    }

    enable() {
        this.originalGravity = this.player.gravity;
        this.player.gravity = 0;
        this.player.isOnGround = true;
        this.player.velocity.y = 0;

        console.log('Creative Mode enabled');
    }

    disable() {
        this.player.gravity = this.originalGravity;
        console.log('Creative Mode disabled');
    }

    update() {
        if (this.enabled) {
            const keys = this.player.keys;
            const speed = 0.2;

            if (keys[' ']) {
                this.player.velocity.y = speed;
            } else if (keys['shift']) {
                this.player.velocity.y = -speed;
            } else {
                this.player.velocity.y = 0;
            }
        }
    }
}
