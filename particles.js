export class ParticleSystem {
    constructor(scene) {
        this.scene = scene;
        this.particles = [];
        this.pool = [];
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
        this.MAX_PARTICLES = 2000;
        this.positionData = new Float32Array(this.MAX_PARTICLES * 3);
        this.colorData = new Float32Array(this.MAX_PARTICLES * 3);
    }

    createParticle() {
        if (this.pool.length > 0) {
            return this.pool.pop();
        }
        return { position: {}, velocity: {} };
    }

    recycleParticle(p) {
        if (this.pool.length < this.MAX_PARTICLES) {
            this.pool.push(p);
        }
    }

    addBlockBreakParticles(x, y, z, blockColor) {
        if (this.particles.length >= this.MAX_PARTICLES) return;

        const particleCount = Math.min(8, this.MAX_PARTICLES - this.particles.length);
        const r = (blockColor >> 16) & 255;
        const g = (blockColor >> 8) & 255;
        const b = blockColor & 255;

        for (let i = 0; i < particleCount; i++) {
            const particle = this.createParticle();
            particle.position.x = x;
            particle.position.y = y;
            particle.position.z = z;
            particle.velocity.x = (Math.random() - 0.5) * 0.3;
            particle.velocity.y = Math.random() * 0.3;
            particle.velocity.z = (Math.random() - 0.5) * 0.3;
            particle.life = 1;
            particle.maxLife = 0.8 + Math.random() * 0.4;
            particle.r = r;
            particle.g = g;
            particle.b = b;
            this.particles.push(particle);
        }
    }

    update() {
        const gravity = 0.01;
        let activeCount = 0;

        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.velocity.y -= gravity;
            p.position.x += p.velocity.x;
            p.position.y += p.velocity.y;
            p.position.z += p.velocity.z;
            p.life -= 1 / 60;

            if (p.life <= 0) {
                this.recycleParticle(this.particles[i]);
                this.particles.splice(i, 1);
            } else {
                activeCount++;
            }
        }

        this.updateGeometry(activeCount);
    }

    updateGeometry(activeCount) {
        if (activeCount === 0) {
            this.geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(0), 3));
            this.geometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array(0), 3));
            return;
        }

        for (let i = 0; i < this.particles.length; i++) {
            const p = this.particles[i];
            const idx = i * 3;
            this.positionData[idx] = p.position.x;
            this.positionData[idx + 1] = p.position.y;
            this.positionData[idx + 2] = p.position.z;

            const alpha = p.life / p.maxLife;
            this.colorData[idx] = p.r / 255 * alpha;
            this.colorData[idx + 1] = p.g / 255 * alpha;
            this.colorData[idx + 2] = p.b / 255 * alpha;
        }

        this.geometry.setAttribute('position', new THREE.BufferAttribute(this.positionData.slice(0, this.particles.length * 3), 3));
        this.geometry.setAttribute('color', new THREE.BufferAttribute(this.colorData.slice(0, this.particles.length * 3), 3));
    }
}
