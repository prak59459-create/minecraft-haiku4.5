import * as THREE from 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.module.js';

export class ParticleSystem {
  constructor(scene) {
    this.scene = scene;
    this.particles = [];
    this.maxParticles = 500;
  }

  createBlockParticles(position, color, count = 8) {
    for (let i = 0; i < count; i++) {
      const geometry = new THREE.BoxGeometry(0.1, 0.1, 0.1);
      const material = new THREE.MeshStandardMaterial({ color: color });
      const mesh = new THREE.Mesh(geometry, material);

      mesh.position.copy(position);
      mesh.position.x += (Math.random() - 0.5) * 0.5;
      mesh.position.y += (Math.random() - 0.5) * 0.5;
      mesh.position.z += (Math.random() - 0.5) * 0.5;

      const velocity = new THREE.Vector3(
        (Math.random() - 0.5) * 0.1,
        Math.random() * 0.1 + 0.05,
        (Math.random() - 0.5) * 0.1
      );

      const particle = {
        mesh: mesh,
        velocity: velocity,
        age: 0,
        life: 0.5 + Math.random() * 0.5,
        rotation: new THREE.Vector3(
          (Math.random() - 0.5) * 0.1,
          (Math.random() - 0.5) * 0.1,
          (Math.random() - 0.5) * 0.1
        )
      };

      this.scene.add(mesh);
      this.particles.push(particle);
    }
  }

  update(deltaTime) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const particle = this.particles[i];
      particle.age += deltaTime;

      if (particle.age >= particle.life) {
        this.scene.remove(particle.mesh);
        particle.mesh.geometry.dispose();
        particle.mesh.material.dispose();
        this.particles.splice(i, 1);
        continue;
      }

      const t = particle.age / particle.life;
      particle.velocity.y -= 0.005;

      particle.mesh.position.add(particle.velocity);
      particle.mesh.rotation.x += particle.rotation.x;
      particle.mesh.rotation.y += particle.rotation.y;
      particle.mesh.rotation.z += particle.rotation.z;

      const opacity = 1 - (t * t);
      particle.mesh.material.opacity = opacity;
      particle.mesh.material.transparent = true;
      particle.mesh.scale.setScalar(1 - t * 0.5);
    }
  }
}
