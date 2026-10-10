export class ParticleSystem {
    constructor(scene) {
        this.scene = scene;
        this.particles = [];
        this.particlePool = [];
        this.maxParticles = 2000;
        this.activeCount = 0;

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

        this.positions = new Float32Array(this.maxParticles * 3);
        this.colors = new Uint8Array(this.maxParticles * 3);
        this.dirtyGeometry = false;
    }

    addBlockBreakParticles(x, y, z, blockColor) {
        const particleCount = Math.min(16, 8 + Math.floor(Math.random() * 8));
        const color = new THREE.Color(blockColor);
        const cr = Math.round(color.r * 255);
        const cg = Math.round(color.g * 255);
        const cb = Math.round(color.b * 255);

        for (let i = 0; i < particleCount; i++) {
            if (this.activeCount >= this.maxParticles) break;

            const particle = this.particlePool.pop() || {
                position: { x: 0, y: 0, z: 0 },
                velocity: { x: 0, y: 0, z: 0 },
                life: 1,
                maxLife: 1,
                color: { r: 0, g: 0, b: 0 }
            };

            particle.position.x = x;
            particle.position.y = y;
            particle.position.z = z;
            particle.velocity.x = (Math.random() - 0.5) * 0.3;
            particle.velocity.y = Math.random() * 0.3;
            particle.velocity.z = (Math.random() - 0.5) * 0.3;
            particle.life = 1;
            particle.maxLife = 0.8 + Math.random() * 0.4;
            particle.color.r = cr;
            particle.color.g = cg;
            particle.color.b = cb;

            this.particles.push(particle);
            this.activeCount++;
        }
        this.dirtyGeometry = true;
    }

    update() {
        const gravity = 0.01;
        let deadParticles = 0;

        for (let i = 0; i < this.particles.length; i++) {
            const p = this.particles[i];
            p.velocity.y -= gravity;
            p.position.x += p.velocity.x;
            p.position.y += p.velocity.y;
            p.position.z += p.velocity.z;
            p.life -= 1 / 60;

            if (p.life <= 0) {
                this.particlePool.push(p);
                deadParticles++;
            }
        }

        if (deadParticles > 0) {
            this.particles.splice(0, deadParticles);
            this.activeCount -= deadParticles;
            this.dirtyGeometry = true;
        }

        if (this.dirtyGeometry) {
            this.updateGeometry();
        }
    }

    updateGeometry() {
        if (this.activeCount === 0) {
            this.geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(0), 3));
            this.geometry.setAttribute('color', new THREE.BufferAttribute(new Uint8Array(0), 3, true));
            this.dirtyGeometry = false;
            return;
        }

        for (let i = 0; i < this.activeCount; i++) {
            const p = this.particles[i];
            this.positions[i * 3] = p.position.x;
            this.positions[i * 3 + 1] = p.position.y;
            this.positions[i * 3 + 2] = p.position.z;

            this.colors[i * 3] = p.color.r;
            this.colors[i * 3 + 1] = p.color.g;
            this.colors[i * 3 + 2] = p.color.b;
        }

        this.geometry.setAttribute('position', new THREE.BufferAttribute(this.positions.slice(0, this.activeCount * 3), 3));
        this.geometry.setAttribute('color', new THREE.BufferAttribute(this.colors.slice(0, this.activeCount * 3), 3, true));
        this.dirtyGeometry = false;
    }
}
