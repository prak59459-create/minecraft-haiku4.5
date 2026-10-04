import * as THREE from 'three';
import { BlockType, getBlockColor } from './blocks.js';

interface Particle {
    position: THREE.Vector3;
    velocity: THREE.Vector3;
    lifetime: number;
    maxLifetime: number;
    color: { r: number, g: number, b: number };
}

export class ParticleSystem {
    particles: Particle[] = [];
    scene: THREE.Scene;
    mesh: THREE.Points | null = null;

    constructor(scene: THREE.Scene) {
        this.scene = scene;
    }

    addDestructionParticles(x: number, y: number, z: number, blockType: BlockType): void {
        const color = getBlockColor(blockType);
        const particleCount = 8;

        for (let i = 0; i < particleCount; i++) {
            const angle = (i / particleCount) * Math.PI * 2;
            const speed = 2 + Math.random() * 3;

            this.particles.push({
                position: new THREE.Vector3(x + 0.5, y + 0.5, z + 0.5),
                velocity: new THREE.Vector3(
                    Math.cos(angle) * speed,
                    1 + Math.random() * 2,
                    Math.sin(angle) * speed
                ),
                lifetime: 0.6 + Math.random() * 0.4,
                maxLifetime: 0.6 + Math.random() * 0.4,
                color: color
            });
        }
    }

    update(delta: number): void {
        this.particles = this.particles.filter(p => p.lifetime > 0);

        for (const p of this.particles) {
            p.lifetime -= delta;
            p.velocity.y -= 9.8 * delta;
            p.position.addScaledVector(p.velocity, delta);
        }

        if (this.particles.length > 0) {
            this.updateMesh();
        } else if (this.mesh) {
            this.scene.remove(this.mesh);
            this.mesh.geometry.dispose();
            (this.mesh.material as THREE.Material).dispose();
            this.mesh = null;
        }
    }

    private updateMesh(): void {
        if (this.mesh) {
            this.scene.remove(this.mesh);
            this.mesh.geometry.dispose();
            (this.mesh.material as THREE.Material).dispose();
        }

        const positions = new Float32Array(this.particles.length * 3);
        const colors = new Uint8Array(this.particles.length * 3);

        for (let i = 0; i < this.particles.length; i++) {
            const p = this.particles[i];
            const alpha = p.lifetime / p.maxLifetime;

            positions[i * 3] = p.position.x;
            positions[i * 3 + 1] = p.position.y;
            positions[i * 3 + 2] = p.position.z;

            colors[i * 3] = p.color.r;
            colors[i * 3 + 1] = p.color.g;
            colors[i * 3 + 2] = p.color.b;
        }

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3, true));

        const material = new THREE.PointsMaterial({
            size: 0.2,
            vertexColors: true,
            sizeAttenuation: true
        });

        this.mesh = new THREE.Points(geometry, material);
        this.scene.add(this.mesh);
    }
}
