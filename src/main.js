import * as THREE from 'three';
import { SimplexNoise } from 'simplex-noise';
import { World } from './game/world.js';
import { Player } from './game/player.js';
import { Physics } from './game/physics.js';
import { UI } from './game/ui.js';
import { ParticleSystem } from './game/particles.js';
import { AudioSystem } from './game/audio.js';

class MinecraftGame {
    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true });

        this.setupRenderer();
        this.setupLighting();

        this.world = new World(this.scene, new SimplexNoise());
        this.player = new Player(this.camera, this.renderer.domElement);
        this.physics = new Physics(this.world, this.player);
        this.ui = new UI(this.player, this.world, this.camera);
        this.particles = new ParticleSystem(this.scene);
        this.audio = new AudioSystem();

        this.time = 0;
        this.dayDuration = 20; // seconds for a full day/night cycle
        this.lastPlayerPos = this.player.position.clone();
        this.footstepCooldown = 0;

        window.addEventListener('resize', () => this.onWindowResize());
        this.onWindowResize();

        this.animate();
    }

    setupRenderer() {
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setClearColor(0x87ceeb);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFShadowShadowMap;
        document.getElementById('canvas-container').appendChild(this.renderer.domElement);
    }

    setupLighting() {
        const sunLight = new THREE.DirectionalLight(0xffffff, 1.0);
        sunLight.position.set(50, 50, 50);
        sunLight.castShadow = true;
        sunLight.shadow.camera.left = -100;
        sunLight.shadow.camera.right = 100;
        sunLight.shadow.camera.top = 100;
        sunLight.shadow.camera.bottom = -100;
        sunLight.shadow.mapSize.width = 2048;
        sunLight.shadow.mapSize.height = 2048;
        this.scene.add(sunLight);

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
        this.scene.add(ambientLight);

        this.sunLight = sunLight;
        this.ambientLight = ambientLight;
    }

    updateDayNightCycle(deltaTime) {
        this.time += deltaTime;
        const timeOfDay = (this.time % this.dayDuration) / this.dayDuration;

        // Calculate sun position (full circle)
        const sunAngle = timeOfDay * Math.PI * 2 - Math.PI / 2;
        const sunHeight = Math.sin(sunAngle);
        const sunDistance = 100;

        this.sunLight.position.x = Math.cos(sunAngle) * sunDistance;
        this.sunLight.position.y = Math.max(5, sunHeight * sunDistance);
        this.sunLight.position.z = 50;

        // Sky color based on time
        const skyColors = [
            0x000033, // night
            0x87ceeb, // day
            0xff6600, // sunset
            0x000033  // night
        ];

        let skyColor;
        if (timeOfDay < 0.25) {
            skyColor = new THREE.Color().lerpColors(
                new THREE.Color(skyColors[0]),
                new THREE.Color(skyColors[1]),
                timeOfDay * 4
            );
        } else if (timeOfDay < 0.5) {
            skyColor = new THREE.Color(skyColors[1]);
        } else if (timeOfDay < 0.75) {
            skyColor = new THREE.Color().lerpColors(
                new THREE.Color(skyColors[1]),
                new THREE.Color(skyColors[2]),
                (timeOfDay - 0.5) * 4
            );
        } else {
            skyColor = new THREE.Color().lerpColors(
                new THREE.Color(skyColors[2]),
                new THREE.Color(skyColors[0]),
                (timeOfDay - 0.75) * 4
            );
        }

        this.scene.background = skyColor;

        // Adjust lighting based on sun height
        const lightIntensity = Math.max(0.2, sunHeight * 0.8 + 0.2);
        this.sunLight.intensity = lightIntensity;
        this.ambientLight.intensity = Math.max(0.1, 0.4 - sunHeight * 0.3);
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        const deltaTime = 1 / 60;

        // Update player input and movement
        this.player.update(deltaTime);

        // Apply physics
        this.physics.update(deltaTime);

        // Update world (chunk loading/unloading)
        this.world.update(this.player.position);

        // Update day/night cycle
        this.updateDayNightCycle(deltaTime);

        // Handle block interaction
        this.player.handleBlockInteraction(this.world, this.particles, this.audio);

        // Update particles
        this.particles.update(deltaTime);

        // Handle footstep sounds
        this.updateFootsteps();

        // Update UI
        this.ui.update();

        // Render
        this.renderer.render(this.scene, this.camera);
    }

    updateFootsteps() {
        const moveDistance = this.player.position.distanceTo(this.lastPlayerPos);
        this.lastPlayerPos.copy(this.player.position);

        if (moveDistance > 0.05 && this.player.isGrounded) {
            this.footstepCooldown -= 1 / 60;
            if (this.footstepCooldown <= 0) {
                this.audio.playFootstep();
                this.footstepCooldown = 0.3;
            }
        } else {
            this.footstepCooldown = 0;
        }
    }

    onWindowResize() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }
}

// Start the game when DOM is loaded
window.addEventListener('DOMContentLoaded', () => {
    new MinecraftGame();
});
