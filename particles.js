export class ParticleSystem {
    constructor(scene) {
        this.scene = scene;
        this.particles = [];
        this.activeCount = 0;
        this.maxParticles = 2000;
        this.geometry = new THREE.BufferGeometry();
        this.positionBuffer = new Float32Array(this.maxParticles * 3);
        this.colorBuffer = new Uint8Array(this.maxParticles * 3);

        this.geometry.setAttribute('position', new THREE.BufferAttribute(this.positionBuffer, 3));
        this.geometry.setAttribute('color', new THREE.BufferAttribute(this.colorBuffer, 3, true));

        this.material = new THREE.PointsMaterial({
            size: 0.2,
            sizeAttenuation: true,
            transparent: true,
            opacity: 0.8,
            vertexColors: true
        });
        this.points = new THREE.Points(this.geometry, this.material);
        this.scene.add(this.points);

        this.preallocateParticles();
    }

    preallocateParticles() {
        for (let i = 0; i < this.maxParticles; i++) {
            this.particles.push({
                position: { x: 0, y: 0, z: 0 },
                velocity: { x: 0, y: 0, z: 0 },
                life: 0,
                maxLife: 1,
                color: 0xFFFFFF,
                active: false
            });
        }
    }

    addBlockBreakParticles(x, y, z, blockColor) {
        const particleCount = Math.min(8 + Math.floor(Math.random() * 8), this.maxParticles - this.activeCount);
        const color = new THREE.Color(blockColor);
        const r = Math.floor(color.r * 255);
        const g = Math.floor(color.g * 255);
        const b = Math.floor(color.b * 255);

        for (let i = 0; i < particleCount && this.activeCount < this.maxParticles; i++) {
            const p = this.particles[this.activeCount];
            p.position.x = x;
            p.position.y = y;
            p.position.z = z;
            p.velocity.x = (Math.random() - 0.5) * 0.3;
            p.velocity.y = Math.random() * 0.3;
            p.velocity.z = (Math.random() - 0.5) * 0.3;
            p.life = 1;
            p.maxLife = 0.8 + Math.random() * 0.4;
            p.color = blockColor;
            p.active = true;
            this.activeCount++;
        }
    }

    update() {
        const gravity = 0.01;
        let writeIndex = 0;

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
            } else {
                const color = new THREE.Color(p.color);
                const idx = writeIndex * 3;
                this.positionBuffer[idx] = p.position.x;
                this.positionBuffer[idx + 1] = p.position.y;
                this.positionBuffer[idx + 2] = p.position.z;

                this.colorBuffer[idx] = Math.floor(color.r * 255);
                this.colorBuffer[idx + 1] = Math.floor(color.g * 255);
                this.colorBuffer[idx + 2] = Math.floor(color.b * 255);

                writeIndex++;
            }
        }

        this.activeCount = writeIndex;
        if (this.geometry.getAttribute('position')) {
            this.geometry.getAttribute('position').needsUpdate = true;
            this.geometry.getAttribute('color').needsUpdate = true;
        }
        this.geometry.setDrawRange(0, this.activeCount);
    }
}
