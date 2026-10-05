export class LightingSystem {
    constructor(world) {
        this.world = world;
        this.blockLight = new Map();
        this.skyLight = new Map();
        this.lightEmitters = new Map();
    }

    setBlockLight(x, y, z, intensity) {
        const key = `${x},${y},${z}`;
        if (intensity > 0) {
            this.blockLight.set(key, intensity);
        } else {
            this.blockLight.delete(key);
        }
        this.propagateLight(x, y, z, intensity);
    }

    getBlockLight(x, y, z) {
        const key = `${x},${y},${z}`;
        return this.blockLight.get(key) || 0;
    }

    setSkyLight(x, y, z, intensity) {
        const key = `${x},${y},${z}`;
        if (intensity > 0) {
            this.skyLight.set(key, intensity);
        } else {
            this.skyLight.delete(key);
        }
    }

    getSkyLight(x, y, z) {
        const key = `${x},${y},${z}`;
        return this.skyLight.get(key) || 0;
    }

    registerLightEmitter(x, y, z, intensity, color = 0xFFFFFF) {
        const key = `${x},${y},${z}`;
        this.lightEmitters.set(key, {
            intensity,
            color,
            position: { x, y, z }
        });
        this.setBlockLight(x, y, z, intensity);
    }

    unregisterLightEmitter(x, y, z) {
        const key = `${x},${y},${z}`;
        this.lightEmitters.delete(key);
        this.setBlockLight(x, y, z, 0);
    }

    propagateLight(x, y, z, intensity) {
        if (intensity <= 0) return;

        const queue = [{ x, y, z, intensity }];
        const visited = new Set();

        while (queue.length > 0) {
            const { x: cx, y: cy, z: cz, intensity: ci } = queue.shift();
            const key = `${cx},${cy},${cz}`;

            if (visited.has(key)) continue;
            visited.add(key);

            if (ci <= 0) continue;

            const block = this.world.getBlock(cx, cy, cz);
            if (block === 8) continue;

            const neighbors = [
                { x: cx + 1, y: cy, z: cz },
                { x: cx - 1, y: cy, z: cz },
                { x: cx, y: cy + 1, z: cz },
                { x: cx, y: cy - 1, z: cz },
                { x: cx, y: cy, z: cz + 1 },
                { x: cx, y: cy, z: cz - 1 }
            ];

            for (const neighbor of neighbors) {
                const nKey = `${neighbor.x},${neighbor.y},${neighbor.z}`;
                if (!visited.has(nKey)) {
                    const newIntensity = ci - 1;
                    this.setBlockLight(neighbor.x, neighbor.y, neighbor.z, newIntensity);
                    queue.push({ ...neighbor, intensity: newIntensity });
                }
            }
        }
    }

    calculateLighting(x, y, z) {
        const blockLight = this.getBlockLight(x, y, z);
        const skyLight = this.getSkyLight(x, y, z);

        return {
            blockLight,
            skyLight,
            combined: Math.max(blockLight, skyLight) / 15
        };
    }

    updateSkyLight() {
        const CHUNK_SIZE = 16;
        const WORLD_HEIGHT = 256;

        for (let cx = 0; cx < CHUNK_SIZE; cx++) {
            for (let cz = 0; cz < CHUNK_SIZE; cz++) {
                for (let cy = WORLD_HEIGHT - 1; cy >= 0; cy--) {
                    const block = this.world.getBlock(cx, cy, cz);
                    if (block === 0) {
                        this.setSkyLight(cx, cy, cz, 15);
                    } else {
                        this.setSkyLight(cx, cy, cz, 0);
                        break;
                    }
                }
            }
        }
    }

    clear() {
        this.blockLight.clear();
        this.skyLight.clear();
        this.lightEmitters.clear();
    }

    getStatistics() {
        return {
            blockLights: this.blockLight.size,
            skyLights: this.skyLight.size,
            emitters: this.lightEmitters.size
        };
    }
}
