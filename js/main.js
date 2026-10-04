let game;

class MinecraftGame {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.player = null;
        this.world = null;
        this.ui = null;
        this.particles = null;
        this.time = 0;
        this.clock = new THREE.Clock();
        this.running = true;

        this.init();
        this.animate();
    }

    init() {
        // Scene setup
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.Fog(0x87ceeb, 300, 500);
        this.scene.background = new THREE.Color(0x87ceeb);

        // Camera setup
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
        this.camera.position.set(0, 100, 0);

        // Renderer setup
        this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFShadowShadowMap;
        document.getElementById('canvas-container').appendChild(this.renderer.domElement);

        // Lighting setup
        this.setupLighting();

        // Game systems
        this.world = new World(this.scene);
        this.particles = new ParticleSystem(this.scene);
        this.player = new Player(this.camera, this.world);
        this.ui = new UI(this.player, this.world);

        // Initial chunks
        this.world.getOrCreateChunk(0, 0);
        this.world.getOrCreateChunk(1, 0);
        this.world.getOrCreateChunk(-1, 0);
        this.world.getOrCreateChunk(0, 1);
        this.world.getOrCreateChunk(0, -1);
        this.world.updateChunkMesh(this.world.getChunk(0, 0));
        this.world.updateChunkMesh(this.world.getChunk(1, 0));
        this.world.updateChunkMesh(this.world.getChunk(-1, 0));
        this.world.updateChunkMesh(this.world.getChunk(0, 1));
        this.world.updateChunkMesh(this.world.getChunk(0, -1));

        // Player hotbar setup
        this.player.updateHotbar();

        // Window resize
        window.addEventListener('resize', () => this.onWindowResize());
    }

    setupLighting() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);
        this.ambientLight = ambientLight;

        // Directional light (sun)
        const sunLight = new THREE.DirectionalLight(0xffffff, 0.8);
        sunLight.position.set(100, 200, 100);
        sunLight.castShadow = true;
        sunLight.shadow.mapSize.width = 2048;
        sunLight.shadow.mapSize.height = 2048;
        sunLight.shadow.camera.left = -200;
        sunLight.shadow.camera.right = 200;
        sunLight.shadow.camera.top = 200;
        sunLight.shadow.camera.bottom = -200;
        sunLight.shadow.camera.far = 500;
        this.scene.add(sunLight);
        this.sunLight = sunLight;

        // Hemisphere light for better color
        const hemiLight = new THREE.HemisphereLight(0x87ceeb, 0x654321, 0.3);
        this.scene.add(hemiLight);
        this.hemiLight = hemiLight;

        // Create stars
        this.createStars();
    }

    createStars() {
        const starGeometry = new THREE.BufferGeometry();
        const starPositions = [];
        const starColors = [];

        for (let i = 0; i < 1000; i++) {
            const x = (Math.random() - 0.5) * 2000;
            const y = 200 + Math.random() * 300;
            const z = (Math.random() - 0.5) * 2000;

            starPositions.push(x, y, z);

            const brightness = 0.5 + Math.random() * 0.5;
            starColors.push(brightness, brightness, brightness);
        }

        starGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(starPositions), 3));
        starGeometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array(starColors), 3));

        const starMaterial = new THREE.PointsMaterial({
            size: 2,
            vertexColors: true,
            sizeAttenuation: true
        });

        this.stars = new THREE.Points(starGeometry, starMaterial);
        this.scene.add(this.stars);
    }

    animate() {
        if (!this.running) return;
        requestAnimationFrame(() => this.animate());

        const deltaTime = this.clock.getDelta();
        this.time += deltaTime / 20; // Slow down time cycle

        // Update player
        this.player.update(deltaTime);

        // Update world
        this.world.update(this.player.position);

        // Update particles
        this.particles.update(deltaTime);

        // Update lighting based on time
        this.updateLighting();

        // Update UI
        this.ui.update();

        // Render
        this.renderer.render(this.scene, this.camera);
    }

    updateLighting() {
        const timeOfDay = (this.time % 1) * Math.PI * 2; // 0 to 2π

        // Sun position (arc across sky)
        const sunX = Math.cos(timeOfDay - Math.PI / 2) * 150;
        const sunY = Math.sin(timeOfDay - Math.PI / 2) * 150 + 100;
        const sunZ = Math.cos(timeOfDay) * 50;

        this.sunLight.position.set(sunX, sunY, sunZ);
        this.sunLight.target.position.copy(this.player.position);

        // Day/night cycle coloring
        const brightness = Math.sin(timeOfDay - Math.PI / 2) * 0.5 + 0.5;
        const dayColor = new THREE.Color(0xffffff);
        const nightColor = new THREE.Color(0x2a2a4a);
        const currentColor = dayColor.clone().lerp(nightColor, 1 - brightness);

        this.sunLight.color.copy(currentColor);
        this.sunLight.intensity = Math.max(0.1, brightness * 0.8 + 0.2);

        // Ambient light variation
        this.ambientLight.intensity = 0.3 + brightness * 0.3;

        // Hemisphere light color change
        const hemiDayColor = new THREE.Color(0x87ceeb);
        const hemiNightColor = new THREE.Color(0x1a1a3a);
        this.hemiLight.skyColor.copy(hemiDayColor.clone().lerp(hemiNightColor, 1 - brightness));

        // Stars visibility
        if (this.stars) {
            this.stars.material.opacity = Math.max(0, (0.3 - brightness) * 3);
            this.stars.material.transparent = true;
        }

        // Fog and background
        const skyColor = new THREE.Color(0x87ceeb).lerp(new THREE.Color(0x0a0a1f), 1 - brightness);
        this.scene.background.copy(skyColor);
        this.scene.fog.color.copy(skyColor);
    }

    onWindowResize() {
        const width = window.innerWidth;
        const height = window.innerHeight;

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }
}

// Start game when page loads
window.addEventListener('load', () => {
    game = new MinecraftGame();
});

window.addEventListener('beforeunload', () => {
    if (game) {
        game.running = false;
    }
});
