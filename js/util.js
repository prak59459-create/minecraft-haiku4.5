function hashChunkCoords(x, z) {
    return `${x},${z}`;
}

function unhashChunkCoords(hash) {
    const [x, z] = hash.split(',').map(Number);
    return [x, z];
}

function getChunkCoords(worldX, worldZ) {
    return [Math.floor(worldX / CHUNK_SIZE), Math.floor(worldZ / CHUNK_SIZE)];
}

function getLocalBlockCoords(worldX, worldY, worldZ) {
    const chunkX = Math.floor(worldX / CHUNK_SIZE);
    const chunkZ = Math.floor(worldZ / CHUNK_SIZE);
    const localX = ((worldX % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
    const localZ = ((worldZ % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
    return [localX, worldY, localZ, chunkX, chunkZ];
}

function floorDiv(a, b) {
    return Math.floor(a / b);
}

function randomRange(min, max) {
    return Math.random() * (max - min) + min;
}

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

class Vec3 {
    constructor(x = 0, y = 0, z = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    add(other) {
        return new Vec3(this.x + other.x, this.y + other.y, this.z + other.z);
    }

    subtract(other) {
        return new Vec3(this.x - other.x, this.y - other.y, this.z - other.z);
    }

    scale(scalar) {
        return new Vec3(this.x * scalar, this.y * scalar, this.z * scalar);
    }

    length() {
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
    }

    normalize() {
        const len = this.length();
        if (len === 0) return new Vec3();
        return this.scale(1 / len);
    }

    dot(other) {
        return this.x * other.x + this.y * other.y + this.z * other.z;
    }

    copy() {
        return new Vec3(this.x, this.y, this.z);
    }
}

const CHUNK_SIZE = 16;
const CHUNK_HEIGHT = 256;
const RENDER_DISTANCE = 8;
const WORLD_SEED = Math.random() * 1000000;
