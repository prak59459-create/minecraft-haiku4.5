import * as THREE from 'three';

export class ParticleSystem {
    constructor(scene) {
        this.scene = scene;
        this.particles = [];
    }

    createBlockBreakParticles(x, y, z, blockColor) {
        const particleCount = 8;

        for (let i = 0; i < particleCount; i++) {
            const geometry = new THREE.BoxGeometry(0.2, 0.2, 0.2);
            const material = new THREE.MeshPhongMaterial({ color: blockColor });
            const mesh = new THREE.Mesh(geometry, material);

            mesh.position.set(
                x + 0.5 + (Math.random() - 0.5) * 0.5,
                y + 0.5 + (Math.random() - 0.5) * 0.5,
                z + 0.5 + (Math.random() - 0.5) * 0.5
            );

            const vx = (Math.random() - 0.5) * 10;
            const vy = Math.random() * 8;
            const vz = (Math.random() - 0.5) * 10;

            const particle = {
                mesh: mesh,
                velocity: new THREE.Vector3(vx, vy, vz),
                lifetime: 0.5,
                age: 0,
                gravity: 15
            };

            this.scene.add(mesh);
            this.particles.push(particle);
        }
    }

    update(deltaTime) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            particle.age += deltaTime;

            if (particle.age >= particle.lifetime) {
                this.scene.remove(particle.mesh);
                particle.mesh.geometry.dispose();
                particle.mesh.material.dispose();
                this.particles.splice(i, 1);
                continue;
            }

            particle.velocity.y -= particle.gravity * deltaTime;
            particle.mesh.position.addScaledVector(particle.velocity, deltaTime);

            const alpha = 1 - (particle.age / particle.lifetime);
            particle.mesh.material.opacity = alpha;
            particle.mesh.material.transparent = true;
        }
    }

    clear() {
        for (let particle of this.particles) {
            this.scene.remove(particle.mesh);
            particle.mesh.geometry.dispose();
            particle.mesh.material.dispose();
        }
        this.particles = [];
    }
}
