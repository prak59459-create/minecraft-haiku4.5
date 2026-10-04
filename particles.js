export class ParticleSystem {
    constructor(scene, maxParticles = 3000) {
        this.scene = scene;
        this.particles = [];
        this.maxParticles = maxParticles;
        this.geometry = new THREE.BufferGeometry();
        this.material = new THREE.PointsMaterial({
            size: 0.15,
            sizeAttenuation: true,
            transparent: true,
            opacity: 1.0,
            vertexColors: true
        });
        this.points = new THREE.Points(this.geometry, this.material);
        this.scene.add(this.points);
    }

    addBlockBreakParticles(x, y, z, blockColor) {
        if (this.particles.length >= this.maxParticles) return;

        const particleCount = Math.min(8 + Math.floor(Math.random() * 8), this.maxParticles - this.particles.length);

        for (let i = 0; i < particleCount; i++) {
            const angle = (Math.PI * 2 * i) / particleCount;
            const speed = 0.2 + Math.random() * 0.2;

            const particle = {
                position: { x: x + (Math.random() - 0.5) * 0.3, y: y + (Math.random() - 0.5) * 0.3, z: z + (Math.random() - 0.5) * 0.3 },
                velocity: {
                    x: Math.cos(angle) * speed + (Math.random() - 0.5) * 0.1,
                    y: 0.15 + Math.random() * 0.15,
                    z: Math.sin(angle) * speed + (Math.random() - 0.5) * 0.1
                },
                life: 1,
                maxLife: 0.6 + Math.random() * 0.4,
                color: blockColor,
                gravity: 0.015
            };
            this.particles.push(particle);
        }
    }

    update() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.velocity.y -= p.gravity;
            p.velocity.x *= 0.98;
            p.velocity.z *= 0.98;
            p.position.x += p.velocity.x;
            p.position.y += p.velocity.y;
            p.position.z += p.velocity.z;
            p.life -= 1 / 60;

            if (p.life <= 0) {
                this.particles.splice(i, 1);
            }
        }

        this.updateGeometry();
    }

    updateGeometry() {
        if (this.particles.length === 0) {
            this.geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array([]), 3));
            this.geometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array([]), 3));
            return;
        }

        const positions = new Float32Array(this.particles.length * 3);
        const colors = new Float32Array(this.particles.length * 4);

        for (let i = 0; i < this.particles.length; i++) {
            const p = this.particles[i];
            positions[i * 3] = p.position.x;
            positions[i * 3 + 1] = p.position.y;
            positions[i * 3 + 2] = p.position.z;

            const color = new THREE.Color(p.color);
            const alpha = Math.pow(p.life / p.maxLife, 0.5);
            colors[i * 4] = color.r;
            colors[i * 4 + 1] = color.g;
            colors[i * 4 + 2] = color.b;
            colors[i * 4 + 3] = alpha;
        }

        this.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        this.geometry.setAttribute('color', new THREE.BufferAttribute(colors, 4));
    }
}
