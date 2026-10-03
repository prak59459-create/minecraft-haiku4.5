class Game {
    constructor() {
        this.world = new World();
        this.player = new Player();
        this.renderer = renderer;
        this.particles = new ParticleSystem(this.renderer.scene);

        this.gameTime = 6; // 6:00 AM
        this.timeSpeed = 0.0005; // Time multiplier

        this.lastFrameTime = Date.now();
        this.frameCount = 0;
        this.fps = 60;

        this.init();
    }

    init() {
        // Generate initial terrain around player
        const [chunkX, chunkZ] = getChunkCoords(this.player.position.x, this.player.position.z);

        for (let x = -RENDER_DISTANCE; x <= RENDER_DISTANCE; x++) {
            for (let z = -RENDER_DISTANCE; z <= RENDER_DISTANCE; z++) {
                const cx = chunkX + x;
                const cz = chunkZ + z;
                const mesh = this.world.createChunkMesh(cx, cz);
                this.renderer.scene.add(mesh);
            }
        }

        // Update block selector UI
        this.player.updateBlockSelector();

        // Start game loop
        this.loop();
    }

    loop() {
        const now = Date.now();
        const deltaTime = now - this.lastFrameTime;
        this.lastFrameTime = now;

        // Update game time
        this.gameTime += deltaTime * this.timeSpeed;
        if (this.gameTime >= 24) this.gameTime -= 24;

        // Update sky
        const timeOfDay = this.gameTime / 24;
        this.renderer.updateSkyboxColor(timeOfDay);

        // Update particles
        this.particles.update(deltaTime);

        // Update player
        this.player.update(this.world);

        // Get camera from player
        const camera = this.player.getCamera();

        // Update HUD
        this.updateHUD(camera);

        // Render
        this.renderer.render(camera);

        // FPS counter
        this.frameCount++;
        if (now % 1000 < deltaTime) {
            this.fps = this.frameCount;
            this.frameCount = 0;
        }

        requestAnimationFrame(() => this.loop());
    }

    updateHUD(camera) {
        // Update position
        document.getElementById('posX').textContent = Math.floor(this.player.position.x);
        document.getElementById('posY').textContent = Math.floor(this.player.position.y);
        document.getElementById('posZ').textContent = Math.floor(this.player.position.z);

        // Update FPS
        document.getElementById('fps').textContent = this.fps;

        // Update chunk count
        document.getElementById('chunks').textContent = this.world.meshes.size;

        // Update time
        const hours = Math.floor(this.gameTime);
        const minutes = Math.floor((this.gameTime - hours) * 60);
        document.getElementById('time').textContent =
            `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }
}

// Global game instance
let game;
let world;

// Initialize on load
window.addEventListener('load', () => {
    game = new Game();
    world = game.world;

    // Focus on the page
    document.body.focus();
});
