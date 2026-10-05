export class ParticleSystem {
    constructor(scene, maxParticles = 2000) {
        this.scene = scene;
        this.particles = [];
        this.maxParticles = maxParticles;
        this.geometry = new THREE.BufferGeometry();
        this.material = new THREE.PointsMaterial({
            size: 0.2,
            sizeAttenuation: true,
            transparent: true,
            opacity: 0.8,
            vertexColors: false
        });
        this.points = new THREE.Points(this.geometry, this.material);
        this.scene.add(this.points);

        this.colorCache = new Map();
        this.positionBuffer = new Float32Array(maxParticles * 3);
        this.colorBuffer = new Uint8Array(maxParticles * 3);
    }

    addBlockBreakParticles(x, y, z, blockColor) {
        if (this.particles.length >= this.maxParticles) return;

        const particleCount = Math.min(8 + Math.floor(Math.random() * 8), this.maxParticles - this.particles.length);
        const color = this._getCachedColor(blockColor);

        for (let i = 0; i < particleCount; i++) {
            const particle = {
                x, y, z,
                vx: (Math.random() - 0.5) * 0.3,
                vy: Math.random() * 0.3,
                vz: (Math.random() - 0.5) * 0.3,
                life: 1,
                maxLife: 0.8 + Math.random() * 0.4,
                r: color.r,
                g: color.g,
                b: color.b
            };
            this.particles.push(particle);
        }
    }

    _getCachedColor(hexColor) {
        if (!this.colorCache.has(hexColor)) {
            const color = new THREE.Color(hexColor);
            this.colorCache.set(hexColor, {
                r: Math.floor(color.r * 255),
                g: Math.floor(color.g * 255),
                b: Math.floor(color.b * 255)
            });
        }
        return this.colorCache.get(hexColor);
    }

    update() {
        const gravity = 0.01;

        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.vy -= gravity;
            p.x += p.vx;
            p.y += p.vy;
            p.z += p.vz;
            p.life -= 1 / 60;

            if (p.life <= 0) {
                this.particles.splice(i, 1);
            }
        }

        this.updateGeometry();
    }

    updateGeometry() {
        const count = this.particles.length;
        if (count === 0) {
            this.geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(0), 3));
            this.geometry.setAttribute('color', new THREE.BufferAttribute(new Uint8Array(0), 3, true));
            return;
        }

        for (let i = 0; i < count; i++) {
            const p = this.particles[i];
            this.positionBuffer[i * 3] = p.x;
            this.positionBuffer[i * 3 + 1] = p.y;
            this.positionBuffer[i * 3 + 2] = p.z;

            this.colorBuffer[i * 3] = p.r;
            this.colorBuffer[i * 3 + 1] = p.g;
            this.colorBuffer[i * 3 + 2] = p.b;
        }

        this.geometry.setAttribute('position', new THREE.BufferAttribute(this.positionBuffer.slice(0, count * 3), 3));
        this.geometry.setAttribute('color', new THREE.BufferAttribute(this.colorBuffer.slice(0, count * 3), 3, true));
    }
}
