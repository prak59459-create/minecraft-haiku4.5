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
        this.particles = [];

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
        this.updateParticles();

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

    createParticles(x, y, z, blockId) {
        const color = getBlockColor(blockId);
        for (let i = 0; i < 8; i++) {
            const particle = {
                position: new THREE.Vector3(x + 0.5, y + 0.5, z + 0.5),
                velocity: new THREE.Vector3(
                    (Math.random() - 0.5) * 0.3,
                    Math.random() * 0.3,
                    (Math.random() - 0.5) * 0.3
                ),
                life: 1.0,
                color: color
            };
            this.particles.push(particle);
        }
    }

    updateParticles() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.life -= 0.02;
            p.velocity.y -= 0.01;
            p.position.add(p.velocity);

            if (p.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }
}

let game;
