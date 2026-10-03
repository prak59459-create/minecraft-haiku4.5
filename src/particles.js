import * as THREE from 'three';

export class ParticleSystem {
    constructor(scene) {
        this.scene = scene;
        this.particles = [];
    }

    createBlockBreakParticles(position, blockType) {
        const particleCount = 8;
        for (let i = 0; i < particleCount; i++) {
            const particle = {
                position: position.clone().add(
                    new THREE.Vector3(
                        (Math.random() - 0.5) * 0.5,
                        (Math.random() - 0.5) * 0.5,
                        (Math.random() - 0.5) * 0.5
                    )
                ),
                velocity: new THREE.Vector3(
                    (Math.random() - 0.5) * 8,
                    Math.random() * 4 + 2,
                    (Math.random() - 0.5) * 8
                ),
                lifetime: 0.5 + Math.random() * 0.5,
                maxLifetime: 0.5 + Math.random() * 0.5,
                blockType: blockType,
                mesh: this.createParticleMesh(blockType)
            };

            this.scene.add(particle.mesh);
            this.particles.push(particle);
        }
    }

    createParticleMesh(blockType) {
        const size = 0.1 + Math.random() * 0.1;
        const geometry = new THREE.BoxGeometry(size, size, size);
        const material = new THREE.MeshStandardMaterial({
            color: this.getBlockColor(blockType),
            roughness: 0.9,
            metalness: 0
        });
        return new THREE.Mesh(geometry, material);
    }

    getBlockColor(blockType) {
        const colors = {
            grass: 0x90ee90,
            dirt: 0x8b7355,
            stone: 0x808080,
            wood: 0x8b4513,
            leaves: 0x228b22,
            water: 0x4169e1,
            sand: 0xedc9af,
            cobblestone: 0xa0a0a0,
            bedrock: 0x4a4a4a
        };
        return colors[blockType] || 0xffffff;
    }

    update(delta) {
        const gravity = 9.8;
        const toRemove = [];

        for (let i = 0; i < this.particles.length; i++) {
            const particle = this.particles[i];
            particle.lifetime -= delta;

            if (particle.lifetime <= 0) {
                this.scene.remove(particle.mesh);
                particle.mesh.geometry.dispose();
                particle.mesh.material.dispose();
                toRemove.push(i);
                continue;
            }

            // Update velocity
            particle.velocity.y -= gravity * delta;

            // Update position
            particle.position.add(particle.velocity.clone().multiplyScalar(delta));
            particle.mesh.position.copy(particle.position);

            // Fade out
            const progress = 1 - (particle.lifetime / particle.maxLifetime);
            particle.mesh.material.opacity = Math.max(0, 1 - progress);
        }

        // Remove dead particles
        for (let i = toRemove.length - 1; i >= 0; i--) {
            this.particles.splice(toRemove[i], 1);
        }
    }

    dispose() {
        for (const particle of this.particles) {
            this.scene.remove(particle.mesh);
            particle.mesh.geometry.dispose();
            particle.mesh.material.dispose();
        }
        this.particles = [];
    }
}
