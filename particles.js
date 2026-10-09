export class ParticleSystem {
    constructor(scene) {
        this.scene = scene;
        this.particles = [];
        this.geometry = new THREE.BufferGeometry();
        this.material = new THREE.PointsMaterial({
            size: 0.25,
            sizeAttenuation: true,
            transparent: true,
            opacity: 1,
            vertexColors: true,
            fog: true
        });
        this.points = new THREE.Points(this.geometry, this.material);
        this.points.frustumCulled = true;
        this.scene.add(this.points);
    }

    addBlockBreakParticles(x, y, z, blockColor) {
        const particleCount = 8 + Math.floor(Math.random() * 8);

        for (let i = 0; i < particleCount; i++) {
            const particle = {
                position: { x, y, z },
                velocity: {
                    x: (Math.random() - 0.5) * 0.3,
                    y: Math.random() * 0.3,
                    z: (Math.random() - 0.5) * 0.3
                },
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
            p.velocity.y -= gravity;
            p.position.x += p.velocity.x;
            p.position.y += p.velocity.y;
            p.position.z += p.velocity.z;
            p.life -= 1 / 60;

            if (p.life <= 0) {
                this.particles.splice(i, 1);
            }
        }

        this.updateGeometry();
    }

    updateGeometry() {
        if (this.particles.length === 0) {
            this.geometry.deleteAttribute('position');
            this.geometry.deleteAttribute('color');
            return;
        }

        const positions = new Float32Array(this.particles.length * 3);
        const colors = new Float32Array(this.particles.length * 4);

        for (let i = 0; i < this.particles.length; i++) {
            const p = this.particles[i];
            positions[i * 3] = p.position.x;
            positions[i * 3 + 1] = p.position.y;
            positions[i * 3 + 2] = p.position.z;

            const color = new THREE.Color(p.color);
            const alpha = p.life / p.maxLife;
            colors[i * 4] = color.r;
            colors[i * 4 + 1] = color.g;
            colors[i * 4 + 2] = color.b;
            colors[i * 4 + 3] = Math.pow(alpha, 2);
        }

        this.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        this.geometry.setAttribute('color', new THREE.BufferAttribute(colors, 4));
    }
}
