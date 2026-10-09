export class ParticleSystem {
    constructor(scene) {
        this.scene = scene;
        this.particles = [];
        this.maxParticles = 2000;
        this.geometry = new THREE.BufferGeometry();
        this.material = new THREE.PointsMaterial({
            size: 0.15,
            sizeAttenuation: true,
            transparent: true,
            opacity: 0.85,
            fog: true
        });
        this.points = new THREE.Points(this.geometry, this.material);
        this.scene.add(this.points);
    }

    addBlockBreakParticles(x, y, z, blockColor) {
        if (this.particles.length >= this.maxParticles) return;

        const particleCount = Math.min(12, 8 + Math.floor(Math.random() * 8));

        for (let i = 0; i < particleCount; i++) {
            if (this.particles.length >= this.maxParticles) break;

            const angle = Math.random() * Math.PI * 2;
            const speed = 0.15 + Math.random() * 0.2;

            const particle = {
                px: x, py: y, pz: z,
                vx: Math.cos(angle) * speed,
                vy: Math.random() * 0.35,
                vz: Math.sin(angle) * speed,
                life: 1,
                maxLife: 0.7 + Math.random() * 0.5,
                color: blockColor
            };
            this.particles.push(particle);
        }
    }

    update() {
        const gravity = 0.015;
        const friction = 0.98;

        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.vy -= gravity;
            p.vx *= friction;
            p.vz *= friction;
            p.px += p.vx;
            p.py += p.vy;
            p.pz += p.vz;
            p.life -= 1 / 60;

            if (p.life <= 0) {
                this.particles.splice(i, 1);
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
            positions[i * 3] = p.px;
            positions[i * 3 + 1] = p.py;
            positions[i * 3 + 2] = p.pz;

            const color = new THREE.Color(p.color);
            colors[i * 3] = color.r;
            colors[i * 3 + 1] = color.g;
            colors[i * 3 + 2] = color.b;
        }

        this.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        this.geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    }
}
