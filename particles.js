export class ParticleSystem {
    constructor(scene) {
        this.scene = scene;
        this.particles = [];
        this.particlePool = [];
        this.maxParticles = 2000;
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
        this.positionBuffer = new Float32Array(this.maxParticles * 3);
        this.colorBuffer = new Uint8Array(this.maxParticles * 3);
        this.lastGeometryUpdate = -1;
    }

    getParticle() {
        if (this.particlePool.length > 0) {
            return this.particlePool.pop();
        }
        return {
            position: { x: 0, y: 0, z: 0 },
            velocity: { x: 0, y: 0, z: 0 },
            life: 1,
            maxLife: 1,
            color: 0xFFFFFF
        };
    }

    releaseParticle(particle) {
        if (this.particlePool.length < this.maxParticles) {
            this.particlePool.push(particle);
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
        let activeCount = 0;

        for (let i = 0; i < this.particles.length; i++) {
            const p = this.particles[i];
            p.velocity.y -= gravity;
            p.position.x += p.velocity.x;
            p.position.y += p.velocity.y;
            p.position.z += p.velocity.z;
            p.life -= 1 / 60;

            if (p.life > 0) {
                this.particles[activeCount] = p;
                activeCount++;
            } else {
                this.releaseParticle(p);
            }
        }

        this.particles.length = activeCount;
        if (activeCount > 0) {
            this.updateGeometry();
        } else if (this.lastGeometryUpdate >= 0) {
            this.geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array([]), 3));
            this.geometry.setAttribute('color', new THREE.BufferAttribute(new Uint8Array([]), 3));
            this.lastGeometryUpdate = -1;
        }
    }

    updateGeometry() {
        const count = this.particles.length;
        if (count === 0) return;

        for (let i = 0; i < count; i++) {
            const p = this.particles[i];
            const idx = i * 3;
            this.positionBuffer[idx] = p.position.x;
            this.positionBuffer[idx + 1] = p.position.y;
            this.positionBuffer[idx + 2] = p.position.z;

            const color = new THREE.Color(p.color);
            const alpha = p.life / p.maxLife;
            this.colorBuffer[idx] = Math.floor(color.r * 255 * alpha);
            this.colorBuffer[idx + 1] = Math.floor(color.g * 255 * alpha);
            this.colorBuffer[idx + 2] = Math.floor(color.b * 255 * alpha);
        }

        this.geometry.setAttribute('position', new THREE.BufferAttribute(this.positionBuffer.slice(0, count * 3), 3));
        this.geometry.setAttribute('color', new THREE.BufferAttribute(this.colorBuffer.slice(0, count * 3), 3, true));
        this.lastGeometryUpdate = count;
    }
}
