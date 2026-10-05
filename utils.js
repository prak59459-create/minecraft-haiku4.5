export class Vector3 {
    constructor(x = 0, y = 0, z = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    add(v) {
        return new Vector3(this.x + v.x, this.y + v.y, this.z + v.z);
    }

    subtract(v) {
        return new Vector3(this.x - v.x, this.y - v.y, this.z - v.z);
    }

    multiply(scalar) {
        return new Vector3(this.x * scalar, this.y * scalar, this.z * scalar);
    }

    distance(v) {
        const dx = this.x - v.x;
        const dy = this.y - v.y;
        const dz = this.z - v.z;
        return Math.sqrt(dx * dx + dy * dy + dz * dz);
    }

    length() {
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
    }

    normalize() {
        const len = this.length();
        if (len === 0) return new Vector3();
        return this.multiply(1 / len);
    }

    dot(v) {
        return this.x * v.x + this.y * v.y + this.z * v.z;
    }

    cross(v) {
        return new Vector3(
            this.y * v.z - this.z * v.y,
            this.z * v.x - this.x * v.z,
            this.x * v.y - this.y * v.x
        );
    }

    clone() {
        return new Vector3(this.x, this.y, this.z);
    }

    equals(v) {
        return this.x === v.x && this.y === v.y && this.z === v.z;
    }

    toObject() {
        return { x: this.x, y: this.y, z: this.z };
    }

    static fromObject(obj) {
        return new Vector3(obj.x, obj.y, obj.z);
    }
}

export class MathUtils {
    static clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    }

    static lerp(a, b, t) {
        return a + (b - a) * t;
    }

    static smoothstep(t) {
        return t * t * (3 - 2 * t);
    }

    static random(min, max) {
        return min + Math.random() * (max - min);
    }

    static randomInt(min, max) {
        return Math.floor(min + Math.random() * (max - min + 1));
    }

    static distance2D(x1, z1, x2, z2) {
        const dx = x2 - x1;
        const dz = z2 - z1;
        return Math.sqrt(dx * dx + dz * dz);
    }

    static distance3D(x1, y1, z1, x2, y2, z2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        const dz = z2 - z1;
        return Math.sqrt(dx * dx + dy * dy + dz * dz);
    }

    static lineIntersectsBox(start, end, boxMin, boxMax) {
        const dx = end.x - start.x;
        const dy = end.y - start.y;
        const dz = end.z - start.z;

        const tMin = new Vector3(
            dx === 0 ? -Infinity : (boxMin.x - start.x) / dx,
            dy === 0 ? -Infinity : (boxMin.y - start.y) / dy,
            dz === 0 ? -Infinity : (boxMin.z - start.z) / dz
        );

        const tMax = new Vector3(
            dx === 0 ? Infinity : (boxMax.x - start.x) / dx,
            dy === 0 ? Infinity : (boxMax.y - start.y) / dy,
            dz === 0 ? Infinity : (boxMax.z - start.z) / dz
        );

        const tEnter = Math.max(
            Math.min(tMin.x, tMax.x),
            Math.min(tMin.y, tMax.y),
            Math.min(tMin.z, tMax.z)
        );

        const tExit = Math.min(
            Math.max(tMin.x, tMax.x),
            Math.max(tMin.y, tMax.y),
            Math.max(tMin.z, tMax.z)
        );

        return tEnter <= tExit && tExit >= 0;
    }
}

export class Timer {
    constructor(callback, delay, loop = false) {
        this.callback = callback;
        this.delay = delay;
        this.loop = loop;
        this.startTime = Date.now();
        this.running = true;
    }

    update() {
        if (!this.running) return false;

        const elapsed = Date.now() - this.startTime;
        if (elapsed >= this.delay) {
            this.callback();
            if (this.loop) {
                this.startTime = Date.now();
                return true;
            } else {
                this.running = false;
                return false;
            }
        }
        return true;
    }

    stop() {
        this.running = false;
    }

    reset() {
        this.startTime = Date.now();
    }

    getRemainingTime() {
        const elapsed = Date.now() - this.startTime;
        return Math.max(0, this.delay - elapsed);
    }

    getElapsedTime() {
        return Date.now() - this.startTime;
    }

    getProgress() {
        const elapsed = this.getElapsedTime();
        return Math.min(1, elapsed / this.delay);
    }
}
