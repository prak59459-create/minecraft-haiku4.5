class Game {
    constructor() {
        this.world = new World();
        this.renderer = new GameRenderer();
        this.player = new Player(new THREE.Vector3(0, 100, 0));
        this.physics = new Physics(this.world);
        this.inputManager = new InputManager(this.player, this.world, this.physics);

        this.lastTime = performance.now();
        this.frameCount = 0;
        this.fpsTimer = 0;
        this.fps = 0;

        this.maxDeltaTime = 0.016;
        this.gameTime = 0;

        this.inputManager.updateHotbar();

        this.start();
    }

    start() {
        this.gameLoop();
    }

    gameLoop = () => {
        requestAnimationFrame(this.gameLoop);

        const now = performance.now();
        let deltaTime = (now - this.lastTime) / 1000;
        deltaTime = Math.min(deltaTime, this.maxDeltaTime);
        this.lastTime = now;

        this.update(deltaTime);
        this.render();

        this.frameCount++;
        this.fpsTimer += deltaTime;

        if (this.fpsTimer >= 0.5) {
            this.fps = Math.round(this.frameCount / this.fpsTimer);
            this.frameCount = 0;
            this.fpsTimer = 0;
        }
    };

    update(deltaTime) {
        this.gameTime += deltaTime;

        this.inputManager.update(deltaTime);

        this.physics.update(this.player, deltaTime);

        this.world.unloadFarChunks(this.player.position.x, this.player.position.z, CONFIG.RENDER_DISTANCE);

        this.renderer.updateChunks(this.world, this.player.position.x, this.player.position.z);

        this.renderer.updateSkyLight(this.gameTime);

        this.updateUI();
    }

    updateUI() {
        const posEl = document.getElementById('pos');
        posEl.textContent = `Position: ${this.player.position.x.toFixed(1)}, ${this.player.position.y.toFixed(1)}, ${this.player.position.z.toFixed(1)}`;

        const chunkCoords = Utils.getChunkCoords(this.player.position.x, this.player.position.z);
        const chunkEl = document.getElementById('chunk');
        chunkEl.textContent = `Chunk: ${chunkCoords.x}, ${chunkCoords.z}`;

        const fpsEl = document.getElementById('fps');
        fpsEl.textContent = `FPS: ${this.fps}`;

        const sprintEl = document.getElementById('sprint-status');
        if (this.player.isSprinting) {
            sprintEl.textContent = 'Sprint: ON';
            sprintEl.className = 'status-active';
        } else {
            sprintEl.textContent = 'Sprint: OFF';
            sprintEl.className = 'status-inactive';
        }

        const crouchEl = document.getElementById('crouch-status');
        if (this.player.isCrouching) {
            crouchEl.textContent = 'Crouch: ON';
            crouchEl.className = 'status-active';
        } else {
            crouchEl.textContent = 'Crouch: OFF';
            crouchEl.className = 'status-inactive';
        }

        if (this.inputManager.locked) {
            const raycast = this.physics.raycast(
                this.player.getEyePosition(),
                this.player.getLookDirection(),
                10
            );

            if (raycast) {
                const blockName = BLOCK_PROPERTIES[raycast.block]?.name || 'Unknown';
                document.getElementById('block-name').textContent = blockName;
            }
        }
    }

    render() {
        this.renderer.render(this.player);
    }
}

const game = new Game();
