class ParticleSystem {
    constructor(scene) {
        this.scene = scene;
        this.particles = [];
        this.maxParticles = 5000;
    }

    createBlockDestructionParticles(position, blockId, count = 8) {
        const blockType = blockRegistry.get(blockId);
        const color = new THREE.Color(blockType.color);

        for (let i = 0; i < count; i++) {
            const velocity = new THREE.Vector3(
                (Math.random() - 0.5) * 0.4,
                Math.random() * 0.3,
                (Math.random() - 0.5) * 0.4
            );

            this.addParticle(position, velocity, color, blockId);
        }
    }

    addParticle(position, velocity, color, blockId) {
        if (this.particles.length >= this.maxParticles) return;

        const particle = {
            position: position.clone(),
            velocity: velocity,
            acceleration: new THREE.Vector3(0, -0.01, 0),
            color: color,
            age: 0,
            maxAge: 60 + Math.random() * 40,
            size: 0.2 + Math.random() * 0.1,
            blockId: blockId
        };

        this.particles.push(particle);
    }

    update() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];

            p.velocity.add(p.acceleration);
            p.velocity.multiplyScalar(0.98);
            p.position.add(p.velocity);
            p.age++;

            if (p.age > p.maxAge) {
                this.particles.splice(i, 1);
            }
        }
    }

    render(renderer, camera) {
        if (this.particles.length === 0) return;

        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(32, 32, 30, 0, Math.PI * 2);
        ctx.fill();

        const texture = new THREE.CanvasTexture(canvas);
        texture.magFilter = THREE.LinearFilter;

        const geometry = new THREE.BufferGeometry();
        const positions = [];
        const colors = [];
        const sizes = [];

        for (const p of this.particles) {
            const alpha = 1 - (p.age / p.maxAge);
            positions.push(p.position.x, p.position.y, p.position.z);
            colors.push(p.color.r, p.color.g, p.color.b);
            sizes.push(p.size * alpha * 10);
        }

        if (positions.length > 0) {
            geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3));
            geometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array(colors), 3));
            geometry.setAttribute('size', new THREE.BufferAttribute(new Float32Array(sizes), 1));

            const material = new THREE.PointsMaterial({
                size: 1,
                sizeAttenuation: true,
                vertexColors: true,
                transparent: true,
                map: texture,
                alphaTest: 0.5,
                fog: true
            });

            const points = new THREE.Points(geometry, material);
            points.renderOrder = 1000;

            this.scene.add(points);

            setTimeout(() => {
                this.scene.remove(points);
                geometry.dispose();
                material.dispose();
                texture.dispose();
            }, 0);
        }
    }
}
