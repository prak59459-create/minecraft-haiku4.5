export class ParticleSystem {
    constructor(scene) {
        this.scene = scene;
        this.particles = [];
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
        this.positions = new Float32Array(1024 * 3);
        this.colors = new Float32Array(1024 * 3);
        this.maxParticles = 1024;
    }

    addBlockBreakParticles(x, y, z, blockColor) {
        const particleCount = 6 + Math.floor(Math.random() * 6);
        if (this.particles.length + particleCount > this.maxParticles) return;

        const colorObj = new THREE.Color(blockColor);

        for (let i = 0; i < particleCount; i++) {
            const particle = {
                px: x, py: y, pz: z,
                vx: (Math.random() - 0.5) * 0.3,
                vy: Math.random() * 0.3,
                vz: (Math.random() - 0.5) * 0.3,
                life: 1,
                maxLife: 0.8 + Math.random() * 0.4,
                r: colorObj.r,
                g: colorObj.g,
                b: colorObj.b
            };
            this.particles.push(particle);
        }
    }

    update() {
        const gravity = 0.01;
        let particleIdx = 0;

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

        if (this.particles.length === 0) {
            this.geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(), 3));
            this.geometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array(), 3));
            return;
        }

        for (let i = 0; i < this.particles.length; i++) {
            const p = this.particles[i];
            const alpha = p.life / p.maxLife;

            this.positions[i * 3] = p.px;
            this.positions[i * 3 + 1] = p.py;
            this.positions[i * 3 + 2] = p.pz;

            this.colors[i * 3] = p.r * alpha;
            this.colors[i * 3 + 1] = p.g * alpha;
            this.colors[i * 3 + 2] = p.b * alpha;
        }

        const posAttr = this.geometry.getAttribute('position');
        const colAttr = this.geometry.getAttribute('color');

        if (!posAttr) {
            this.geometry.setAttribute('position', new THREE.BufferAttribute(this.positions.slice(0, this.particles.length * 3), 3));
            this.geometry.setAttribute('color', new THREE.BufferAttribute(this.colors.slice(0, this.particles.length * 3), 3));
        } else {
            posAttr.copyArray(this.positions.slice(0, this.particles.length * 3));
            posAttr.needsUpdate = true;
            colAttr.copyArray(this.colors.slice(0, this.particles.length * 3));
            colAttr.needsUpdate = true;
        }
    }
}
