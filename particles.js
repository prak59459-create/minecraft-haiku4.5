export class ParticleSystem {
    constructor(scene) {
        this.scene = scene;
        this.particles = [];
        this.particlePool = [];
        this.maxParticles = 512;
        this.activeCount = 0;
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
        this.dirtyFlag = false;
    }

    addBlockBreakParticles(x, y, z, blockColor) {
        const particleCount = Math.min(8 + Math.floor(Math.random() * 8), this.maxParticles - this.activeCount);
        const color = new THREE.Color(blockColor);

        for (let i = 0; i < particleCount; i++) {
            let particle = this.particlePool.pop();
            if (!particle) {
                particle = { position: {}, velocity: {} };
            }
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
            this.activeCount++;
        }
        this.dirtyFlag = true;
    }

    update() {
        const gravity = 0.01;
        let writeIndex = 0;

        for (let i = 0; i < this.particles.length; i++) {
            const p = this.particles[i];
            p.velocity.y -= gravity;
            p.position.x += p.velocity.x;
            p.position.y += p.velocity.y;
            p.position.z += p.velocity.z;
            p.life -= 1 / 60;

            if (p.life > 0) {
                this.particles[writeIndex++] = p;
            } else {
                this.particlePool.push(p);
                this.dirtyFlag = true;
            }
        }
        this.activeCount = writeIndex;
        this.particles.length = writeIndex;

        if (this.dirtyFlag) {
            this.updateGeometry();
            this.dirtyFlag = false;
        }
    }

    updateGeometry() {
        if (this.activeCount === 0) {
            this.geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array([]), 3));
            this.geometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array([]), 3));
            return;
        }

        const positions = new Float32Array(this.activeCount * 3);
        const colors = new Float32Array(this.activeCount * 3);

        for (let i = 0; i < this.activeCount; i++) {
            const p = this.particles[i];
            positions[i * 3] = p.position.x;
            positions[i * 3 + 1] = p.position.y;
            positions[i * 3 + 2] = p.position.z;

            const alpha = p.life / p.maxLife;
            colors[i * 3] = p.r * alpha;
            colors[i * 3 + 1] = p.g * alpha;
            colors[i * 3 + 2] = p.b * alpha;
        }

        this.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        this.geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    }
}
