export class LightingSystem {
    constructor(world) {
        this.world = world;
        this.lightSources = new Map();
        this.ambientLight = 0.5;
        this.sunLight = 1.0;
        this.sunAngle = 0;
    }

    updateSunPosition(time) {
        this.sunAngle = time * 0.00002;
        this.sunLight = Math.max(0.3, Math.sin(this.sunAngle) + 0.5);
    }

    addLightSource(x, y, z, intensity, radius) {
        const key = `${Math.floor(x)},${Math.floor(y)},${Math.floor(z)}`;
        this.lightSources.set(key, {
            position: { x, y, z },
            intensity,
            radius,
            timestamp: Date.now()
        });
    }

    removeLightSource(x, y, z) {
        const key = `${Math.floor(x)},${Math.floor(y)},${Math.floor(z)}`;
        this.lightSources.delete(key);
    }

    calculateLightValue(x, y, z) {
        let totalLight = this.ambientLight + this.sunLight * (1.0 - (y / 256) * 0.3);

        for (const [key, source] of this.lightSources) {
            const dx = x - source.position.x;
            const dy = y - source.position.y;
            const dz = z - source.position.z;
            const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

            if (distance < source.radius) {
                const falloff = 1.0 - (distance / source.radius);
                totalLight += source.intensity * falloff * falloff;
            }
        }

        return Math.min(1.0, totalLight);
    }

    getSkyLight(y) {
        const timeOfDay = (this.sunAngle % (Math.PI * 2)) / (Math.PI * 2);
        const sunIntensity = Math.max(0.2, Math.sin(this.sunAngle * 2) + 0.5);
        return sunIntensity * (1.0 - (y / 256) * 0.5);
    }

    getBlockLight(x, y, z) {
        const block = this.world.getBlock(x, y, z);
        const emittingBlocks = new Set([]);

        if (emittingBlocks.has(block)) {
            return 1.0;
        }
        return 0;
    }

    calculateVertexBrightness(x, y, z) {
        const skyLight = this.getSkyLight(y);
        const blockLight = this.getBlockLight(x, y, z);
        const dynamicLight = this.calculateLightValue(x, y, z);

        return Math.max(0.3, Math.min(1.0, skyLight + blockLight + dynamicLight));
    }

    cleanup() {
        const now = Date.now();
        const expireTime = 10000;

        const toDelete = [];
        for (const [key, source] of this.lightSources) {
            if (now - source.timestamp > expireTime) {
                toDelete.push(key);
            }
        }

        toDelete.forEach(key => this.lightSources.delete(key));
    }
}
