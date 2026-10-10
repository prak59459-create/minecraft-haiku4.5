export class ParticleSystem {
    constructor(scene) {
        this.scene = scene;
        this.particles = [];
        this.geometry = new THREE.BufferGeometry();
        this.material = new THREE.PointsMaterial({
            size: 0.25,
            sizeAttenuation: true,
            transparent: true,
            opacity: 0.9,
            vertexColors: true
        });
        this.points = new THREE.Points(this.geometry, this.material);
        this.scene.add(this.points);
    }

    addBlockBreakParticles(x, y, z, blockColor) {
        const particleCount = 10 + Math.floor(Math.random() * 10);

        for (let i = 0; i < particleCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 0.15 + Math.random() * 0.2;
            const particle = {
                position: { x, y, z },
                velocity: {
                    x: Math.cos(angle) * speed,
                    y: 0.2 + Math.random() * 0.2,
                    z: Math.sin(angle) * speed
                },
                life: 1,
                maxLife: 0.6 + Math.random() * 0.4,
                color: blockColor,
                damping: 0.98
            };
            this.particles.push(particle);
        }
    }

    update() {
        const gravity = 0.015;

        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.velocity.y -= gravity;
            p.velocity.x *= p.damping;
            p.velocity.z *= p.damping;
            p.position.x += p.velocity.x;
            p.position.y += p.velocity.y;
            p.position.z += p.velocity.z;
            p.life -= 1 / 60;

            if (p.life <= 0) {
                this.particles.splice(i, 1);
            }
        }

        if (this.particles.length > 0) {
            this.updateGeometry();
        }
    }

    updateGeometry() {
        const positions = new Float32Array(this.particles.length * 3);
        const colors = new Uint8Array(this.particles.length * 3);

        for (let i = 0; i < this.particles.length; i++) {
            const p = this.particles[i];
            positions[i * 3] = p.position.x;
            positions[i * 3 + 1] = p.position.y;
            positions[i * 3 + 2] = p.position.z;

            const color = new THREE.Color(p.color);
            const alpha = p.life / p.maxLife;
            colors[i * 3] = Math.floor(color.r * 255 * alpha);
            colors[i * 3 + 1] = Math.floor(color.g * 255 * alpha);
            colors[i * 3 + 2] = Math.floor(color.b * 255 * alpha);
        }

        this.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        this.geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3, true));
        this.material.opacity = 0.9;
    }
}
