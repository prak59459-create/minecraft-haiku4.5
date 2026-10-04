class Game {
    constructor() {
        this.world = new World();
        this.renderer = new Renderer();
        this.player = new Player(this.world);
        this.renderer.camera = this.player.camera;
        this.audio = new AudioManager();
        this.particleSystem = new ParticleSystem(this.renderer.scene);

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

        const keysToRemove = [];
        for (let key of this.loadedChunks) {
            if (!chunksToKeep.has(key)) {
                keysToRemove.push(key);
            }
        }

        for (let key of keysToRemove) {
            const mesh = this.renderer.chunkMeshes.get(key);
            if (mesh) {
                this.renderer.scene.remove(mesh);
                mesh.geometry.dispose();
                mesh.material.dispose();
            }
            const waterKey = `${key}_water`;
            const waterMesh = this.renderer.chunkMeshes.get(waterKey);
            if (waterMesh) {
                this.renderer.scene.remove(waterMesh);
                waterMesh.geometry.dispose();
                waterMesh.material.dispose();
                this.renderer.chunkMeshes.delete(waterKey);
            }
            this.renderer.chunkMeshes.delete(key);
            this.loadedChunks.delete(key);
        }
    }

    updateUI() {
        const fps = document.getElementById('fps');
        if (fps) {
            const fpsColor = this.fps < 30 ? '#ff6666' : this.fps < 60 ? '#ffff00' : '#00ff00';
            fps.textContent = `FPS: ${this.fps}`;
            fps.style.color = fpsColor;
        }

        const pos = document.getElementById('position');
        if (pos) {
            const chunkX = Math.floor(this.player.position.x / 16);
            const chunkZ = Math.floor(this.player.position.z / 16);
            pos.textContent = `X: ${this.player.position.x.toFixed(1)} Y: ${this.player.position.y.toFixed(1)} Z: ${this.player.position.z.toFixed(1)}`;
        }

        const chunks = document.getElementById('chunks');
        if (chunks) {
            chunks.textContent = `Chunks: ${this.loadedChunks.size}`;
        }

        const timeIndicator = document.getElementById('time-indicator');
        if (timeIndicator) {
            const timePercent = (this.gameTime % 20000) / 20000;
            const hour = Math.floor(timePercent * 24);
            if (timePercent < 0.25 || timePercent > 0.75) {
                timeIndicator.textContent = `🌙 Night (${hour}:00)`;
            } else {
                timeIndicator.textContent = `☀️ Day (${hour}:00)`;
            }
        }

        if (this.frameCount % 10 === 0) {
            updateInventoryDisplay();
        }
    }

    createParticles(x, y, z, blockId) {
        const color = getBlockColor(blockId);
        for (let i = 0; i < 12; i++) {
            const velocity = new THREE.Vector3(
                (Math.random() - 0.5) * 0.4,
                Math.random() * 0.4,
                (Math.random() - 0.5) * 0.4
            );
            this.particleSystem.addParticle(
                new THREE.Vector3(x + 0.5, y + 0.5, z + 0.5),
                velocity,
                0.8,
                color
            );
        }
    }

    updateParticles() {
        this.particleSystem.update();
    }
}

let game;
