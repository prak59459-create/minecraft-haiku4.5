export class ParticleSystem {
    constructor(scene) {
        this.scene = scene;
        this.particles = [];
        this.maxParticles = 2000;
        this.positionArray = new Float32Array(this.maxParticles * 3);
        this.colorArray = new Float32Array(this.maxParticles * 3);

        this.geometry = new THREE.BufferGeometry();
        this.positionAttribute = new THREE.BufferAttribute(this.positionArray, 3);
        this.colorAttribute = new THREE.BufferAttribute(this.colorArray, 3);
        this.geometry.setAttribute('position', this.positionAttribute);
        this.geometry.setAttribute('color', this.colorAttribute);

        this.material = new THREE.PointsMaterial({
            size: 0.2,
            sizeAttenuation: true,
            transparent: true,
            opacity: 0.8,
            vertexColors: true
        });
        this.points = new THREE.Points(this.geometry, this.material);
        this.scene.add(this.points);
    }

    addBlockBreakParticles(x, y, z, blockColor) {
        const particleCount = Math.min(8 + Math.floor(Math.random() * 8), this.maxParticles - this.particles.length);

        for (let i = 0; i < particleCount; i++) {
            const particle = {
                px: x, py: y, pz: z,
                vx: (Math.random() - 0.5) * 0.3,
                vy: Math.random() * 0.3,
                vz: (Math.random() - 0.5) * 0.3,
                life: 1,
                maxLife: 0.8 + Math.random() * 0.4,
                color: blockColor
            };
            this.particles.push(particle);
        }
    }

    update() {
        const gravity = 0.01;

        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.vy -= gravity;
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
        const len = this.particles.length;
        this.positionAttribute.needsUpdate = len > 0;
        this.colorAttribute.needsUpdate = len > 0;

        for (let i = 0; i < len; i++) {
            const p = this.particles[i];
            this.positionArray[i * 3] = p.px;
            this.positionArray[i * 3 + 1] = p.py;
            this.positionArray[i * 3 + 2] = p.pz;

            const c = new THREE.Color(p.color);
            this.colorArray[i * 3] = c.r;
            this.colorArray[i * 3 + 1] = c.g;
            this.colorArray[i * 3 + 2] = c.b;
        }

        this.positionAttribute.count = len;
        this.colorAttribute.count = len;
    }
}
