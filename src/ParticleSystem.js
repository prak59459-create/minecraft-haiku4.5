import * as THREE from 'three';

export class ParticleSystem {
    constructor(scene) {
        this.scene = scene;
        this.particles = [];
    }

    addDestructionParticles(position, blockId, count = 8) {
        for (let i = 0; i < count; i++) {
            const particle = {
                position: position.clone(),
                velocity: new THREE.Vector3(
                    (Math.random() - 0.5) * 10,
                    Math.random() * 10,
                    (Math.random() - 0.5) * 10
                ),
                life: 1,
                maxLife: 1,
                blockId: blockId
            };
            this.particles.push(particle);
        }
    }

    update(deltaTime) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.life -= deltaTime * 2;

            if (p.life <= 0) {
                this.particles.splice(i, 1);
                continue;
            }

            p.velocity.y -= 20 * deltaTime;
            p.position.addScaledVector(p.velocity, deltaTime);
        }
    }

    clear() {
        this.particles = [];
    }
}
