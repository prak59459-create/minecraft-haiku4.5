export class ParticleSystem {
    constructor(scene) {
        this.scene = scene;
        this.particles = [];
        this.pool = [];
        this.maxParticles = 512;
        this.geometry = new THREE.BufferGeometry();
        this.material = new THREE.PointsMaterial({
            size: 0.2,
            sizeAttenuation: true,
            transparent: true,
            opacity: 0.8
        });
        this.points = new THREE.Points(this.geometry, this.material);
        this.scene.add(this.points);
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
            color: 0xffffff,
            active: true
        };
    }

    returnParticle(p) {
        p.active = false;
        if (this.pool.length < this.maxParticles * 2) {
            this.pool.push(p);
        }
    }

    addBlockBreakParticles(x, y, z, blockColor) {
        if (this.particles.length >= this.maxParticles) return;

        const particleCount = Math.min(10 + Math.floor(Math.random() * 10), this.maxParticles - this.particles.length);
        const speedMultiplier = 0.25 + Math.random() * 0.15;

        for (let i = 0; i < particleCount; i++) {
            const particle = this.getParticle();
            particle.position.x = x + (Math.random() - 0.5) * 0.3;
            particle.position.y = y + (Math.random() - 0.5) * 0.3;
            particle.position.z = z + (Math.random() - 0.5) * 0.3;

            const angle = Math.random() * Math.PI * 2;
            const distance = 0.2 + Math.random() * 0.3;

            particle.velocity.x = Math.cos(angle) * distance * speedMultiplier;
            particle.velocity.y = 0.15 + Math.random() * 0.25;
            particle.velocity.z = Math.sin(angle) * distance * speedMultiplier;
            particle.life = 1;
            particle.maxLife = 0.6 + Math.random() * 0.6;
            particle.color = blockColor;
            particle.active = true;
            this.particles.push(particle);
        }
    }

    update() {
        const gravity = 0.01;
        let activeCount = 0;

        for (let i = 0; i < this.particles.length; i++) {
            const p = this.particles[i];
            if (!p.active) continue;

            p.velocity.y -= gravity;
            p.position.x += p.velocity.x;
            p.position.y += p.velocity.y;
            p.position.z += p.velocity.z;
            p.life -= 1 / 60;

            if (p.life <= 0) {
                this.returnParticle(p);
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

        const positions = new Float32Array(activeCount * 3);
        const colors = new Float32Array(activeCount * 3);
        let idx = 0;

        for (let i = 0; i < this.particles.length; i++) {
            const p = this.particles[i];
            if (!p.active) continue;

            positions[idx * 3] = p.position.x;
            positions[idx * 3 + 1] = p.position.y;
            positions[idx * 3 + 2] = p.position.z;

            const color = new THREE.Color(p.color);
            colors[idx * 3] = color.r;
            colors[idx * 3 + 1] = color.g;
            colors[idx * 3 + 2] = color.b;
            idx++;
        }

        this.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        this.geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    }
}
