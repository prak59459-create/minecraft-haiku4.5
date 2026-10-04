export class PhysicsEngine {
  constructor() {
    this.gravity = 0.0098;
    this.friction = 0.99;
    this.restitution = 0;
  }

  checkBlockCollision(pos, width, height, world) {
    const collisions = {
      below: false,
      above: false,
      x: false,
      z: false
    };

    const hw = width / 2;
    const corners = [
      { x: -hw, y: 0, z: -hw },
      { x: hw, y: 0, z: -hw },
      { x: -hw, y: 0, z: hw },
      { x: hw, y: 0, z: hw },
      { x: -hw, y: height, z: -hw },
      { x: hw, y: height, z: -hw },
      { x: -hw, y: height, z: hw },
      { x: hw, y: height, z: hw }
    ];

    for (const corner of corners) {
      const wx = Math.floor(pos.x + corner.x);
      const wy = Math.floor(pos.y + corner.y);
      const wz = Math.floor(pos.z + corner.z);

      if (world.getBlock(wx, wy, wz) !== 0) {
        if (corner.y < height / 3) collisions.below = true;
        if (corner.y > height * 2 / 3) collisions.above = true;
        if (corner.x !== 0) collisions.x = true;
        if (corner.z !== 0) collisions.z = true;
      }
    }

    return collisions;
  }

  resolveCollisions(pos, velocity, collisions, width) {
    if (collisions.below) {
      velocity.y = Math.max(velocity.y, 0);
    }
    if (collisions.above) {
      velocity.y = Math.min(velocity.y, 0);
    }
    if (collisions.x) {
      velocity.x *= this.friction;
    }
    if (collisions.z) {
      velocity.z *= this.friction;
    }

    return velocity;
  }

  raycast(origin, direction, world, maxDistance = 100) {
    const step = 0.1;
    let distance = 0;

    while (distance < maxDistance) {
      distance += step;
      const point = {
        x: origin.x + direction.x * distance,
        y: origin.y + direction.y * distance,
        z: origin.z + direction.z * distance
      };

      const blockX = Math.floor(point.x);
      const blockY = Math.floor(point.y);
      const blockZ = Math.floor(point.z);

      if (world.getBlock(blockX, blockY, blockZ) !== 0) {
        return {
          hit: true,
          distance: distance,
          point: point,
          blockPos: { x: blockX, y: blockY, z: blockZ }
        };
      }
    }

    return { hit: false, distance: maxDistance };
  }

  getTerrainSlopeAngle(pos1, pos2) {
    const dx = pos2.x - pos1.x;
    const dy = pos2.y - pos1.y;
    return Math.atan2(dy, dx);
  }
}

export class SimplePhysicsBody {
  constructor(mass = 1) {
    this.mass = mass;
    this.velocity = { x: 0, y: 0, z: 0 };
    this.acceleration = { x: 0, y: 0, z: 0 };
    this.forces = [];
  }

  applyForce(force) {
    this.forces.push(force);
  }

  clearForces() {
    this.forces = [];
  }

  updateAcceleration() {
    this.acceleration = { x: 0, y: 0, z: 0 };
    for (const force of this.forces) {
      this.acceleration.x += force.x / this.mass;
      this.acceleration.y += force.y / this.mass;
      this.acceleration.z += force.z / this.mass;
    }
  }

  update(deltaTime) {
    this.updateAcceleration();
    this.velocity.x += this.acceleration.x * deltaTime;
    this.velocity.y += this.acceleration.y * deltaTime;
    this.velocity.z += this.acceleration.z * deltaTime;

    this.clearForces();
  }
}
