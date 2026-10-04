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
            vertexColors: true
        });
        this.points = new THREE.Points(this.geometry, this.material);
        this.scene.add(this.points);
        this.needsUpdate = false;
    }

    addBlockBreakParticles(x, y, z, blockColor) {
        const particleCount = Math.min(12, 8 + Math.floor(Math.random() * 8));

        for (let i = 0; i < particleCount && this.particles.length < this.maxParticles; i++) {
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
        this.needsUpdate = true;
    }

    update() {
        if (this.particles.length === 0) {
            if (this.needsUpdate) {
                this.geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array([]), 3));
                this.geometry.setAttribute('color', new THREE.BufferAttribute(new Uint8Array([]), 3, true));
                this.needsUpdate = false;
            }
            return;
        }

        const gravity = 0.01;
        let aliveCount = 0;

        for (let i = 0; i < this.particles.length; i++) {
            const p = this.particles[i];
            p.velocity.y -= gravity;
            p.position.x += p.velocity.x;
            p.position.y += p.velocity.y;
            p.position.z += p.velocity.z;
            p.life -= 1 / 60;

            if (p.life > 0) {
                this.particles[aliveCount++] = p;
            }
        }

        this.particles.length = aliveCount;
        this.updateGeometry();
    }

    updateGeometry() {
        const positions = new Float32Array(this.particles.length * 3);
        const colors = new Uint8Array(this.particles.length * 3);

        for (let i = 0; i < this.particles.length; i++) {
            const p = this.particles[i];
            positions[i * 3] = p.position.x;
            positions[i * 3 + 1] = p.position.y;
            positions[i * 3 + 2] = p.position.z;

            const color = new THREE.Color(p.color);
            const alpha = Math.max(0, Math.min(1, p.life / p.maxLife));
            colors[i * 3] = Math.floor(color.r * 255 * alpha);
            colors[i * 3 + 1] = Math.floor(color.g * 255 * alpha);
            colors[i * 3 + 2] = Math.floor(color.b * 255 * alpha);
        }

        this.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        this.geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3, true));
    }
}
