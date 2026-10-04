import { BLOCKS, isBlockSolid } from './blocks.js';

export class SimpleMob {
    constructor(x, y, z) {
        this.position = { x, y, z };
        this.velocity = { x: 0, y: 0, z: 0 };
        this.speed = 0.02;
        this.maxSpeed = 0.05;
        this.life = 1;
        this.maxLife = 20;
        this.moveDirection = { x: Math.random() - 0.5, z: Math.random() - 0.5 };
        this.directionChangeTimer = 0;
    }

    update(world) {
        this.life -= 1 / 60;
        this.directionChangeTimer++;

        if (this.directionChangeTimer > 120) {
            this.moveDirection = { x: Math.random() - 0.5, z: Math.random() - 0.5 };
            this.directionChangeTimer = 0;
        }

        const len = Math.sqrt(this.moveDirection.x ** 2 + this.moveDirection.z ** 2);
        if (len > 0) {
            this.velocity.x = (this.moveDirection.x / len) * this.maxSpeed;
            this.velocity.z = (this.moveDirection.z / len) * this.maxSpeed;
        }

        this.velocity.y -= 0.01;

        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
        this.position.z += this.velocity.z;

        const bx = Math.floor(this.position.x);
        const by = Math.floor(this.position.y);
        const bz = Math.floor(this.position.z);

        const block = world.getBlock(bx, by, bz);
        if (isBlockSolid(block)) {
            this.position.y = by + 1;
            this.velocity.y = 0.2;
        }
    }

    isAlive() {
        return this.life > 0;
    }
}

export class MobSystem {
    constructor(scene, world) {
        this.scene = scene;
        this.world = world;
        this.mobs = [];
        this.maxMobs = 20;
        this.spawnTimer = 0;
        this.mobMeshes = new Map();
    }

    update(playerPos) {
        this.spawnTimer++;

        if (this.spawnTimer > 180 && this.mobs.length < this.maxMobs) {
            const angle = Math.random() * Math.PI * 2;
            const dist = 30 + Math.random() * 20;
            const x = playerPos.x + Math.cos(angle) * dist;
            const z = playerPos.z + Math.sin(angle) * dist;
            const y = playerPos.y + 10;

            const mob = new SimpleMob(x, y, z);
            this.mobs.push(mob);
            this.spawnTimer = 0;
        }

        for (let i = this.mobs.length - 1; i >= 0; i--) {
            const mob = this.mobs[i];
            mob.update(this.world);

            if (!mob.isAlive()) {
                this.removeMob(i);
            }
        }
    }

    removeMob(index) {
        const mob = this.mobs[index];
        if (this.mobMeshes.has(mob)) {
            this.scene.remove(this.mobMeshes.get(mob));
            this.mobMeshes.delete(mob);
        }
        this.mobs.splice(index, 1);
    }

    getMobs() {
        return this.mobs;
    }
}
