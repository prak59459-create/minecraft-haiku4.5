export class ParticleSystem {
    constructor(scene) {
        this.scene = scene;
        this.particles = [];
        this.maxParticles = 2000;
        this.geometry = new THREE.BufferGeometry();
        this.material = new THREE.PointsMaterial({
            size: 0.25,
            sizeAttenuation: true,
            transparent: true,
            opacity: 1.0,
            vertexColors: true
        });
        this.points = new THREE.Points(this.geometry, this.material);
        this.scene.add(this.points);
        this.updateScheduled = false;
    }

    addBlockBreakParticles(x, y, z, blockColor) {
        if (this.particles.length >= this.maxParticles) return;

        const particleCount = Math.min(12, Math.floor(8 + Math.random() * 6));
        const timeToAdd = Math.min(this.maxParticles - this.particles.length, particleCount);

        for (let i = 0; i < timeToAdd; i++) {
            const angle = (Math.random() - 0.5) * Math.PI * 2;
            const speed = 0.2 + Math.random() * 0.2;

            const particle = {
                x, y, z,
                vx: Math.cos(angle) * speed,
                vy: Math.random() * 0.4,
                vz: Math.sin(angle) * speed,
                life: 1,
                maxLife: 0.6 + Math.random() * 0.4,
                color: blockColor
            };
            this.particles.push(particle);
        }

        this.updateScheduled = true;
    }

    update() {
        if (this.particles.length === 0) return;

        const gravity = 0.015;
        let deadCount = 0;

        for (let i = 0; i < this.particles.length; i++) {
            const p = this.particles[i];
            p.vy -= gravity;
            p.x += p.vx;
            p.y += p.vy;
            p.z += p.vz;
            p.life -= 1 / 60;

            if (p.life <= 0) {
                deadCount++;
            }
        }

        if (deadCount > 0) {
            this.particles = this.particles.filter(p => p.life > 0);
        }

        if (this.updateScheduled || deadCount > 0) {
            this.updateGeometry();
            this.updateScheduled = false;
        }
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
            positions[i * 3] = p.x;
            positions[i * 3 + 1] = p.y;
            positions[i * 3 + 2] = p.z;

            const color = new THREE.Color(p.color);
            const alpha = p.life / p.maxLife;
            colors[i * 3] = color.r * alpha;
            colors[i * 3 + 1] = color.g * alpha;
            colors[i * 3 + 2] = color.b * alpha;
        }

        this.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        this.geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    }
}
