class Game {
    constructor() {
        this.world = new World();
        this.renderer = new Renderer();
        this.player = new Player(this.world);
        this.renderer.camera = this.player.camera;

        this.frameCount = 0;
        this.lastFrameTime = Date.now();
        this.fps = 0;
        this.gameTime = 0;
        this.loadedChunks = new Set();

        this.animate();
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        const now = Date.now();
        const deltaTime = (now - this.lastFrameTime) / 1000;
        this.lastFrameTime = now;

        this.gameTime += deltaTime * 100;
        this.renderer.updateTime(this.gameTime);

        this.player.update(this.renderer.scene, this.world);
        this.updateChunks();

        this.renderer.render(this.renderer.scene, this.player.camera);

        this.frameCount++;
        if (now - this.lastFrameTime > 1000) {
            this.fps = this.frameCount;
            this.frameCount = 0;
        }

        this.updateUI();
    }

    updateChunks() {
        const playerX = this.player.position.x;
        const playerZ = this.player.position.z;

        const chunksToLoad = this.world.getChunksInView(playerX, playerZ);
        const chunksToKeep = new Set();

        for (let chunk of chunksToLoad) {
            const key = `${chunk.x},${chunk.z}`;
            chunksToKeep.add(key);

            if (!this.loadedChunks.has(key)) {
                this.renderer.renderChunk(this.world, chunk.x, chunk.z);
                this.loadedChunks.add(key);
            }
        }

        for (let key of this.loadedChunks) {
            if (!chunksToKeep.has(key)) {
                const mesh = this.renderer.chunkMeshes.get(key);
                if (mesh) {
                    this.renderer.scene.remove(mesh);
                    mesh.geometry.dispose();
                    mesh.material.dispose();
                }
                this.renderer.chunkMeshes.delete(key);
                this.loadedChunks.delete(key);
            }
        }
    }

    updateUI() {
        const fps = document.getElementById('fps');
        if (fps) fps.textContent = `FPS: ${this.fps}`;

        const pos = document.getElementById('position');
        if (pos) {
            pos.textContent = `X: ${this.player.position.x.toFixed(1)} Y: ${this.player.position.y.toFixed(1)} Z: ${this.player.position.z.toFixed(1)}`;
        }

        const chunks = document.getElementById('chunks');
        if (chunks) chunks.textContent = `Chunks: ${this.loadedChunks.size}`;

        const timeIndicator = document.getElementById('time-indicator');
        if (timeIndicator) {
            const timePercent = (this.gameTime % 20000) / 20000;
            if (timePercent < 0.25 || timePercent > 0.75) {
                timeIndicator.textContent = 'Time: Night';
            } else {
                timeIndicator.textContent = 'Time: Day';
            }
        }
    }
}

let game;
