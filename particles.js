export class ParticleSystem {
    constructor(scene, maxParticles = 2000) {
        this.scene = scene;
        this.particles = [];
        this.maxParticles = maxParticles;
        this.particlePool = [];
        this.activeParticles = 0;

        this.geometry = new THREE.BufferGeometry();
        this.material = new THREE.PointsMaterial({
            size: 0.2,
            sizeAttenuation: true,
            transparent: true,
            opacity: 0.8,
            vertexColors: false
        });
        this.points = new THREE.Points(this.geometry, this.material);
        this.scene.add(this.points);

        this.positions = new Float32Array(maxParticles * 3);
        this.colors = new Float32Array(maxParticles * 3);
    }

    createParticle(x, y, z, blockColor) {
        let particle;
        if (this.particlePool.length > 0) {
            particle = this.particlePool.pop();
        } else {
            particle = {
                position: { x: 0, y: 0, z: 0 },
                velocity: { x: 0, y: 0, z: 0 },
                life: 0,
                maxLife: 0,
                color: 0
            };
        }

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
        const particleCount = Math.min(8 + Math.floor(Math.random() * 8), this.maxParticles - this.activeParticles);

        for (let i = 0; i < particleCount; i++) {
            const particle = this.createParticle(x, y, z, blockColor);
            this.particles.push(particle);
            this.activeParticles++;
        }
    }

    update() {
        const gravity = 0.01;
        let activeCount = 0;

        for (let i = 0; i < this.particles.length; i++) {
            const p = this.particles[i];
            if (p.life <= 0) continue;

            p.velocity.y -= gravity;
            p.position.x += p.velocity.x;
            p.position.y += p.velocity.y;
            p.position.z += p.velocity.z;
            p.life -= 1 / 60;

            if (p.life > 0) {
                activeCount++;
            } else {
                this.particlePool.push(p);
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

        let index = 0;
        const color = new THREE.Color();

        for (let i = 0; i < this.particles.length && index < this.activeParticles * 3; i++) {
            const p = this.particles[i];
            if (p.life <= 0) continue;

            this.positions[index] = p.position.x;
            this.positions[index + 1] = p.position.y;
            this.positions[index + 2] = p.position.z;

            color.setHex(p.color);
            const brightness = p.life / p.maxLife;
            this.colors[index] = color.r * brightness;
            this.colors[index + 1] = color.g * brightness;
            this.colors[index + 2] = color.b * brightness;

            index += 3;
        }

        this.geometry.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));
        this.geometry.setAttribute('color', new THREE.BufferAttribute(this.colors, 3));
    }
}
