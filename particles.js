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
            vertexColors: false
        });
        this.points = new THREE.Points(this.geometry, this.material);
        this.scene.add(this.points);
        this.tempColor = new THREE.Color();
    }

    addBlockBreakParticles(x, y, z, blockColor) {
        const particleCount = Math.min(20, 12 + Math.floor(Math.random() * 12));

        for (let i = 0; i < particleCount; i++) {
            if (this.particles.length >= this.maxParticles) {
                this.particles.shift();
            }

            const angle = Math.random() * Math.PI * 2;
            const velocity = 0.2 + Math.random() * 0.3;

            const particle = {
                position: { x: x + 0.5, y: y + 0.5, z: z + 0.5 },
                velocity: {
                    x: Math.cos(angle) * velocity,
                    y: 0.15 + Math.random() * 0.25,
                    z: Math.sin(angle) * velocity
                },
                life: 1,
                maxLife: 0.6 + Math.random() * 0.5,
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
            this.geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array([]), 3));
            return;
        }

        const positions = new Float32Array(this.particles.length * 3);

        for (let i = 0; i < this.particles.length; i++) {
            const p = this.particles[i];
            positions[i * 3] = p.position.x;
            positions[i * 3 + 1] = p.position.y;
            positions[i * 3 + 2] = p.position.z;
        }

        this.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    }
}
