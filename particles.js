export class ParticleSystem {
    constructor(scene, maxParticles = 2000) {
        this.scene = scene;
        this.particles = [];
        this.pool = [];
        this.maxParticles = maxParticles;
        this.geometry = new THREE.BufferGeometry();
        this.material = new THREE.PointsMaterial({
            size: 0.25,
            sizeAttenuation: true,
            transparent: true,
            opacity: 0.85,
            vertexColors: false
        });
        this.points = new THREE.Points(this.geometry, this.material);
        this.scene.add(this.points);
    }

    createParticle(x, y, z, blockColor) {
        let particle = this.pool.pop();
        if (!particle) {
            particle = {
                position: { x: 0, y: 0, z: 0 },
                velocity: { x: 0, y: 0, z: 0 },
                life: 1,
                maxLife: 1,
                color: 0
            };
        }

        particle.position.x = x;
        particle.position.y = y;
        particle.position.z = z;
        particle.velocity.x = (Math.random() - 0.5) * 0.4;
        particle.velocity.y = Math.random() * 0.4;
        particle.velocity.z = (Math.random() - 0.5) * 0.4;
        particle.life = 1;
        particle.maxLife = 0.7 + Math.random() * 0.5;
        particle.color = blockColor;

        return particle;
    }

    addBlockBreakParticles(x, y, z, blockColor) {
        const particleCount = Math.min(12, Math.floor(10 + Math.random() * 8));

        for (let i = 0; i < particleCount && this.particles.length < this.maxParticles; i++) {
            const particle = this.createParticle(x, y, z, blockColor);
            this.particles.push(particle);
        }
    }

    update() {
        const gravity = 0.012;

        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.velocity.y -= gravity;
            p.position.x += p.velocity.x;
            p.position.y += p.velocity.y;
            p.position.z += p.velocity.z;
            p.life -= 1 / 60;

            if (p.life <= 0) {
                this.pool.push(this.particles.splice(i, 1)[0]);
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
            const alpha = p.life / p.maxLife;
            colors[i * 3] = color.r;
            colors[i * 3 + 1] = color.g;
            colors[i * 3 + 2] = color.b;
        }

        this.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        this.geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        this.material.opacity = 0.8;
    }
}
