export class ParticleSystem {
    constructor(scene) {
        this.scene = scene;
        this.particles = [];
        this.ambientParticles = [];

        this.geometry = new THREE.BufferGeometry();
        this.material = new THREE.PointsMaterial({
            size: 0.2,
            sizeAttenuation: true,
            transparent: true,
            opacity: 0.8
        });
        this.points = new THREE.Points(this.geometry, this.material);
        this.scene.add(this.points);

        this.ambientGeometry = new THREE.BufferGeometry();
        this.ambientMaterial = new THREE.PointsMaterial({
            size: 0.1,
            sizeAttenuation: true,
            transparent: true,
            opacity: 0.3,
            color: 0xCCCCCC
        });
        this.ambientPoints = new THREE.Points(this.ambientGeometry, this.ambientMaterial);
        this.scene.add(this.ambientPoints);

        this.initAmbientParticles();
    }

    initAmbientParticles() {
        for (let i = 0; i < 100; i++) {
            this.ambientParticles.push({
                position: {
                    x: Math.random() * 200 - 100,
                    y: Math.random() * 200 - 100,
                    z: Math.random() * 200 - 100
                },
                velocity: {
                    x: (Math.random() - 0.5) * 0.01,
                    y: (Math.random() - 0.5) * 0.005,
                    z: (Math.random() - 0.5) * 0.01
                }
            });
        }
    }

    addBlockBreakParticles(x, y, z, blockColor) {
        const particleCount = 8 + Math.floor(Math.random() * 8);

        for (let i = 0; i < particleCount; i++) {
            const particle = {
                position: { x, y, z },
                velocity: {
                    x: (Math.random() - 0.5) * 0.3,
                    y: Math.random() * 0.3,
                    z: (Math.random() - 0.5) * 0.3
                },
                life: 1,
                maxLife: 0.8 + Math.random() * 0.4,
                color: blockColor
            };
            this.particles.push(particle);
        }
    }

    update() {
        const gravity = 0.01;

        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.velocity.y -= gravity;
            p.position.x += p.velocity.x;
            p.position.y += p.velocity.y;
            p.position.z += p.velocity.z;
            p.life -= 1 / 60;

            if (p.life <= 0) {
                this.particles.splice(i, 1);
            }
        }

        for (let i = 0; i < this.ambientParticles.length; i++) {
            const p = this.ambientParticles[i];
            p.position.x += p.velocity.x;
            p.position.y += p.velocity.y;
            p.position.z += p.velocity.z;

            if (Math.abs(p.position.x) > 100) p.velocity.x *= -1;
            if (Math.abs(p.position.y) > 100) p.velocity.y *= -0.5;
            if (Math.abs(p.position.z) > 100) p.velocity.z *= -1;
        }

        this.updateGeometry();
        this.updateAmbientGeometry();
    }

    updateGeometry() {
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

            const color = new THREE.Color(p.color);
            const alpha = p.life / p.maxLife;
            colors[i * 3] = color.r;
            colors[i * 3 + 1] = color.g;
            colors[i * 3 + 2] = color.b;
        }

        this.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        this.geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        this.material.opacity = 0.8;
    }

    updateAmbientGeometry() {
        if (this.ambientParticles.length === 0) {
            this.ambientGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array([]), 3));
            return;
        }

        const positions = new Float32Array(this.ambientParticles.length * 3);

        for (let i = 0; i < this.ambientParticles.length; i++) {
            const p = this.ambientParticles[i];
            positions[i * 3] = p.position.x;
            positions[i * 3 + 1] = p.position.y;
            positions[i * 3 + 2] = p.position.z;
        }

        this.ambientGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    }
}
