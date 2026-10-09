export class ParticleSystem {
    constructor(scene) {
        this.scene = scene;
        this.particles = [];
        this.pool = [];
        this.maxParticles = 500;

        this.geometry = new THREE.BufferGeometry();
        this.material = new THREE.PointsMaterial({
            size: 0.25,
            sizeAttenuation: true,
            transparent: true,
            opacity: 0.9,
            sizeVariation: 0.5
        });
        this.points = new THREE.Points(this.geometry, this.material);
        this.scene.add(this.points);

        this.lastUpdateTime = performance.now();
    }

    createParticle() {
        if (this.pool.length > 0) {
            return this.pool.pop();
        }
        return {
            position: { x: 0, y: 0, z: 0 },
            velocity: { x: 0, y: 0, z: 0 },
            life: 1,
            maxLife: 1,
            color: 0xffffff
        };
    }

    addBlockBreakParticles(x, y, z, blockColor) {
        const particleCount = Math.min(12 + Math.floor(Math.random() * 8), this.maxParticles - this.particles.length);

        for (let i = 0; i < particleCount; i++) {
            const particle = this.createParticle();
            particle.position.x = x;
            particle.position.y = y;
            particle.position.z = z;
            particle.velocity.x = (Math.random() - 0.5) * 0.35;
            particle.velocity.y = Math.random() * 0.35;
            particle.velocity.z = (Math.random() - 0.5) * 0.35;
            particle.life = 1;
            particle.maxLife = 0.8 + Math.random() * 0.5;
            particle.color = blockColor;
            this.particles.push(particle);
        }
    }

    update() {
        const now = performance.now();
        const dt = Math.min((now - this.lastUpdateTime) / 1000, 0.02);
        this.lastUpdateTime = now;

        const gravity = 0.015;

        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.velocity.y -= gravity;
            p.position.x += p.velocity.x;
            p.position.y += p.velocity.y;
            p.position.z += p.velocity.z;
            p.life -= dt / p.maxLife;

            if (p.life <= 0) {
                const particle = this.particles.splice(i, 1)[0];
                if (this.pool.length < this.maxParticles) {
                    this.pool.push(particle);
                }
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
            colors[i * 3] = color.r * (p.life / p.maxLife);
            colors[i * 3 + 1] = color.g * (p.life / p.maxLife);
            colors[i * 3 + 2] = color.b * (p.life / p.maxLife);
        }

        this.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        this.geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    }
}
