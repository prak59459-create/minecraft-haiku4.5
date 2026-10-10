export class ParticleSystem {
    constructor(scene) {
        this.scene = scene;
        this.particles = [];
        this.maxParticles = 2000;
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
        if (this.particles.length >= this.maxParticles) return;

        const particleCount = Math.min(12 + Math.floor(Math.random() * 8), this.maxParticles - this.particles.length);

        for (let i = 0; i < particleCount; i++) {
            const speedMult = 0.25 + Math.random() * 0.15;
            const particle = {
                position: { x, y, z },
                velocity: {
                    x: (Math.random() - 0.5) * speedMult,
                    y: (Math.random() * 0.5) * speedMult,
                    z: (Math.random() - 0.5) * speedMult
                },
                life: 1,
                maxLife: 1.0 + Math.random() * 0.5,
                color: blockColor,
                size: 0.15 + Math.random() * 0.1
            };
            this.particles.push(particle);
        }
    }

    update() {
        const gravity = 0.015;

        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.velocity.y -= gravity;
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
        const colors = new Float32Array(this.particles.length * 3);

        for (let i = 0; i < this.particles.length; i++) {
            const p = this.particles[i];
            positions[i * 3] = p.position.x;
            positions[i * 3 + 1] = p.position.y;
            positions[i * 3 + 2] = p.position.z;

            const color = new THREE.Color(p.color);
            const alpha = p.life / p.maxLife;
            colors[i * 3] = color.r * alpha;
            colors[i * 3 + 1] = color.g * alpha;
            colors[i * 3 + 2] = color.b * alpha;
        }

        this.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        this.geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    }
}
