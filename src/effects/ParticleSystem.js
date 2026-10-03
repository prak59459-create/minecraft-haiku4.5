import * as THREE from 'three';
import { BlockType } from '../world/BlockType.js';

export class ParticleSystem {
    constructor(scene) {
        this.scene = scene;
        this.particles = [];
        this.particleGeometry = new THREE.BufferGeometry();
    }

    createDestructionParticles(blockPos, blockType) {
        const color = BlockType.getColor(blockType);
        const colorObj = new THREE.Color(color.r, color.g, color.b);
        const particleCount = 8;

        for (let i = 0; i < particleCount; i++) {
            const particle = {
                position: new THREE.Vector3(
                    blockPos.x + Math.random(),
                    blockPos.y + Math.random(),
                    blockPos.z + Math.random()
                ),
                velocity: new THREE.Vector3(
                    (Math.random() - 0.5) * 0.3,
                    Math.random() * 0.3,
                    (Math.random() - 0.5) * 0.3
                ),
                life: 1.0,
                color: colorObj.clone(),
                mesh: this.createParticleMesh(blockPos, blockType)
            };

            this.particles.push(particle);
            this.scene.add(particle.mesh);
        }
    }

    createParticleMesh(blockPos, blockType) {
        const size = 0.1;
        const color = BlockType.getColor(blockType);
        const geometry = new THREE.BoxGeometry(size, size, size);
        const material = new THREE.MeshPhongMaterial({
            color: new THREE.Color(color.r, color.g, color.b),
            flatShading: true
        });

        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.copy(blockPos);
        mesh.position.addScaledVector(
            new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5),
            0.5
        );

        return mesh;
    }

    update() {
        const gravity = 0.008;
        const toRemove = [];

        for (let i = 0; i < this.particles.length; i++) {
            const p = this.particles[i];

            p.velocity.y -= gravity;
            p.position.add(p.velocity);
            p.mesh.position.copy(p.position);

            p.life -= 0.02;
            p.mesh.material.opacity = p.life;

            if (p.life <= 0) {
                toRemove.push(i);
            }
        }

        for (let i = toRemove.length - 1; i >= 0; i--) {
            const particle = this.particles[toRemove[i]];
            this.scene.remove(particle.mesh);
            particle.mesh.geometry.dispose();
            particle.mesh.material.dispose();
            this.particles.splice(toRemove[i], 1);
        }
    }

    clear() {
        for (const particle of this.particles) {
            this.scene.remove(particle.mesh);
            particle.mesh.geometry.dispose();
            particle.mesh.material.dispose();
        }
        this.particles = [];
    }
}
