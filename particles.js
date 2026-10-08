export class ParticleSystem {
    constructor(scene, maxParticles = 2000) {
        this.scene = scene;
        this.particles = [];
        this.particlePool = [];
        this.maxParticles = maxParticles;
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

        this.positionArray = new Float32Array(maxParticles * 3);
        this.colorArray = new Float32Array(maxParticles * 3);
    }

    addBlockBreakParticles(x, y, z, blockColor) {
        if (this.particles.length >= this.maxParticles) return;

        const particleCount = Math.min(8 + Math.floor(Math.random() * 8),
                                       this.maxParticles - this.particles.length);
        const color = new THREE.Color(blockColor);

        for (let i = 0; i < particleCount; i++) {
            let particle = this.particlePool.pop();
            if (!particle) {
                particle = {};
            }

            particle.position = { x, y, z };
            particle.velocity = {
                x: (Math.random() - 0.5) * 0.3,
                y: Math.random() * 0.3,
                z: (Math.random() - 0.5) * 0.3
            };
            particle.life = 1;
            particle.maxLife = 0.8 + Math.random() * 0.4;
            particle.color = color.clone();

            this.particles.push(particle);
        }
    }

    update() {
        const gravity = 0.01;
        let activeCount = 0;

        for (let i = 0; i < this.particles.length; i++) {
            const p = this.particles[i];
            p.velocity.y -= gravity;
            p.position.x += p.velocity.x;
            p.position.y += p.velocity.y;
            p.position.z += p.velocity.z;
            p.life -= 1 / 60;

            if (p.life <= 0) {
                this.particlePool.push(this.particles[i]);
                this.particles.splice(i, 1);
                i--;
            } else {
                activeCount++;
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

        for (let i = 0; i < this.particles.length; i++) {
            const p = this.particles[i];
            this.positionArray[i * 3] = p.position.x;
            this.positionArray[i * 3 + 1] = p.position.y;
            this.positionArray[i * 3 + 2] = p.position.z;

            const alpha = p.life / p.maxLife;
            this.colorArray[i * 3] = p.color.r * alpha;
            this.colorArray[i * 3 + 1] = p.color.g * alpha;
            this.colorArray[i * 3 + 2] = p.color.b * alpha;
        }

        this.geometry.setAttribute('position', new THREE.BufferAttribute(this.positionArray.slice(0, this.particles.length * 3), 3));
        this.geometry.setAttribute('color', new THREE.BufferAttribute(this.colorArray.slice(0, this.particles.length * 3), 3));
    }
}
