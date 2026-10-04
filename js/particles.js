class ParticleSystem {
    constructor(scene) {
        this.scene = scene;
        this.particles = [];
        this.particleGroup = new THREE.Group();
        this.scene.add(this.particleGroup);
    }

    createBlockBreakParticles(position, blockType, count = 12) {
        const block = BLOCKS[blockType];
        if (!block) return;

        const baseColor = new THREE.Color(block.color || 0xcccccc);

        for (let i = 0; i < count; i++) {
            const size = 0.15 + Math.random() * 0.15;
            const geometry = new THREE.BoxGeometry(size, size, size);

            // Vary color slightly
            const colorVariation = baseColor.clone();
            colorVariation.multiplyScalar(0.7 + Math.random() * 0.3);

            const material = new THREE.MeshStandardMaterial({
                color: colorVariation,
                roughness: 0.7 + Math.random() * 0.3,
                metalness: 0
            });
            const mesh = new THREE.Mesh(geometry, material);

            mesh.position.copy(position).add(new THREE.Vector3(
                (Math.random() - 0.5) * 0.6,
                (Math.random() - 0.5) * 0.6,
                (Math.random() - 0.5) * 0.6
            ));

            const speed = 5 + Math.random() * 8;
            const angle = Math.random() * Math.PI * 2;
            const elevation = Math.random() * Math.PI;

            const velocity = new THREE.Vector3(
                Math.cos(angle) * Math.sin(elevation) * speed,
                Math.cos(elevation) * speed + 2,
                Math.sin(angle) * Math.sin(elevation) * speed
            );

            this.particleGroup.add(mesh);
            this.particles.push({
                mesh: mesh,
                velocity: velocity,
                life: 1.0,
                maxLife: 0.6 + Math.random() * 0.4,
                spin: new THREE.Vector3(
                    (Math.random() - 0.5) * 0.3,
                    (Math.random() - 0.5) * 0.3,
                    (Math.random() - 0.5) * 0.3
                )
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
            particle.velocity.multiplyScalar(0.98); // Air resistance

            particle.mesh.position.add(particle.velocity.clone().multiplyScalar(deltaTime));
            particle.mesh.rotation.x += particle.spin.x * deltaTime;
            particle.mesh.rotation.y += particle.spin.y * deltaTime;
            particle.mesh.rotation.z += particle.spin.z * deltaTime;

            const easedLife = Math.pow(particle.life, 2);
            particle.mesh.material.opacity = easedLife;
        }
    }
}
