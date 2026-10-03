class MinecraftGame {
    constructor() {
        this.container = document.getElementById('game-container');
        this.width = window.innerWidth;
        this.height = window.innerHeight;

        this.setupScene();
        this.setupCamera();
        this.setupRenderer();
        this.setupLighting();

        this.world = new World(this.scene);
        this.player = new Player(this.scene, this.camera);
        this.ui = new GameUI(this.player, this.world);
        this.input = new InputManager(this.world, this.player);

        this.setupEventListeners();
        this.animate();
    }

    setupScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87ceeb);
        this.scene.fog = new THREE.Fog(0x87ceeb, 200, 500);
    }

    setupCamera() {
        this.camera = new THREE.PerspectiveCamera(75, this.width / this.height, 0.1, 1000);
        this.camera.position.y = 80;
    }

    setupRenderer() {
        this.renderer = new THREE.WebGLRenderer({ antialias: true, precision: 'highp' });
        this.renderer.setSize(this.width, this.height);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFShadowShadowMap;
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.container.appendChild(this.renderer.domElement);
    }

    setupLighting() {
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);

        this.directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        this.directionalLight.position.set(100, 200, 100);
        this.directionalLight.castShadow = true;
        this.directionalLight.shadow.mapSize.width = 2048;
        this.directionalLight.shadow.mapSize.height = 2048;
        this.directionalLight.shadow.camera.left = -200;
        this.directionalLight.shadow.camera.right = 200;
        this.directionalLight.shadow.camera.top = 200;
        this.directionalLight.shadow.camera.bottom = -200;
        this.directionalLight.shadow.camera.near = 0.5;
        this.directionalLight.shadow.camera.far = 500;
        this.scene.add(this.directionalLight);

        const hemisphereLight = new THREE.HemisphereLight(0x87ceeb, 0x220000, 0.4);
        this.scene.add(hemisphereLight);
    }

    setupEventListeners() {
        window.addEventListener('resize', () => this.onWindowResize());
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                document.exitPointerLock = document.exitPointerLock || document.mozExitPointerLock;
                document.exitPointerLock();
            }
        });
    }

    onWindowResize() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;

        this.camera.aspect = this.width / this.height;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize(this.width, this.height);
    }

    updateEnvironment() {
        const skyColor = this.world.getSkyColor();
        this.scene.background = skyColor;
        this.scene.fog.color = skyColor;

        const lightLevel = this.world.getLightLevel();
        this.directionalLight.intensity = 0.8 * lightLevel;

        const ambientIntensity = 0.3 + (0.3 * lightLevel);
        const ambientLight = this.scene.children.find(child => child instanceof THREE.AmbientLight);
        if (ambientLight) {
            ambientLight.intensity = ambientIntensity;
        }
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        this.player.update(this.world);
        this.world.updateChunks(this.player.position);
        this.world.update();
        this.updateEnvironment();
        this.ui.update();

        this.renderer.render(this.scene, this.camera);
    }
}

let game;

document.addEventListener('DOMContentLoaded', () => {
    game = new MinecraftGame();
});
