import * as THREE from 'three';

export class MathUtils {
    static floorVector3(vec) {
        return new THREE.Vector3(
            Math.floor(vec.x),
            Math.floor(vec.y),
            Math.floor(vec.z)
        );
    }

    static clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    }

    static lerp(a, b, t) {
        return a + (b - a) * t;
    }

    static distance(a, b) {
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const dz = b.z - a.z;
        return Math.sqrt(dx * dx + dy * dy + dz * dz);
    }

    static distanceSquared(a, b) {
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const dz = b.z - a.z;
        return dx * dx + dy * dy + dz * dz;
    }

    static random(min, max) {
        return Math.random() * (max - min) + min;
    }

    static randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    static smoothstep(t) {
        return t * t * (3 - 2 * t);
    }

    static smootherstep(t) {
        return t * t * t * (t * (t * 6 - 15) + 10);
    }

    static wrap(value, min, max) {
        const range = max - min;
        return ((value - min) % range + range) % range + min;
    }
}
