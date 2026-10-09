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
            fog: true
        });
        this.points = new THREE.Points(this.geometry, this.material);
        this.scene.add(this.points);
    }

    addBlockBreakParticles(x, y, z, blockColor) {
        if (this.particles.length > this.maxParticles) return;

        const particleCount = 10 + Math.floor(Math.random() * 10);

        for (let i = 0; i < particleCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const velocity = Math.random() * 0.4;

            const particle = {
                position: { x, y, z },
                velocity: {
                    x: Math.cos(angle) * velocity,
                    y: Math.random() * 0.4,
                    z: Math.sin(angle) * velocity
                },
                life: 1,
                maxLife: 0.6 + Math.random() * 0.6,
                color: blockColor,
                size: 0.15 + Math.random() * 0.2
            };
            this.particles.push(particle);
        }
    }

    addDustParticles(x, y, z, color, count = 5) {
        if (this.particles.length > this.maxParticles) return;

        for (let i = 0; i < count; i++) {
            const particle = {
                position: { x, y, z },
                velocity: {
                    x: (Math.random() - 0.5) * 0.2,
                    y: Math.random() * 0.1,
                    z: (Math.random() - 0.5) * 0.2
                },
                life: 1,
                maxLife: 0.4 + Math.random() * 0.3,
                color: color,
                size: 0.1 + Math.random() * 0.15
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
            this.geometry.setAttribute('size', new THREE.BufferAttribute(new Float32Array([]), 1));
            return;
        }

        const positions = new Float32Array(this.particles.length * 3);
        const colors = new Float32Array(this.particles.length * 3);
        const sizes = new Float32Array(this.particles.length);

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

            sizes[i] = (p.size || 0.2) * (alpha * 0.8 + 0.2);
        }

        this.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        this.geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        this.geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        this.material.opacity = 0.9;
    }
}
