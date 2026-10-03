class GameUI {
    constructor(player, world) {
        this.player = player;
        this.world = world;
        this.frameCount = 0;
        this.lastTime = Date.now();
        this.fps = 0;
        this.setupHotbar();
        this.updateBlockInfo();
    }

    setupHotbar() {
        const hotbarContainer = document.getElementById('hotbar-items');
        const blocks = blockRegistry.getAll();

        for (let i = 0; i < 9; i++) {
            const slot = document.createElement('div');
            slot.className = 'hotbar-slot';
            slot.id = `hotbar-slot-${i}`;

            if (i < blocks.length) {
                const block = blocks[i];
                const label = document.createElement('span');
                label.textContent = block.name.substring(0, 1).toUpperCase();
                slot.appendChild(label);

                const numLabel = document.createElement('span');
                numLabel.className = 'hotbar-slot-label';
                numLabel.textContent = `${i + 1}`;
                slot.appendChild(numLabel);

                slot.dataset.blockId = block.id;
                slot.style.backgroundColor = `hsl(0, 0%, ${Math.floor(Math.random() * 30 + 40)}%)`;
                slot.style.borderColor = `hsl(0, 0%, ${Math.floor(Math.random() * 30 + 60)}%)`;
            }

            hotbarContainer.appendChild(slot);
        }

        this.updateHotbarSelection();
    }

    updateHotbarSelection() {
        document.querySelectorAll('.hotbar-slot').forEach((slot, index) => {
            slot.classList.remove('active');
            if (index === this.player.selectedBlockIndex) {
                slot.classList.add('active');
            }
        });
    }

    updateBlockInfo() {
        const blockType = blockRegistry.get(this.player.selectedBlockType);
        const infoDiv = document.getElementById('block-info');
        infoDiv.textContent = `Selected: ${blockType.name}`;
    }

    update() {
        this.frameCount++;
        const currentTime = Date.now();

        if (currentTime - this.lastTime >= 1000) {
            this.fps = this.frameCount;
            this.frameCount = 0;
            this.lastTime = currentTime;
        }

        this.updateDebugInfo();
        this.updateTimeDisplay();
        this.updateHotbarSelection();
        this.updateBlockInfo();
    }

    updateDebugInfo() {
        const fpsEl = document.getElementById('fps');
        const posEl = document.getElementById('position');
        const chunkEl = document.getElementById('chunk-info');

        fpsEl.textContent = `FPS: ${this.fps}`;

        const x = this.player.position.x.toFixed(2);
        const y = this.player.position.y.toFixed(2);
        const z = this.player.position.z.toFixed(2);
        posEl.textContent = `Position: ${x}, ${y}, ${z}`;

        const chunkX = Math.floor(this.player.position.x / CHUNK_SIZE);
        const chunkZ = Math.floor(this.player.position.z / CHUNK_SIZE);
        chunkEl.textContent = `Chunk: ${chunkX}, ${chunkZ}\nLoaded: ${this.world.chunks.size}`;
    }

    updateTimeDisplay() {
        const timeEl = document.getElementById('time-display');
        const sunEl = document.getElementById('sun-indicator');

        const timeOfDay = this.world.getTimeOfDay();
        const hours = Math.floor(timeOfDay * 24);
        const minutes = Math.floor((timeOfDay * 24 - hours) * 60);

        timeEl.textContent = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;

        const sunPosition = document.querySelector('.sun-position');
        if (!sunPosition) {
            const pos = document.createElement('div');
            pos.className = 'sun-position';
            sunEl.appendChild(pos);
        } else {
            const percentage = Math.max(0, Math.min(100, (timeOfDay - 0.25) / 0.5 * 100));
            sunPosition.style.left = `${percentage}%`;
        }
    }
}

class InputManager {
    constructor(world, player) {
        this.world = world;
        this.player = player;
        this.selectedBlock = null;
        this.highlightedBlock = null;

        this.setupMouseHandling();
    }

    setupMouseHandling() {
        document.addEventListener('mousedown', (e) => {
            if (!this.player.pointerLocked) return;

            const target = this.player.getRayCastTarget(this.world);

            if (e.button === 0) {
                if (target) {
                    this.destroyBlock(target.position);
                }
            } else if (e.button === 2) {
                if (target) {
                    this.placeBlock(target.position);
                }
            }
        });

        document.addEventListener('contextmenu', (e) => {
            if (this.player.pointerLocked) {
                e.preventDefault();
            }
        });
    }

    destroyBlock(pos) {
        const x = Math.round(pos.x);
        const y = Math.round(pos.y);
        const z = Math.round(pos.z);

        const blockId = this.world.getBlockAt(x, y, z);
        if (blockId !== 0) {
            this.world.setBlockAt(x, y, z, 0);
            this.createDestructionParticles(x, y, z, blockId);
        }
    }

    placeBlock(pos) {
        const x = Math.round(pos.x);
        const y = Math.round(pos.y);
        const z = Math.round(pos.z);

        if (this.world.getBlockAt(x, y, z) === 0) {
            this.world.setBlockAt(x, y, z, this.player.selectedBlockType);
        }
    }

    createDestructionParticles(x, y, z, blockId) {
    }
}
