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
            opacity: 0.9,
            fog: false
        });
        this.points = new THREE.Points(this.geometry, this.material);
        this.scene.add(this.points);
        this.lastGeometryUpdate = 0;
    }

    addBlockBreakParticles(x, y, z, blockColor) {
        if (this.particles.length > this.maxParticles) return;

        const particleCount = 6 + Math.floor(Math.random() * 6);

        for (let i = 0; i < particleCount; i++) {
            const particle = {
                x: x + (Math.random() - 0.5) * 0.3,
                y: y + (Math.random() - 0.5) * 0.3,
                z: z + (Math.random() - 0.5) * 0.3,
                vx: (Math.random() - 0.5) * 0.3,
                vy: Math.random() * 0.25,
                vz: (Math.random() - 0.5) * 0.3,
                life: 1,
                maxLife: 0.7 + Math.random() * 0.3,
                color: blockColor
            };
            this.particles.push(particle);
        }
    }

    update() {
        const gravity = 0.012;
        let i = this.particles.length;

        while (i--) {
            const p = this.particles[i];
            p.vy -= gravity;
            p.x += p.vx;
            p.y += p.vy;
            p.z += p.vz;
            p.life -= 0.016;

            if (p.life <= 0) {
                this.particles.splice(i, 1);
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

        const positions = new Float32Array(this.particles.length * 3);
        const colors = new Uint8Array(this.particles.length * 3);

        for (let i = 0; i < this.particles.length; i++) {
            const p = this.particles[i];
            positions[i * 3] = p.x;
            positions[i * 3 + 1] = p.y;
            positions[i * 3 + 2] = p.z;

            const color = new THREE.Color(p.color);
            colors[i * 3] = Math.floor(color.r * 255);
            colors[i * 3 + 1] = Math.floor(color.g * 255);
            colors[i * 3 + 2] = Math.floor(color.b * 255);
        }

        this.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        this.geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3, true));
    }
}
