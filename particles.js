export class ParticleSystem {
    constructor(scene) {
        this.scene = scene;
        this.particles = [];
        this.activeParticles = 0;
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
        this.preAllocateParticles();
    }

    preAllocateParticles() {
        for (let i = 0; i < 500; i++) {
            this.particlePool.push({
                position: { x: 0, y: 0, z: 0 },
                velocity: { x: 0, y: 0, z: 0 },
                life: 0,
                maxLife: 1,
                color: 0xFFFFFF,
                active: false
            });
        }
    }

    getParticle() {
        if (this.particlePool.length > 0) {
            return this.particlePool.pop();
        }
        return {
            position: { x: 0, y: 0, z: 0 },
            velocity: { x: 0, y: 0, z: 0 },
            life: 0,
            maxLife: 1,
            color: 0xFFFFFF,
            active: false
        };
    }

    returnParticle(particle) {
        if (this.particlePool.length < 500) {
            particle.active = false;
            this.particlePool.push(particle);
        }
    }

    addBlockBreakParticles(x, y, z, blockColor) {
        const particleCount = Math.min(16, 8 + Math.floor(Math.random() * 8));

        for (let i = 0; i < particleCount; i++) {
            if (this.activeParticles >= this.maxParticles) break;

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
            this.activeParticles++;
        }
    }

    update() {
        const gravity = 0.01;
        let writeIdx = 0;

        for (let i = 0; i < this.particles.length; i++) {
            const p = this.particles[i];
            p.velocity.y -= gravity;
            p.position.x += p.velocity.x;
            p.position.y += p.velocity.y;
            p.position.z += p.velocity.z;
            p.life -= 1 / 60;

            if (p.life <= 0) {
                this.returnParticle(p);
                this.activeParticles--;
            } else {
                this.particles[writeIdx++] = p;
            }
        }
        this.particles.length = writeIdx;
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
            colors[i * 3] = color.r;
            colors[i * 3 + 1] = color.g;
            colors[i * 3 + 2] = color.b;
        }

        this.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        this.geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    }
}
