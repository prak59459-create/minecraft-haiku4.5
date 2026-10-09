export class ParticleSystem {
    constructor(scene) {
        this.scene = scene;
        this.particles = [];
        this.particlePool = [];
        this.maxParticles = 512;

        this.geometry = new THREE.BufferGeometry();
        this.material = new THREE.PointsMaterial({
            size: 0.2,
            sizeAttenuation: true,
            transparent: true,
            opacity: 0.8,
            vertexColors: true
        });
        this.points = new THREE.Points(this.geometry, this.material);
        this.points.frustumCulled = false;
        this.scene.add(this.points);

        this.positionArray = new Float32Array(this.maxParticles * 3);
        this.colorArray = new Float32Array(this.maxParticles * 3);
        this.lastUpdateCount = 0;
    }

    addBlockBreakParticles(x, y, z, blockColor) {
        const particleCount = Math.min(8 + Math.floor(Math.random() * 8), this.maxParticles - this.particles.length);

        for (let i = 0; i < particleCount; i++) {
            let particle = this.particlePool.pop();
            if (!particle) {
                particle = {
                    position: { x: 0, y: 0, z: 0 },
                    velocity: { x: 0, y: 0, z: 0 },
                    life: 0,
                    maxLife: 0,
                    color: 0xffffff
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
            particle.color = blockColor;

            this.particles.push(particle);
        }
    }

    update() {
        const gravity = 0.01;
        let activeCount = 0;

        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.velocity.y -= gravity;
            p.position.x += p.velocity.x;
            p.position.y += p.velocity.y;
            p.position.z += p.velocity.z;
            p.life -= 1 / 60;

            if (p.life <= 0) {
                this.particlePool.push(this.particles.pop());
                if (i < this.particles.length) {
                    i++;
                }
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

        for (let i = 0; i < this.particles.length; i++) {
            const p = this.particles[i];
            this.positionArray[i * 3] = p.position.x;
            this.positionArray[i * 3 + 1] = p.position.y;
            this.positionArray[i * 3 + 2] = p.position.z;

            const color = new THREE.Color(p.color);
            this.colorArray[i * 3] = color.r;
            this.colorArray[i * 3 + 1] = color.g;
            this.colorArray[i * 3 + 2] = color.b;
        }

        if (this.lastUpdateCount !== this.particles.length) {
            this.geometry.setAttribute('position', new THREE.BufferAttribute(this.positionArray.slice(0, this.particles.length * 3), 3));
            this.geometry.setAttribute('color', new THREE.BufferAttribute(this.colorArray.slice(0, this.particles.length * 3), 3));
            this.lastUpdateCount = this.particles.length;
        } else {
            this.geometry.attributes.position.needsUpdate = true;
            this.geometry.attributes.color.needsUpdate = true;
        }
    }
}
