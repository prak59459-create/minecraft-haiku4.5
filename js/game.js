class Game {
    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setClearColor(0x87CEEB);
        this.renderer.shadowMap.enabled = true;
        document.body.appendChild(this.renderer.domElement);

        this.noise = new NoiseGenerator(12345);
        this.world = new World(this.scene, this.noise);
        this.physics = new Physics(this.world);
        this.particles = new ParticleSystem(this.scene);
        this.audio = new AudioManager();
        this.player = new Player(this.camera, this.world, this.physics, this.particles, this.audio);

        this.setupLighting();
        this.setupResizeHandler();

        this.frameCount = 0;
        this.fpsTime = 0;
        this.fps = 0;

        this.dayTime = 0;
        this.dayStartTime = Date.now();

        this.performanceMonitor = new PerformanceMonitor();
        this.renderOptimizer = new RenderOptimizer(this.renderer, this.camera, this.scene);

        this.animate();
    }

    setupLighting() {
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);

        this.sunLight = new THREE.DirectionalLight(0xffffff, 0.8);
        this.sunLight.position.set(100, 100, 50);
        this.sunLight.castShadow = true;
        this.sunLight.shadow.mapSize.width = 2048;
        this.sunLight.shadow.mapSize.height = 2048;
        this.sunLight.shadow.camera.far = 500;
        this.sunLight.shadow.camera.left = -200;
        this.sunLight.shadow.camera.right = 200;
        this.sunLight.shadow.camera.top = 200;
        this.sunLight.shadow.camera.bottom = -200;
        this.scene.add(this.sunLight);

        this.skyGeometry = new THREE.SphereGeometry(500, 32, 32);
        const skyMaterial = new THREE.MeshBasicMaterial({
            color: 0x87CEEB,
            side: THREE.BackSide
        });
        this.skyMesh = new THREE.Mesh(this.skyGeometry, skyMaterial);
        this.scene.add(this.skyMesh);
    }

    updateDayNightCycle() {
        const elapsedMS = Date.now() - this.dayStartTime;
        const dayProgress = (elapsedMS % DAY_CYCLE_MS) / DAY_CYCLE_MS;

        const sunAngle = dayProgress * Math.PI * 2;
        const sunHeight = Math.sin(sunAngle) * 150;
        const sunDistance = Math.cos(sunAngle) * 150;

        this.sunLight.position.set(sunDistance, Math.max(sunHeight, 10), 100);

        const time = Math.floor(dayProgress * 24 * 60);
        const hours = Math.floor(time / 60);
        const minutes = time % 60;

        document.getElementById('time').textContent =
            `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

        const brightness = Math.max(0.2, Math.sin(sunAngle) * 0.4 + 0.6);
        this.sunLight.intensity = brightness;

        const skyColor = new THREE.Color();
        if (dayProgress < 0.25) {
            skyColor.lerpColors(
                new THREE.Color(0x1a1a2e),
                new THREE.Color(0x87CEEB),
                dayProgress / 0.25
            );
        } else if (dayProgress < 0.5) {
            skyColor.setHex(0x87CEEB);
        } else if (dayProgress < 0.75) {
            skyColor.lerpColors(
                new THREE.Color(0x87CEEB),
                new THREE.Color(0xFF6B35),
                (dayProgress - 0.5) / 0.25
            );
        } else {
            skyColor.lerpColors(
                new THREE.Color(0xFF6B35),
                new THREE.Color(0x1a1a2e),
                (dayProgress - 0.75) / 0.25
            );
        }

        this.renderer.setClearColor(skyColor);
        if (this.skyMesh) {
            this.skyMesh.material.color.copy(skyColor);
        }
    }

    updateUI() {
        this.frameCount++;
        const now = performance.now();

        if (now >= this.fpsTime + 1000) {
            this.fps = this.frameCount;
            this.frameCount = 0;
            this.fpsTime = now;
        }

        document.getElementById('fps').textContent = this.fps;

        const pos = this.player.position;
        document.getElementById('position').textContent =
            `${Math.floor(pos.x)}, ${Math.floor(pos.y)}, ${Math.floor(pos.z)}`;

        const playerChunkX = Math.floor(pos.x / CHUNK_SIZE);
        const playerChunkZ = Math.floor(pos.z / CHUNK_SIZE);
        let chunkCount = 0;
        this.world.loadedChunks.forEach(() => chunkCount++);
        document.getElementById('chunks').textContent = chunkCount;
    }

    setupResizeHandler() {
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }

    animate = () => {
        requestAnimationFrame(this.animate);

        this.player.update();
        this.world.update(this.player.position.x, this.player.position.z);
        this.particles.update();

        this.updateDayNightCycle();
        this.updateUI();

        let vertexCount = 0;
        this.world.meshScene.children.forEach(mesh => {
            if (mesh.geometry && mesh.geometry.attributes.position) {
                vertexCount += mesh.geometry.attributes.position.count;
            }
        });

        this.performanceMonitor.recordFrame(
            this.renderer.info.render.calls,
            this.world.loadedChunks.size,
            vertexCount
        );

        this.renderer.render(this.scene, this.camera);
    }
}

window.addEventListener('DOMContentLoaded', () => {
    const game = new Game();
});
