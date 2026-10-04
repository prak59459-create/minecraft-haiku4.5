class ParticleSystem {
    constructor(scene) {
        this.scene = scene;
        this.particles = [];
        this.particleGroup = new THREE.Group();
        this.scene.add(this.particleGroup);
    }

    createBlockBreakParticles(position, blockType, count = 8) {
        const block = BLOCKS[blockType];
        if (!block) return;

        for (let i = 0; i < count; i++) {
            const geometry = new THREE.BoxGeometry(0.2, 0.2, 0.2);
            const material = new THREE.MeshStandardMaterial({
                color: block.color || 0xcccccc,
                roughness: 0.8,
                metalness: 0
            });
            const mesh = new THREE.Mesh(geometry, material);

            mesh.position.copy(position).add(new THREE.Vector3(
                (Math.random() - 0.5) * 0.5,
                (Math.random() - 0.5) * 0.5,
                (Math.random() - 0.5) * 0.5
            ));

            const velocity = new THREE.Vector3(
                (Math.random() - 0.5) * 8,
                (Math.random() - 0.5) * 8 + 3,
                (Math.random() - 0.5) * 8
            );

            this.particleGroup.add(mesh);
            this.particles.push({
                mesh: mesh,
                velocity: velocity,
                life: 1.0,
                maxLife: 0.8
            });
        }
    }

    update(deltaTime) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            particle.life -= deltaTime / particle.maxLife;

            if (particle.life <= 0) {
                this.particleGroup.remove(particle.mesh);
                particle.mesh.geometry.dispose();
                particle.mesh.material.dispose();
                this.particles.splice(i, 1);
                continue;
            }

            particle.velocity.y -= 9.8 * deltaTime;
            particle.mesh.position.add(particle.velocity.clone().multiplyScalar(deltaTime));
            particle.mesh.rotation.x += (Math.random() - 0.5) * 0.2;
            particle.mesh.rotation.y += (Math.random() - 0.5) * 0.2;
            particle.mesh.material.opacity = particle.life;
        }
    }
}
