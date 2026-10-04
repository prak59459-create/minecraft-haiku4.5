export class ParticleSystem {
    constructor(scene) {
        this.scene = scene;
        this.particles = [];
        this.geometry = new THREE.BufferGeometry();
        this.material = new THREE.PointsMaterial({
            size: 0.2,
            sizeAttenuation: true,
            transparent: true,
            opacity: 0.8
        });
        this.points = new THREE.Points(this.geometry, this.material);
        this.scene.add(this.points);
    }

    addBlockBreakParticles(x, y, z, blockColor) {
        const particleCount = 10 + Math.floor(Math.random() * 10);

        for (let i = 0; i < particleCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const velocity = 0.2 + Math.random() * 0.3;
            const particle = {
                position: { x, y, z },
                velocity: {
                    x: Math.cos(angle) * velocity,
                    y: 0.2 + Math.random() * 0.2,
                    z: Math.sin(angle) * velocity
                },
                life: 1,
                maxLife: 0.6 + Math.random() * 0.6,
                color: blockColor,
                friction: 0.98
            };
            this.particles.push(particle);
        }
    }

    addSprintParticles(x, y, z) {
        const particleCount = 2 + Math.floor(Math.random() * 3);
        const sprintColor = 0x999999;

        for (let i = 0; i < particleCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const particle = {
                position: { x, y, z },
                velocity: {
                    x: Math.cos(angle) * 0.1,
                    y: Math.random() * 0.05,
                    z: Math.sin(angle) * 0.1
                },
                life: 1,
                maxLife: 0.3 + Math.random() * 0.2,
                color: sprintColor,
                friction: 0.95
            };
            this.particles.push(particle);
        }
    }

    update() {
        const gravity = 0.01;

        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.velocity.y -= gravity;

            const friction = p.friction || 0.99;
            p.velocity.x *= friction;
            p.velocity.z *= friction;

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
