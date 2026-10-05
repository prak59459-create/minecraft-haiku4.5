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

        this.positions = new Float32Array(this.maxParticles * 3);
        this.colors = new Float32Array(this.maxParticles * 3);
    }

    addBlockBreakParticles(x, y, z, blockColor) {
        const particleCount = Math.min(16, 8 + Math.floor(Math.random() * 8));
        const color = new THREE.Color(blockColor);

        for (let i = 0; i < particleCount; i++) {
            if (this.particles.length >= this.maxParticles) break;

            let particle = this.particlePool.length > 0 ? this.particlePool.pop() : {};

            particle.position = particle.position || {};
            particle.velocity = particle.velocity || {};

            particle.position.x = x;
            particle.position.y = y;
            particle.position.z = z;
            particle.velocity.x = (Math.random() - 0.5) * 0.3;
            particle.velocity.y = Math.random() * 0.3;
            particle.velocity.z = (Math.random() - 0.5) * 0.3;
            particle.life = 1;
            particle.maxLife = 0.8 + Math.random() * 0.4;
            particle.r = color.r;
            particle.g = color.g;
            particle.b = color.b;

            this.particles.push(particle);
        }
    }

    addBlockPlaceParticles(x, y, z, blockColor) {
        const particleCount = Math.min(8, 4 + Math.floor(Math.random() * 4));
        const color = new THREE.Color(blockColor);

        for (let i = 0; i < particleCount; i++) {
            if (this.particles.length >= this.maxParticles) break;

            let particle = this.particlePool.length > 0 ? this.particlePool.pop() : {};

            particle.position = particle.position || {};
            particle.velocity = particle.velocity || {};

            particle.position.x = x + (Math.random() - 0.5) * 0.5;
            particle.position.y = y + (Math.random() - 0.5) * 0.5;
            particle.position.z = z + (Math.random() - 0.5) * 0.5;
            particle.velocity.x = (Math.random() - 0.5) * 0.15;
            particle.velocity.y = Math.random() * 0.15;
            particle.velocity.z = (Math.random() - 0.5) * 0.15;
            particle.life = 1;
            particle.maxLife = 0.6 + Math.random() * 0.3;
            particle.r = color.r;
            particle.g = color.g;
            particle.b = color.b;

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
                this.particlePool.push(p);
                this.particles.splice(i, 1);
            } else {
                activeCount++;
            }
        }

        this.updateGeometry(activeCount);
    }

    updateGeometry(activeCount) {
        if (activeCount === 0) {
            this.geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array([]), 3));
            this.geometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array([]), 3));
            return;
        }

        for (let i = 0; i < activeCount; i++) {
            const p = this.particles[i];
            const idx = i * 3;
            this.positions[idx] = p.position.x;
            this.positions[idx + 1] = p.position.y;
            this.positions[idx + 2] = p.position.z;

            const alpha = p.life / p.maxLife;
            this.colors[idx] = p.r * alpha;
            this.colors[idx + 1] = p.g * alpha;
            this.colors[idx + 2] = p.b * alpha;
        }

        this.geometry.setAttribute('position', new THREE.BufferAttribute(this.positions.slice(0, activeCount * 3), 3));
        this.geometry.setAttribute('color', new THREE.BufferAttribute(this.colors.slice(0, activeCount * 3), 3));
    }
}
