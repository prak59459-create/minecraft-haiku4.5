class ParticleSystem {
    constructor(scene) {
        this.scene = scene;
        this.particles = [];
        this.particleGeometry = new THREE.BufferGeometry();
    }

    createDestructionEffect(x, y, z, blockColor) {
        const particleCount = 8;
        const radius = 0.5;

        for (let i = 0; i < particleCount; i++) {
            const angle = (Math.PI * 2 * i) / particleCount;
            const vx = Math.cos(angle) * 0.3;
            const vz = Math.sin(angle) * 0.3;
            const vy = Math.random() * 0.2 + 0.1;

            const particle = {
                position: new THREE.Vector3(x + 0.5, y + 0.5, z + 0.5),
                velocity: new THREE.Vector3(vx, vy, vz),
                life: 0.8,
                maxLife: 0.8,
                size: Math.random() * 0.2 + 0.1,
                color: new THREE.Color(blockColor)
            };

            this.particles.push(particle);
        }
    }

    update(deltaTime) {
        const dt = deltaTime / 1000;

        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];

            // Apply gravity
            p.velocity.y -= 0.3 * dt;

            // Update position
            p.position.addScaledVector(p.velocity, dt);

            // Decay life
            p.life -= dt;

            // Remove dead particles
            if (p.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }

    render(camera) {
        if (this.particles.length === 0) return;

        // Create geometry for particles
        const positions = [];
        const colors = [];
        const sizes = [];

        for (const p of this.particles) {
            positions.push(p.position.x, p.position.y, p.position.z);

            const alpha = p.life / p.maxLife;
            colors.push(p.color.r, p.color.g, p.color.b, alpha);
            sizes.push(p.size * (alpha * 0.5 + 0.5));
        }

        // This would require custom shader implementation
        // For now, particles are tracked but visual rendering would need shader updates
    }
}
