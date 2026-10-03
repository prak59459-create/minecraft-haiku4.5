import * as THREE from 'three';

export class ParticleSystem {
    constructor(scene) {
        this.scene = scene;
        this.particles = [];
        this.maxParticles = 1000;
    }

    createBlockDestructionParticles(x, y, z, blockColor) {
        const particleCount = 8;
        const speed = 15;

        for (let i = 0; i < particleCount; i++) {
            const angle = (i / particleCount) * Math.PI * 2;
            const velocity = new THREE.Vector3(
                Math.cos(angle) * speed,
                (Math.random() - 0.5) * speed * 0.5 + speed * 0.5,
                Math.sin(angle) * speed
            );

            this.addParticle({
                position: new THREE.Vector3(x + 0.5, y + 0.5, z + 0.5),
                velocity: velocity,
                color: blockColor,
                life: 0.5,
                maxLife: 0.5,
                gravity: 25
            });
        }
    }

    addParticle(config) {
        if (this.particles.length >= this.maxParticles) {
            return; // Skip if limit reached
        }

        const geometry = new THREE.BoxGeometry(0.1, 0.1, 0.1);
        const material = new THREE.MeshBasicMaterial({ color: config.color });
        const mesh = new THREE.Mesh(geometry, material);

        mesh.position.copy(config.position);
        this.scene.add(mesh);

        this.particles.push({
            mesh: mesh,
            velocity: config.velocity,
            life: config.life,
            maxLife: config.maxLife,
            gravity: config.gravity || 0
        });
    }

    update(deltaTime) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];

            particle.life -= deltaTime;

            if (particle.life <= 0) {
                this.scene.remove(particle.mesh);
                particle.mesh.geometry.dispose();
                particle.mesh.material.dispose();
                this.particles.splice(i, 1);
                continue;
            }

            // Apply gravity
            if (particle.gravity > 0) {
                particle.velocity.y -= particle.gravity * deltaTime;
            }

            // Update position
            particle.mesh.position.addScaledVector(particle.velocity, deltaTime);

            // Fade out
            const progress = 1 - (particle.life / particle.maxLife);
            particle.mesh.material.opacity = 1 - progress;
        }
    }
}
