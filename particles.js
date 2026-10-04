class ParticleSystem {
    constructor(scene) {
        this.scene = scene;
        this.particles = [];
        this.geometry = new THREE.BufferGeometry();
        this.material = new THREE.PointsMaterial({
            size: 0.3,
            transparent: true,
            vertexColors: true
        });
        this.mesh = new THREE.Points(this.geometry, this.material);
        this.scene.add(this.mesh);
    }

    addParticle(position, velocity, life, color) {
        this.particles.push({
            position: position.clone(),
            velocity: velocity.clone(),
            life: life,
            maxLife: life,
            color: new THREE.Color(color)
        });
    }

    update() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.life -= 0.016;
            p.velocity.y -= 0.01;
            p.position.add(p.velocity);

            if (p.life <= 0) {
                this.particles.splice(i, 1);
            }
        }

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

            const alpha = p.life / p.maxLife;
            colors[i * 3] = p.color.r * alpha;
            colors[i * 3 + 1] = p.color.g * alpha;
            colors[i * 3 + 2] = p.color.b * alpha;
        }

        this.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        this.geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    }
}
