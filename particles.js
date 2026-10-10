export class ParticleSystem {
    constructor(scene) {
        this.scene = scene;
        this.particles = [];
        this.maxParticles = 2000;
        this.geometry = new THREE.BufferGeometry();
        this.material = new THREE.PointsMaterial({
            size: 0.2,
            sizeAttenuation: true,
            vertexColors: true,
            transparent: true
        });
        this.points = new THREE.Points(this.geometry, this.material);
        this.scene.add(this.points);
    }

    addBlockBreakParticles(x, y, z, blockColor) {
        const particleCount = 8 + Math.floor(Math.random() * 6);
        if (this.particles.length >= this.maxParticles) return;

        for (let i = 0; i < particleCount && this.particles.length < this.maxParticles; i++) {
            this.particles.push({
                x, y, z,
                vx: (Math.random() - 0.5) * 0.3,
                vy: Math.random() * 0.3,
                vz: (Math.random() - 0.5) * 0.3,
                life: 1,
                maxLife: 0.8 + Math.random() * 0.4,
                color: blockColor
            });
        }
    }

    update() {
        const gravity = 0.01;
        const frameDecay = 1 / 60;

        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.vy -= gravity;
            p.x += p.vx;
            p.y += p.vy;
            p.z += p.vz;
            p.life -= frameDecay;

            if (p.life <= 0) {
                this.particles.splice(i, 1);
            }
        }

        this.updateGeometry();
    }

    updateGeometry() {
        const count = this.particles.length;
        if (count === 0) {
            this.geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array([]), 3));
            this.geometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array([]), 3));
            return;
        }

        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 4);

        for (let i = 0; i < count; i++) {
            const p = this.particles[i];
            positions[i * 3] = p.x;
            positions[i * 3 + 1] = p.y;
            positions[i * 3 + 2] = p.z;

            const color = new THREE.Color(p.color);
            const alpha = p.life / p.maxLife;
            colors[i * 4] = color.r;
            colors[i * 4 + 1] = color.g;
            colors[i * 4 + 2] = color.b;
            colors[i * 4 + 3] = alpha;
        }

        this.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        this.geometry.setAttribute('color', new THREE.BufferAttribute(colors, 4));
    }
}
