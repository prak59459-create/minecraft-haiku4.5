export class ParticleSystem {
    constructor(scene, config = {}) {
        this.scene = scene;
        this.maxParticles = config.particleLimit || 2000;
        this.particles = new Array(this.maxParticles);
        this.activeCount = 0;
        this.freeList = [];

        for (let i = 0; i < this.maxParticles; i++) {
            this.particles[i] = {
                position: { x: 0, y: 0, z: 0 },
                velocity: { x: 0, y: 0, z: 0 },
                life: 0,
                maxLife: 1,
                color: 0xffffff,
                active: false
            };
            this.freeList.push(i);
        }

        this.geometry = new THREE.BufferGeometry();
        this.positions = new Float32Array(this.maxParticles * 3);
        this.colors = new Float32Array(this.maxParticles * 3);

        this.geometry.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));
        this.geometry.setAttribute('color', new THREE.BufferAttribute(this.colors, 3));

        this.material = new THREE.PointsMaterial({
            size: 0.2,
            sizeAttenuation: true,
            transparent: true,
            opacity: 0.8,
            vertexColors: true
        });
        this.points = new THREE.Points(this.geometry, this.material);
        this.scene.add(this.points);
    }

    addBlockBreakParticles(x, y, z, blockColor) {
        const particleCount = Math.min(8 + Math.floor(Math.random() * 8), this.freeList.length);

        for (let i = 0; i < particleCount; i++) {
            if (this.freeList.length === 0) break;

            const idx = this.freeList.pop();
            const particle = this.particles[idx];

            particle.position.x = x;
            particle.position.y = y;
            particle.position.z = z;
            particle.velocity.x = (Math.random() - 0.5) * 0.3;
            particle.velocity.y = Math.random() * 0.3;
            particle.velocity.z = (Math.random() - 0.5) * 0.3;
            particle.life = 1;
            particle.maxLife = 0.8 + Math.random() * 0.4;
            particle.color = blockColor;
            particle.active = true;
            this.activeCount++;
        }
    }

    update() {
        const gravity = 0.01;
        let writeIdx = 0;

        for (let i = 0; i < this.activeCount; i++) {
            const p = this.particles[i];
            if (!p.active) continue;

            p.velocity.y -= gravity;
            p.position.x += p.velocity.x;
            p.position.y += p.velocity.y;
            p.position.z += p.velocity.z;
            p.life -= 1 / 60;

            if (p.life <= 0) {
                p.active = false;
                this.freeList.push(i);
                this.activeCount--;
            } else {
                this.particles[writeIdx++] = p;
            }
        }

        this.updateGeometry(writeIdx);
    }

    updateGeometry(count) {
        this.geometry.setDrawRange(0, count);

        for (let i = 0; i < count; i++) {
            const p = this.particles[i];
            this.positions[i * 3] = p.position.x;
            this.positions[i * 3 + 1] = p.position.y;
            this.positions[i * 3 + 2] = p.position.z;

            const color = new THREE.Color(p.color);
            this.colors[i * 3] = color.r * 255;
            this.colors[i * 3 + 1] = color.g * 255;
            this.colors[i * 3 + 2] = color.b * 255;
        }

        this.geometry.attributes.position.needsUpdate = true;
        this.geometry.attributes.color.needsUpdate = true;
    }
}
