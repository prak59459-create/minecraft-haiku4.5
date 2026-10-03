export class UI {
    constructor(player, world, camera) {
        this.player = player;
        this.world = world;
        this.camera = camera;

        this.frameCount = 0;
        this.fps = 0;
        this.lastTime = Date.now();

        this.initHotbar();
    }

    initHotbar() {
        const container = document.getElementById('block-selector');
        container.innerHTML = '';

        for (let i = 0; i < this.player.blockTypes.length; i++) {
            const blockType = this.player.blockTypes[i];
            const blockName = this.world.blockTypes[blockType].name;
            const slot = document.createElement('div');
            slot.className = 'hotbar-slot';
            if (i === 0) slot.classList.add('active');
            slot.textContent = (i + 1).toString();
            slot.title = blockName;

            slot.addEventListener('click', () => {
                document.querySelectorAll('.hotbar-slot').forEach(s => s.classList.remove('active'));
                slot.classList.add('active');
                this.player.selectedBlock = blockType;
            });

            container.appendChild(slot);
        }
    }

    updateHotbar() {
        const slots = document.querySelectorAll('.hotbar-slot');
        slots.forEach((slot, i) => {
            if (this.player.blockTypes[i] === this.player.selectedBlock) {
                slot.classList.add('active');
            } else {
                slot.classList.remove('active');
            }
        });
    }

    updateCoordinates() {
        const coords = document.getElementById('coordinates');
        if (coords) {
            const x = Math.floor(this.player.position.x * 100) / 100;
            const y = Math.floor(this.player.position.y * 100) / 100;
            const z = Math.floor(this.player.position.z * 100) / 100;
            coords.textContent = `X: ${x} Y: ${y} Z: ${z}`;
        }
    }

    updateFPS() {
        this.frameCount++;
        const now = Date.now();
        const elapsed = now - this.lastTime;

        if (elapsed >= 1000) {
            this.fps = Math.round(this.frameCount * 1000 / elapsed);
            this.frameCount = 0;
            this.lastTime = now;
        }

        const fpsElement = document.getElementById('fps');
        if (fpsElement) {
            fpsElement.textContent = `FPS: ${this.fps}`;
        }
    }

    updateTimeOfDay() {
        // This would be called from main game loop with time value
        // For now, just a placeholder
    }

    updateBlockTarget() {
        if (this.player.blockTarget) {
            const pos = this.player.blockTarget.pos;
            // Could display the targeted block info here
        }
    }

    update() {
        this.updateCoordinates();
        this.updateFPS();
        this.updateHotbar();
        this.updateBlockTarget();
    }
}
