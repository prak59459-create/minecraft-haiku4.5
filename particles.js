export class ParticleSystem {
    constructor(scene) {
        this.scene = scene;
        this.particles = [];
        this.geometry = new THREE.BufferGeometry();
        this.material = new THREE.PointsMaterial({
            size: 0.25,
            sizeAttenuation: true,
            transparent: true,
            opacity: 0.85,
            sizeVariation: 1.0,
            map: new THREE.CanvasTexture(this.createParticleTexture())
        });
        this.points = new THREE.Points(this.geometry, this.material);
        this.points.renderOrder = 10;
        this.scene.add(this.points);
        this.maxParticles = 5000;
    }

    createParticleTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');
        const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
        gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.5)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 64, 64);
        return canvas;
    }

    addBlockBreakParticles(x, y, z, blockColor) {
        if (this.particles.length >= this.maxParticles) return;

        const particleCount = 12 + Math.floor(Math.random() * 12);

        for (let i = 0; i < particleCount; i++) {
            if (this.particles.length >= this.maxParticles) break;

            const angle = Math.random() * Math.PI * 2;
            const speed = 0.2 + Math.random() * 0.25;

            const particle = {
                position: { x, y, z },
                velocity: {
                    x: Math.cos(angle) * speed,
                    y: 0.15 + Math.random() * 0.2,
                    z: Math.sin(angle) * speed
                },
                life: 1,
                maxLife: 1.0 + Math.random() * 0.6,
                color: blockColor,
                size: 0.2 + Math.random() * 0.15,
                rotation: Math.random() * Math.PI * 2
            };
            this.particles.push(particle);
        }
    }

    update() {
        const gravity = 0.015;
        const friction = 0.98;

        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.velocity.y -= gravity;
            p.velocity.x *= friction;
            p.velocity.z *= friction;

            p.position.x += p.velocity.x;
            p.position.y += p.velocity.y;
            p.position.z += p.velocity.z;

            p.life -= 1 / 60;
            p.rotation += 0.05;

            if (p.life <= 0) {
                this.particles.splice(i, 1);
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

        const positions = new Float32Array(this.particles.length * 3);
        const colors = new Float32Array(this.particles.length * 3);
        const sizes = new Float32Array(this.particles.length);

        for (let i = 0; i < this.particles.length; i++) {
            const p = this.particles[i];
            positions[i * 3] = p.position.x;
            positions[i * 3 + 1] = p.position.y;
            positions[i * 3 + 2] = p.position.z;

            const color = new THREE.Color(p.color);
            const alpha = Math.max(0, p.life / p.maxLife);
            colors[i * 3] = color.r;
            colors[i * 3 + 1] = color.g;
            colors[i * 3 + 2] = color.b;

            sizes[i] = p.size * alpha;
        }

        this.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        this.geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        this.material.size = 0.25;
        this.material.opacity = 0.85;
    }
}
