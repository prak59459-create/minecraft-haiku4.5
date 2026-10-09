export class ParticleSystem {
    constructor(scene) {
        this.scene = scene;
        this.activeParticles = [];
        this.pool = [];
        this.maxPoolSize = 2048;
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
    }

    getParticle() {
        if (this.pool.length > 0) {
            return this.pool.pop();
        }
        return {
            position: { x: 0, y: 0, z: 0 },
            velocity: { x: 0, y: 0, z: 0 },
            life: 0,
            maxLife: 1,
            color: 0xffffff
        };
    }

    releaseParticle(particle) {
        if (this.pool.length < this.maxPoolSize) {
            this.pool.push(particle);
        }
    }

    addBlockBreakParticles(x, y, z, blockColor) {
        const particleCount = 6 + Math.floor(Math.random() * 6);

        for (let i = 0; i < particleCount; i++) {
            const particle = this.getParticle();
            particle.position.x = x + (Math.random() - 0.5) * 0.5;
            particle.position.y = y + (Math.random() - 0.5) * 0.5;
            particle.position.z = z + (Math.random() - 0.5) * 0.5;
            particle.velocity.x = (Math.random() - 0.5) * 0.25;
            particle.velocity.y = Math.random() * 0.25;
            particle.velocity.z = (Math.random() - 0.5) * 0.25;
            particle.life = 1;
            particle.maxLife = 0.6 + Math.random() * 0.4;
            particle.color = blockColor;
            this.activeParticles.push(particle);
        }
    }

    update() {
        const gravity = 0.012;

        for (let i = this.activeParticles.length - 1; i >= 0; i--) {
            const p = this.activeParticles[i];
            p.velocity.y -= gravity;
            p.position.x += p.velocity.x;
            p.position.y += p.velocity.y;
            p.position.z += p.velocity.z;
            p.life -= 1 / 60;

            if (p.life <= 0) {
                this.releaseParticle(p);
                this.activeParticles.splice(i, 1);
            }
        }

        this.updateGeometry();
    }

    updateGeometry() {
        if (this.activeParticles.length === 0) {
            this.geometry.dispose();
            this.geometry = new THREE.BufferGeometry();
            this.points.geometry = this.geometry;
            return;
        }

        const positions = new Float32Array(this.activeParticles.length * 3);
        const colors = new Float32Array(this.activeParticles.length * 3);

        for (let i = 0; i < this.activeParticles.length; i++) {
            const p = this.activeParticles[i];
            positions[i * 3] = p.position.x;
            positions[i * 3 + 1] = p.position.y;
            positions[i * 3 + 2] = p.position.z;

            const color = new THREE.Color(p.color);
            const alpha = p.life / p.maxLife;
            colors[i * 3] = color.r * alpha;
            colors[i * 3 + 1] = color.g * alpha;
            colors[i * 3 + 2] = color.b * alpha;
        }

        if (this.geometry.getAttribute('position')) {
            this.geometry.getAttribute('position').array = positions;
            this.geometry.getAttribute('position').needsUpdate = true;
            this.geometry.getAttribute('color').array = colors;
            this.geometry.getAttribute('color').needsUpdate = true;
        } else {
            this.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
            this.geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        }
    }
}
