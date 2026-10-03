import * as THREE from 'three';

export class ParticleSystem {
  scene: THREE.Scene;
  particles: Particle[] = [];

  constructor(scene: THREE.Scene) {
    this.scene = scene;
  }

  createBlockDestruction(position: THREE.Vector3, blockType: number) {
    const colors: { [key: number]: number } = {
      1: 0x22aa22, // grass - green
      2: 0x8b6914, // dirt - brown
      3: 0x888888, // stone - gray
      4: 0x664422, // wood - dark brown
      5: 0x228822, // leaves - dark green
      6: 0x1144ff, // water - blue
    };

    const color = colors[blockType] || 0xffffff;
    const particleCount = 6;

    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 * i) / particleCount;
      const speed = 2 + Math.random() * 2;

      const particle = new Particle(
        position.clone(),
        new THREE.Vector3(
          Math.cos(angle) * speed + (Math.random() - 0.5) * 2,
          2 + Math.random() * 2,
          Math.sin(angle) * speed + (Math.random() - 0.5) * 2
        ),
        color
      );

      this.particles.push(particle);
      this.scene.add(particle.mesh);
    }
  }

  update(deltaTime: number) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const particle = this.particles[i];
      particle.update(deltaTime);

      if (particle.life <= 0) {
        this.scene.remove(particle.mesh);
        this.particles.splice(i, 1);
      }
    }
  }
}

class Particle {
  mesh: THREE.Mesh;
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  life: number = 1;
  gravity: number = 9.8;

  constructor(position: THREE.Vector3, velocity: THREE.Vector3, color: number) {
    this.position = position;
    this.velocity = velocity;

    const geometry = new THREE.BoxGeometry(0.2, 0.2, 0.2);
    const material = new THREE.MeshPhongMaterial({ color });
    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.position.copy(position);
  }

  update(deltaTime: number) {
    this.velocity.y -= this.gravity * deltaTime;
    this.position.addScaledVector(this.velocity, deltaTime);
    this.mesh.position.copy(this.position);

    this.life -= deltaTime * 0.5;
    this.mesh.material.opacity = this.life;
  }
}
