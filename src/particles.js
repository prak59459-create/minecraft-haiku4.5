import * as THREE from 'three';

export class ParticleSystem {
    constructor(scene) {
        this.scene = scene;
        this.particles = [];
    }

    createBlockBreakParticles(position, blockColor) {
        const particleCount = 8;

        for (let i = 0; i < particleCount; i++) {
            const angle = (Math.random() * Math.PI * 2);
            const velocity = new THREE.Vector3(
                Math.cos(angle) * (2 + Math.random() * 4),
                Math.random() * 8 + 3,
                Math.sin(angle) * (2 + Math.random() * 4)
            );

            const particle = {
                position: position.clone(),
                velocity: velocity,
                acceleration: new THREE.Vector3(0, -9.81 * 3, 0),
                life: 1,
                color: blockColor || 0x808080,
                size: 0.1 + Math.random() * 0.1
            };

            this.particles.push(particle);
        }
    }

    update(deltaTime) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];

            p.velocity.y += p.acceleration.y * deltaTime;
            p.position.addScaledVector(p.velocity, deltaTime);

            p.life -= deltaTime * 2;

            if (p.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }

    render(renderer) {
        const geometry = new THREE.BufferGeometry();

        if (this.particles.length === 0) return;

        const positions = [];
        const colors = [];
        const sizes = [];

        for (const p of this.particles) {
            positions.push(p.position.x, p.position.y, p.position.z);
            colors.push(1, 1, 1);
            sizes.push(p.size * p.life);
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array(colors), 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(new Float32Array(sizes), 1));

        const material = new THREE.PointsMaterial({
            size: 1,
            sizeAttenuation: true,
            vertexColors: true,
            transparent: true,
            opacity: 0.8
        });

        const points = new THREE.Points(geometry, material);
        this.scene.add(points);

        setTimeout(() => {
            this.scene.remove(points);
            geometry.dispose();
            material.dispose();
        }, 50);
    }
}
