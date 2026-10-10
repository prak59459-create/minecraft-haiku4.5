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
            opacity: 0.8
        });
        this.points = new THREE.Points(this.geometry, this.material);
        this.scene.add(this.points);
        this.geometryDirty = false;
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
            color: 0xffffff,
            active: true
        };
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
            particle.active = true;
            this.particles.push(particle);
            this.geometryDirty = true;
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
                p.active = false;
                this.particlePool.push(p);
                this.geometryDirty = true;
            } else {
                activeCount++;
            }
        }

        if (this.geometryDirty) {
            this.updateGeometry();
            this.geometryDirty = false;
        }
    }

    updateGeometry() {
        const activeParticles = this.particles.filter(p => p.active);

        if (activeParticles.length === 0) {
            this.geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array([]), 3));
            this.geometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array([]), 3));
            return;
        }

        const positions = new Float32Array(activeParticles.length * 3);
        const colors = new Float32Array(activeParticles.length * 3);

        for (let i = 0; i < activeParticles.length; i++) {
            const p = activeParticles[i];
            positions[i * 3] = p.position.x;
            positions[i * 3 + 1] = p.position.y;
            positions[i * 3 + 2] = p.position.z;

            const color = new THREE.Color(p.color);
            colors[i * 3] = color.r;
            colors[i * 3 + 1] = color.g;
            colors[i * 3 + 2] = color.b;
        }

        this.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        this.geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    }
}
