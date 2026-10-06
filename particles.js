export class ParticleSystem {
    constructor(scene) {
        this.scene = scene;
        this.particles = [];
        this.activeParticles = [];
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
        this.maxPoolSize = 2000;
    }

    createParticle(x, y, z, blockColor) {
        let particle = this.pool.length > 0 ? this.pool.pop() : {
            position: { x: 0, y: 0, z: 0 },
            velocity: { x: 0, y: 0, z: 0 },
            life: 0,
            maxLife: 0,
            color: 0xffffff
        };

        particle.position.x = x;
        particle.position.y = y;
        particle.position.z = z;
        particle.velocity.x = (Math.random() - 0.5) * 0.3;
        particle.velocity.y = Math.random() * 0.3;
        particle.velocity.z = (Math.random() - 0.5) * 0.3;
        particle.life = 1;
        particle.maxLife = 0.8 + Math.random() * 0.4;
        particle.color = blockColor;

        return particle;
    }

    addBlockBreakParticles(x, y, z, blockColor) {
        const particleCount = Math.min(16, 8 + Math.floor(Math.random() * 8));

        for (let i = 0; i < particleCount; i++) {
            const particle = this.createParticle(x, y, z, blockColor);
            this.particles.push(particle);
        }
    }

    update() {
        const gravity = 0.01;
        const deltaTime = 1 / 60;
        let activeCount = 0;

        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.velocity.y -= gravity;
            p.position.x += p.velocity.x;
            p.position.y += p.velocity.y;
            p.position.z += p.velocity.z;
            p.life -= deltaTime;

            if (p.life > 0) {
                this.activeParticles[activeCount++] = p;
            } else {
                if (this.pool.length < this.maxPoolSize) {
                    this.pool.push(p);
                }
                this.particles.splice(i, 1);
            }
        }

        this.activeParticles.length = activeCount;
        this.updateGeometry();
    }

    updateGeometry() {
        if (this.activeParticles.length === 0) {
            this.geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array([]), 3));
            this.geometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array([]), 3));
            return;
        }

        const positions = new Float32Array(this.activeParticles.length * 3);
        const colors = new Float32Array(this.activeParticles.length * 3);

        for (let i = 0; i < this.activeParticles.length; i++) {
            const p = this.activeParticles[i];
            positions[i * 3] = p.position.x;
            positions[i * 3 + 1] = p.position.y;
            positions[i * 3 + 2] = p.position.z;

            const color = new THREE.Color(p.color);
            const alpha = p.life / p.maxLife;
            color.multiplyScalar(alpha);

            colors[i * 3] = color.r;
            colors[i * 3 + 1] = color.g;
            colors[i * 3 + 2] = color.b;
        }

        this.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        this.geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    }
}
