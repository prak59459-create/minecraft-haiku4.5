export class ParticleSystem {
    constructor(scene) {
        this.scene = scene;
        this.particles = [];
        this.activeParticles = 0;
        this.maxParticles = 2000;
        this.geometry = new THREE.BufferGeometry();
        this.material = new THREE.PointsMaterial({
            size: 0.2,
            sizeAttenuation: true,
            transparent: true,
            opacity: 0.8
        });
        this.points = new THREE.Points(this.geometry, this.material);
        this.scene.add(this.points);

        this.colorCache = new Map();
    }

    addBlockBreakParticles(x, y, z, blockColor) {
        const particleCount = Math.min(8 + Math.floor(Math.random() * 8), this.maxParticles - this.activeParticles);

        for (let i = 0; i < particleCount; i++) {
            if (this.activeParticles < this.particles.length) {
                const particle = this.particles[this.activeParticles];
                particle.position.x = x;
                particle.position.y = y;
                particle.position.z = z;
                particle.velocity.x = (Math.random() - 0.5) * 0.3;
                particle.velocity.y = Math.random() * 0.3;
                particle.velocity.z = (Math.random() - 0.5) * 0.3;
                particle.life = 1;
                particle.maxLife = 0.8 + Math.random() * 0.4;
                particle.color = blockColor;
            } else if (this.activeParticles < this.maxParticles) {
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
            this.activeParticles++;
        }
    }

    update() {
        const gravity = 0.01;
        let writeIdx = 0;

        for (let i = 0; i < this.activeParticles; i++) {
            const p = this.particles[i];
            p.velocity.y -= gravity;
            p.position.x += p.velocity.x;
            p.position.y += p.velocity.y;
            p.position.z += p.velocity.z;
            p.life -= 1 / 60;

            if (p.life > 0) {
                if (writeIdx !== i) {
                    const temp = this.particles[writeIdx];
                    this.particles[writeIdx] = p;
                    this.particles[i] = temp;
                }
                writeIdx++;
            }
        }

        this.activeParticles = writeIdx;
        this.updateGeometry();
    }

    updateGeometry() {
        if (this.activeParticles === 0) {
            this.geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array([]), 3));
            this.geometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array([]), 3));
            return;
        }

        const positions = new Float32Array(this.activeParticles * 3);
        const colors = new Float32Array(this.activeParticles * 3);

        for (let i = 0; i < this.activeParticles; i++) {
            const p = this.particles[i];
            positions[i * 3] = p.position.x;
            positions[i * 3 + 1] = p.position.y;
            positions[i * 3 + 2] = p.position.z;

            let color = this.colorCache.get(p.color);
            if (!color) {
                color = new THREE.Color(p.color);
                this.colorCache.set(p.color, color);
            }
            colors[i * 3] = color.r;
            colors[i * 3 + 1] = color.g;
            colors[i * 3 + 2] = color.b;
        }

        this.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        this.geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    }
}
