class Renderer {
    constructor() {
        this.canvas = document.createElement('canvas');
        document.body.appendChild(this.canvas);

        this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setClearColor(0x87ceeb);
        this.renderer.shadowMap.enabled = true;

        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.Fog(0x87ceeb, 200, 500);

        this.setupLighting();
        this.setupEventListeners();
    }

    setupLighting() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);

        // Directional light (sun)
        this.sunLight = new THREE.DirectionalLight(0xffffff, 1);
        this.sunLight.position.set(100, 100, 100);
        this.sunLight.castShadow = true;
        this.sunLight.shadow.mapSize.width = 2048;
        this.sunLight.shadow.mapSize.height = 2048;
        this.sunLight.shadow.camera.far = 500;
        this.sunLight.shadow.camera.left = -256;
        this.sunLight.shadow.camera.right = 256;
        this.sunLight.shadow.camera.top = 256;
        this.sunLight.shadow.camera.bottom = -256;
        this.scene.add(this.sunLight);

        // Skybox
        this.updateSkyboxColor(0.5);
    }

    setupEventListeners() {
        window.addEventListener('resize', () => this.onWindowResize());
    }

    onWindowResize() {
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    updateSkyboxColor(timeOfDay) {
        // Interpolate between night and day colors
        const nightColor = new THREE.Color(0x1a1a2e);
        const dayColor = new THREE.Color(0x87ceeb);
        const sunsetColor = new THREE.Color(0xff8c42);

        let color;
        if (timeOfDay < 0.25) {
            // Night to sunrise
            color = nightColor.lerp(sunsetColor, timeOfDay / 0.25);
        } else if (timeOfDay < 0.5) {
            // Sunrise to day
            color = sunsetColor.lerp(dayColor, (timeOfDay - 0.25) / 0.25);
        } else if (timeOfDay < 0.75) {
            // Day to sunset
            color = dayColor.lerp(sunsetColor, (timeOfDay - 0.5) / 0.25);
        } else {
            // Sunset to night
            color = sunsetColor.lerp(nightColor, (timeOfDay - 0.75) / 0.25);
        }

        this.renderer.setClearColor(color);
        this.scene.fog.color.copy(color);

        // Update lighting
        const lightIntensity = Math.sin(timeOfDay * Math.PI) * 0.7 + 0.3;
        this.sunLight.intensity = lightIntensity;
    }

    render(camera) {
        this.renderer.render(this.scene, camera);
    }
}

const renderer = new Renderer();
