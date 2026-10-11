export class ParticleSystem {
    constructor(scene) {
        this.scene = scene;
        this.particles = [];
        this.geometry = new THREE.BufferGeometry();
        this.material = new THREE.PointsMaterial({
            size: 0.25,
            sizeAttenuation: true,
            transparent: true,
            opacity: 0.9
        });
        this.points = new THREE.Points(this.geometry, this.material);
        this.scene.add(this.points);
        this.maxParticles = 2000;
    }

    addBlockBreakParticles(x, y, z, blockColor) {
        if (this.particles.length >= this.maxParticles) return;

        const particleCount = Math.min(10 + Math.floor(Math.random() * 6), this.maxParticles - this.particles.length);

        for (let i = 0; i < particleCount; i++) {
            const angle = (Math.PI * 2 * i) / particleCount;
            const speed = 0.15 + Math.random() * 0.2;

            const particle = {
                position: { x, y, z },
                velocity: {
                    x: Math.cos(angle) * speed,
                    y: 0.2 + Math.random() * 0.15,
                    z: Math.sin(angle) * speed
                },
                life: 1,
                maxLife: 0.6 + Math.random() * 0.4,
                color: blockColor,
                friction: 0.95
            };
            this.particles.push(particle);
        }
    }

    update() {
        const gravity = 0.015;
        let i = this.particles.length;

        while (i--) {
            const p = this.particles[i];
            p.velocity.y -= gravity;
            p.velocity.x *= p.friction;
            p.velocity.z *= p.friction;

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
        const count = this.particles.length;
        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);

        for (let i = 0; i < count; i++) {
            const p = this.particles[i];
            const idx = i * 3;
            positions[idx] = p.position.x;
            positions[idx + 1] = p.position.y;
            positions[idx + 2] = p.position.z;

            const color = new THREE.Color(p.color);
            colors[idx] = color.r;
            colors[idx + 1] = color.g;
            colors[idx + 2] = color.b;
        }

        this.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        this.geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    }
}
