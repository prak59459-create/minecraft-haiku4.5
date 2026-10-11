export class ParticleSystem {
    constructor(scene) {
        this.scene = scene;
        this.particles = [];
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
        if (this.particles.length >= this.maxParticles) return;

        const particleCount = Math.min(8 + Math.floor(Math.random() * 8), this.maxParticles - this.particles.length);
        const color = new THREE.Color(blockColor);

        for (let i = 0; i < particleCount; i++) {
            const particle = {
                x, y, z,
                vx: (Math.random() - 0.5) * 0.3,
                vy: Math.random() * 0.3,
                vz: (Math.random() - 0.5) * 0.3,
                life: 1,
                maxLife: 0.8 + Math.random() * 0.4,
                r: color.r,
                g: color.g,
                b: color.b
            };
            this.particles.push(particle);
        }
    }

    update() {
        const gravity = 0.01;
        let j = 0;

        for (let i = 0; i < this.particles.length; i++) {
            const p = this.particles[i];
            p.vy -= gravity;
            p.x += p.vx;
            p.y += p.vy;
            p.z += p.vz;
            p.life -= 1 / 60;

            if (p.life > 0) {
                this.particles[j++] = p;
            }
        }

        this.particles.length = j;
        this.updateGeometry();
    }

    updateGeometry() {
        if (this.particles.length === 0) {
            this.geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(0), 3));
            this.geometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array(0), 3));
            return;
        }

        for (let i = 0; i < this.particles.length; i++) {
            const p = this.particles[i];
            this.positions[i * 3] = p.x;
            this.positions[i * 3 + 1] = p.y;
            this.positions[i * 3 + 2] = p.z;

            const alpha = p.life / p.maxLife;
            this.colors[i * 3] = p.r * alpha;
            this.colors[i * 3 + 1] = p.g * alpha;
            this.colors[i * 3 + 2] = p.b * alpha;
        }

        this.geometry.setAttribute('position', new THREE.BufferAttribute(this.positions.slice(0, this.particles.length * 3), 3));
        this.geometry.setAttribute('color', new THREE.BufferAttribute(this.colors.slice(0, this.particles.length * 3), 3));
    }
}
