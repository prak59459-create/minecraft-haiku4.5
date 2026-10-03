class ParticleSystem {
    constructor(scene) {
        this.scene = scene;
        this.particles = [];
        this.particleGroup = new THREE.Group();
        this.scene.add(this.particleGroup);
    }

    createBlockBreakParticles(position, blockType) {
        const particleCount = 8;
        const color = BLOCK_COLORS[blockType] || 0xFFFFFF;

        for (let i = 0; i < particleCount; i++) {
            const angle = (Math.PI * 2 * i) / particleCount;
            const velocity = new THREE.Vector3(
                Math.cos(angle) * 0.15,
                Math.random() * 0.2 + 0.1,
                Math.sin(angle) * 0.15
            );

            this.createParticle(position.clone(), velocity, color, 0.5 + Math.random() * 0.3);
        }
    }

    createParticle(position, velocity, color, lifetime) {
        const geometry = new THREE.BoxGeometry(0.15, 0.15, 0.15);
        const material = new THREE.MeshBasicMaterial({
            color: color,
            wireframe: false
        });

        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.copy(position);
        this.particleGroup.add(mesh);

        const particle = {
            mesh: mesh,
            velocity: velocity.clone(),
            acceleration: new THREE.Vector3(0, -0.008, 0),
            lifetime: lifetime,
            maxLifetime: lifetime,
            age: 0
        };

        this.particles.push(particle);
    }

    update() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.age += 1 / 60;

            if (p.age >= p.maxLifetime) {
                this.particleGroup.remove(p.mesh);
                p.mesh.geometry.dispose();
                p.mesh.material.dispose();
                this.particles.splice(i, 1);
                continue;
            }

            p.velocity.add(p.acceleration);
            p.mesh.position.add(p.velocity);

            const alpha = 1 - (p.age / p.maxLifetime);
            p.mesh.material.opacity = alpha;
            p.mesh.rotation.x += Math.random() * 0.2;
            p.mesh.rotation.y += Math.random() * 0.2;
        }
    }

    dispose() {
        this.particles.forEach(p => {
            p.mesh.geometry.dispose();
            p.mesh.material.dispose();
        });
        this.particles = [];
        this.particleGroup.clear();
    }
}
