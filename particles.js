export class ParticleSystem {
    constructor(scene) {
        this.scene = scene;
        this.particles = [];
        this.particlePool = [];
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
        this.maxPoolSize = 512;
    }

    getParticleFromPool() {
        if (this.particlePool.length > 0) {
            return this.particlePool.pop();
        }
        return {
            position: { x: 0, y: 0, z: 0 },
            velocity: { x: 0, y: 0, z: 0 },
            life: 1,
            maxLife: 1,
            color: 0xffffff
        };
    }

    returnParticleToPool(particle) {
        if (this.particlePool.length < this.maxPoolSize) {
            this.particlePool.push(particle);
        }
    }

    addBlockBreakParticles(x, y, z, blockColor) {
        const particleCount = 6 + Math.floor(Math.random() * 6);

        for (let i = 0; i < particleCount; i++) {
            const particle = this.getParticleFromPool();
            particle.position.x = x;
            particle.position.y = y;
            particle.position.z = z;
            particle.velocity.x = (Math.random() - 0.5) * 0.3;
            particle.velocity.y = Math.random() * 0.3;
            particle.velocity.z = (Math.random() - 0.5) * 0.3;
            particle.life = 1;
            particle.maxLife = 0.7 + Math.random() * 0.3;
            particle.color = blockColor;
            this.particles.push(particle);
        }
    }

    update() {
        const gravity = 0.01;
        let liveCount = 0;

        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.velocity.y -= gravity;
            p.position.x += p.velocity.x;
            p.position.y += p.velocity.y;
            p.position.z += p.velocity.z;
            p.life -= 1 / 60;

            if (p.life <= 0) {
                this.returnParticleToPool(p);
                this.particles.splice(i, 1);
            } else {
                liveCount++;
            }
        }

        if (liveCount > 0) {
            this.updateGeometry();
        } else {
            this.geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array([]), 3));
            this.geometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array([]), 3));
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
    }

    cleanup() {
        this.particles = [];
        this.particlePool = [];
    }
}
