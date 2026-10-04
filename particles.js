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
            opacity: 0.9,
            vertexColors: true
        });
        this.points = new THREE.Points(this.geometry, this.material);
        this.scene.add(this.points);

        this.positionArray = new Float32Array(this.maxParticles * 3);
        this.colorArray = new Float32Array(this.maxParticles * 3);
    }

    addBlockBreakParticles(x, y, z, blockColor) {
        if (this.particles.length >= this.maxParticles) return;

        const particleCount = Math.min(12, this.maxParticles - this.particles.length);

        for (let i = 0; i < particleCount; i++) {
            const particle = {
                px: x + (Math.random() - 0.5) * 0.2,
                py: y + (Math.random() - 0.5) * 0.2,
                pz: z + (Math.random() - 0.5) * 0.2,
                vx: (Math.random() - 0.5) * 0.2,
                vy: Math.random() * 0.25,
                vz: (Math.random() - 0.5) * 0.2,
                life: 1,
                maxLife: 0.6 + Math.random() * 0.4,
                color: blockColor
            };
            this.particles.push(particle);
        }
    }

    update() {
        const gravity = 0.01;
        let count = 0;

        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.vy -= gravity;
            p.px += p.vx;
            p.py += p.vy;
            p.pz += p.vz;
            p.life -= 1 / 60;

            if (p.life <= 0) {
                this.particles.splice(i, 1);
            } else {
                count++;
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

        const particleCount = this.particles.length;

        for (let i = 0; i < particleCount; i++) {
            const p = this.particles[i];
            this.positionArray[i * 3] = p.px;
            this.positionArray[i * 3 + 1] = p.py;
            this.positionArray[i * 3 + 2] = p.pz;

            const color = new THREE.Color(p.color);
            const alpha = p.life / p.maxLife;
            this.colorArray[i * 3] = color.r;
            this.colorArray[i * 3 + 1] = color.g;
            this.colorArray[i * 3 + 2] = color.b;
        }

        this.geometry.setAttribute('position', new THREE.BufferAttribute(this.positionArray.slice(0, particleCount * 3), 3));
        this.geometry.setAttribute('color', new THREE.BufferAttribute(this.colorArray.slice(0, particleCount * 3), 3));
    }
}
