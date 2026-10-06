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
            opacity: 0.9,
            fog: false
        });
        this.points = new THREE.Points(this.geometry, this.material);
        this.points.frustumCulled = false;
        this.scene.add(this.points);

        this.positionArray = new Float32Array(this.maxParticles * 3);
        this.colorArray = new Uint8Array(this.maxParticles * 3);
    }

    addBlockBreakParticles(x, y, z, blockColor) {
        if (this.particles.length >= this.maxParticles) return;

        const particleCount = Math.min(12, this.maxParticles - this.particles.length);

        for (let i = 0; i < particleCount; i++) {
            const angle = (Math.PI * 2 * i) / particleCount;
            const speed = 0.15 + Math.random() * 0.15;

            const particle = {
                px: x,
                py: y,
                pz: z,
                vx: Math.cos(angle) * speed,
                vy: Math.random() * 0.3 + 0.1,
                vz: Math.sin(angle) * speed,
                life: 1,
                maxLife: 0.6 + Math.random() * 0.5,
                color: blockColor
            };
            this.particles.push(particle);
        }
    }

    update() {
        const gravity = 0.012;
        const damping = 0.98;

        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.vy -= gravity;
            p.vx *= damping;
            p.vz *= damping;

            p.px += p.vx;
            p.py += p.vy;
            p.pz += p.vz;
            p.life -= 1 / 60;

            if (p.life <= 0) {
                this.particles[i] = this.particles[this.particles.length - 1];
                this.particles.pop();
            }
        }

        this.updateGeometry();
    }

    updateGeometry() {
        if (this.particles.length === 0) {
            this.geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array([]), 3));
            this.geometry.setAttribute('color', new THREE.BufferAttribute(new Uint8Array([]), 3, true));
            return;
        }

        for (let i = 0; i < this.particles.length; i++) {
            const p = this.particles[i];
            this.positionArray[i * 3] = p.px;
            this.positionArray[i * 3 + 1] = p.py;
            this.positionArray[i * 3 + 2] = p.pz;

            const rgb = p.color;
            const alpha = p.life / p.maxLife;
            this.colorArray[i * 3] = Math.floor(rgb[0] * alpha);
            this.colorArray[i * 3 + 1] = Math.floor(rgb[1] * alpha);
            this.colorArray[i * 3 + 2] = Math.floor(rgb[2] * alpha);
        }

        this.geometry.setAttribute('position', new THREE.BufferAttribute(this.positionArray.slice(0, this.particles.length * 3), 3));
        this.geometry.setAttribute('color', new THREE.BufferAttribute(this.colorArray.slice(0, this.particles.length * 3), 3, true));
    }
}
