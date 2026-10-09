export class ParticleSystem {
    constructor(scene) {
        this.scene = scene;
        this.particles = [];
        this.geometry = new THREE.BufferGeometry();
        this.material = new THREE.PointsMaterial({
            size: 0.15,
            sizeAttenuation: true,
            transparent: true,
            opacity: 0.9,
            vertexColors: true
        });
        this.points = new THREE.Points(this.geometry, this.material);
        this.scene.add(this.points);
        this.maxParticles = 5000;
    }

    addBlockBreakParticles(x, y, z, blockColor) {
        if (this.particles.length > this.maxParticles) return;

        const particleCount = 12 + Math.floor(Math.random() * 12);
        const color = new THREE.Color(blockColor);

        for (let i = 0; i < particleCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 0.2 + Math.random() * 0.2;

            const particle = {
                position: { x, y, z },
                velocity: {
                    x: Math.cos(angle) * speed,
                    y: Math.random() * 0.4 + 0.1,
                    z: Math.sin(angle) * speed
                },
                life: 1,
                maxLife: 0.6 + Math.random() * 0.6,
                color: { r: color.r, g: color.g, b: color.b },
                spin: (Math.random() - 0.5) * 0.2,
                size: 0.1 + Math.random() * 0.15
            };
            this.particles.push(particle);
        }
    }

    addDustParticles(x, y, z, particleCount = 4) {
        if (this.particles.length > this.maxParticles) return;

        const dustColor = new THREE.Color(0x888888);

        for (let i = 0; i < particleCount; i++) {
            const particle = {
                position: { x: x + (Math.random() - 0.5) * 0.5, y, z: z + (Math.random() - 0.5) * 0.5 },
                velocity: {
                    x: (Math.random() - 0.5) * 0.1,
                    y: Math.random() * 0.05,
                    z: (Math.random() - 0.5) * 0.1
                },
                life: 1,
                maxLife: 0.3 + Math.random() * 0.3,
                color: dustColor,
                spin: 0
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
            this.geometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array([]), 3));
            return;
        }

        const positions = new Float32Array(this.particles.length * 3);
        const colors = new Float32Array(this.particles.length * 3);

        for (let i = 0; i < this.particles.length; i++) {
            const p = this.particles[i];
            positions[i * 3] = p.position.x;
            positions[i * 3 + 1] = p.position.y;
            positions[i * 3 + 2] = p.position.z;

            const color = new THREE.Color(p.color);
            const alpha = p.life / p.maxLife;
            colors[i * 3] = color.r;
            colors[i * 3 + 1] = color.g;
            colors[i * 3 + 2] = color.b;
        }

        this.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        this.geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        this.material.opacity = 0.8;
    }
}
