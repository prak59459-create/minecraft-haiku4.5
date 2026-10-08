export class ParticleSystem {
    constructor(scene, maxParticles = 2000) {
        this.scene = scene;
        this.particles = [];
        this.maxParticles = maxParticles;
        this.activeParticles = 0;
        this.geometry = new THREE.BufferGeometry();
        this.material = new THREE.PointsMaterial({
            size: 0.2,
            sizeAttenuation: true,
            transparent: true,
            opacity: 0.8
        });
        this.points = new THREE.Points(this.geometry, this.material);
        this.scene.add(this.points);
        this.positions = new Float32Array(maxParticles * 3);
        this.colors = new Float32Array(maxParticles * 3);
    }

    addBlockBreakParticles(x, y, z, blockColor) {
        const particleCount = Math.min(16, Math.max(8, this.maxParticles - this.activeParticles));

        for (let i = 0; i < particleCount; i++) {
            if (this.activeParticles >= this.maxParticles) break;
            const particle = {
                position: { x, y, z },
                velocity: {
                    x: (Math.random() - 0.5) * 0.3,
                    y: Math.random() * 0.3,
                    z: (Math.random() - 0.5) * 0.3
                },
                life: 1,
                maxLife: 0.8 + Math.random() * 0.4,
                color: blockColor
            };
            this.particles.push(particle);
            this.activeParticles++;
        }
    }

    update() {
        const gravity = 0.01;
        let activeCount = 0;

        for (let i = 0; i < this.particles.length; i++) {
            const p = this.particles[i];
            if (!p) continue;

            p.velocity.y -= gravity;
            p.position.x += p.velocity.x;
            p.position.y += p.velocity.y;
            p.position.z += p.velocity.z;
            p.life -= 1 / 60;

            if (p.life <= 0) {
                this.particles[i] = null;
            } else {
                activeCount++;
            }
        }

        this.activeParticles = activeCount;
        this.updateGeometry();
    }

    updateGeometry() {
        if (this.activeParticles === 0) {
            this.geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array([]), 3));
            this.geometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array([]), 3));
            return;
        }

        let idx = 0;
        for (let i = 0; i < this.particles.length && idx < this.activeParticles; i++) {
            const p = this.particles[i];
            if (!p) continue;

            this.positions[idx * 3] = p.position.x;
            this.positions[idx * 3 + 1] = p.position.y;
            this.positions[idx * 3 + 2] = p.position.z;

            const color = new THREE.Color(p.color);
            this.colors[idx * 3] = color.r;
            this.colors[idx * 3 + 1] = color.g;
            this.colors[idx * 3 + 2] = color.b;
            idx++;
        }

        this.geometry.setAttribute('position', new THREE.BufferAttribute(this.positions.slice(0, this.activeParticles * 3), 3));
        this.geometry.setAttribute('color', new THREE.BufferAttribute(this.colors.slice(0, this.activeParticles * 3), 3));
    }
}
