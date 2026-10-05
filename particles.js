export class ParticleSystem {
    constructor(scene, maxParticles = 2000) {
        this.scene = scene;
        this.particles = [];
        this.pool = [];
        this.maxParticles = maxParticles;

        this.geometry = new THREE.BufferGeometry();
        this.material = new THREE.PointsMaterial({
            size: 0.2,
            sizeAttenuation: true,
            transparent: true,
            opacity: 0.8,
            vertexColors: true
        });
        this.points = new THREE.Points(this.geometry, this.material);
        this.scene.add(this.points);

        this.positions = new Float32Array(maxParticles * 3);
        this.colors = new Float32Array(maxParticles * 3);
    }

    getParticle() {
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

    releaseParticle(particle) {
        if (this.pool.length < this.maxParticles) {
            this.pool.push(particle);
        }
    }

    addBlockBreakParticles(x, y, z, blockColor) {
        if (this.particles.length >= this.maxParticles) return;

        const particleCount = Math.min(8 + Math.floor(Math.random() * 8), this.maxParticles - this.particles.length);

        for (let i = 0; i < particleCount; i++) {
            const particle = this.getParticle();
            particle.position.x = x;
            particle.position.y = y;
            particle.position.z = z;
            particle.velocity.x = (Math.random() - 0.5) * 0.3;
            particle.velocity.y = Math.random() * 0.3;
            particle.velocity.z = (Math.random() - 0.5) * 0.3;
            particle.life = 1;
            particle.maxLife = 0.8 + Math.random() * 0.4;
            particle.color = blockColor;
            this.particles.push(particle);
        }
    }

    update() {
        const gravity = 0.01;

        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.velocity.y -= gravity;
            p.position.x += p.velocity.x;
            p.position.y += p.velocity.y;
            p.position.z += p.velocity.z;
            p.life -= 1 / 60;

            if (p.life <= 0) {
                this.releaseParticle(p);
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

        for (let i = 0; i < this.particles.length; i++) {
            const p = this.particles[i];
            this.positions[i * 3] = p.position.x;
            this.positions[i * 3 + 1] = p.position.y;
            this.positions[i * 3 + 2] = p.position.z;

            const color = new THREE.Color(p.color);
            this.colors[i * 3] = color.r * 255;
            this.colors[i * 3 + 1] = color.g * 255;
            this.colors[i * 3 + 2] = color.b * 255;
        }

        this.geometry.setAttribute('position', new THREE.BufferAttribute(this.positions.slice(0, this.particles.length * 3), 3));
        this.geometry.setAttribute('color', new THREE.BufferAttribute(this.colors.slice(0, this.particles.length * 3), 3, true));
    }
}
