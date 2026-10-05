export class ParticleSystem {
    constructor(scene) {
        this.scene = scene;
        this.particles = [];
        this.particlePool = [];
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
        this.positionsArray = null;
        this.colorsArray = null;
    }

    getParticle(x, y, z, color) {
        let particle = this.particlePool.pop();
        if (!particle) {
            particle = {
                position: { x: 0, y: 0, z: 0 },
                velocity: { x: 0, y: 0, z: 0 },
                life: 0,
                maxLife: 0,
                color: 0,
                active: true
            };
        }
        particle.position.x = x;
        particle.position.y = y;
        particle.position.z = z;
        particle.velocity.x = (Math.random() - 0.5) * 0.3;
        particle.velocity.y = Math.random() * 0.3;
        particle.velocity.z = (Math.random() - 0.5) * 0.3;
        particle.life = 1;
        particle.maxLife = 0.8 + Math.random() * 0.4;
        particle.color = color;
        particle.active = true;
        return particle;
    }

    addBlockBreakParticles(x, y, z, blockColor) {
        const particleCount = Math.min(8 + Math.floor(Math.random() * 8), this.maxParticles - this.particles.length);
        for (let i = 0; i < particleCount; i++) {
            const particle = this.getParticle(x, y, z, blockColor);
            this.particles.push(particle);
        }
    }

    update() {
        const gravity = 0.01;
        let activeCount = 0;

        for (let i = 0; i < this.particles.length; i++) {
            const p = this.particles[i];
            if (!p.active) continue;

            p.velocity.y -= gravity;
            p.position.x += p.velocity.x;
            p.position.y += p.velocity.y;
            p.position.z += p.velocity.z;
            p.life -= 1 / 60;

            if (p.life <= 0) {
                p.active = false;
                this.particlePool.push(p);
            } else {
                activeCount++;
            }
        }

        this.updateGeometry(activeCount);
    }

    updateGeometry(activeCount) {
        if (activeCount === 0) {
            this.geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(0), 3));
            this.geometry.setAttribute('color', new THREE.BufferAttribute(new Uint8Array(0), 3, true));
            return;
        }

        if (!this.positionsArray || this.positionsArray.length < activeCount * 3) {
            this.positionsArray = new Float32Array(Math.max(activeCount * 3, 100));
            this.colorsArray = new Uint8Array(Math.max(activeCount * 3, 100));
        }

        let idx = 0;
        for (let i = 0; i < this.particles.length; i++) {
            const p = this.particles[i];
            if (!p.active) continue;

            this.positionsArray[idx * 3] = p.position.x;
            this.positionsArray[idx * 3 + 1] = p.position.y;
            this.positionsArray[idx * 3 + 2] = p.position.z;

            const color = new THREE.Color(p.color);
            this.colorsArray[idx * 3] = Math.floor(color.r * 255);
            this.colorsArray[idx * 3 + 1] = Math.floor(color.g * 255);
            this.colorsArray[idx * 3 + 2] = Math.floor(color.b * 255);

            idx++;
        }

        this.geometry.setAttribute('position', new THREE.BufferAttribute(this.positionsArray.slice(0, activeCount * 3), 3));
        this.geometry.setAttribute('color', new THREE.BufferAttribute(this.colorsArray.slice(0, activeCount * 3), 3, true));
    }
}
