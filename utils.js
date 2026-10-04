export class MathUtils {
    static clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    }

    static lerp(a, b, t) {
        return a + (b - a) * this.clamp(t, 0, 1);
    }

    static distance3D(p1, p2) {
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const dz = p2.z - p1.z;
        return Math.sqrt(dx * dx + dy * dy + dz * dz);
    }

    static distance2D(p1, p2) {
        const dx = p2.x - p1.x;
        const dz = p2.z - p1.z;
        return Math.sqrt(dx * dx + dz * dz);
    }

    static normalize(vector) {
        const length = Math.sqrt(vector.x * vector.x + vector.y * vector.y + vector.z * vector.z);
        if (length === 0) return { x: 0, y: 0, z: 0 };
        return {
            x: vector.x / length,
            y: vector.y / length,
            z: vector.z / length
        };
    }

    static vectorAdd(v1, v2) {
        return {
            x: v1.x + v2.x,
            y: v1.y + v2.y,
            z: v1.z + v2.z
        };
    }

    static vectorSubtract(v1, v2) {
        return {
            x: v1.x - v2.x,
            y: v1.y - v2.y,
            z: v1.z - v2.z
        };
    }

    static randomRange(min, max) {
        return min + Math.random() * (max - min);
    }

    static randomInt(min, max) {
        return Math.floor(min + Math.random() * (max - min + 1));
    }

    static smoothstep(t) {
        const clamped = this.clamp(t, 0, 1);
        return clamped * clamped * (3 - 2 * clamped);
    }

    static lerp3D(p1, p2, t) {
        return {
            x: this.lerp(p1.x, p2.x, t),
            y: this.lerp(p1.y, p2.y, t),
            z: this.lerp(p1.z, p2.z, t)
        };
    }
}

export class StringUtils {
    static formatNumber(num, digits = 1) {
        return num.toFixed(digits);
    }

    static capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    }

    static toCamelCase(str) {
        return str.replace(/[-_](.)/g, (_, char) => char.toUpperCase());
    }

    static toKebabCase(str) {
        return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
    }

    static formatTime(ms) {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);

        if (hours > 0) {
            return `${hours}h ${minutes % 60}m`;
        } else if (minutes > 0) {
            return `${minutes}m ${seconds % 60}s`;
        } else {
            return `${seconds}s`;
        }
    }

    static formatBytes(bytes) {
        const units = ['B', 'KB', 'MB', 'GB'];
        let size = bytes;
        let unitIndex = 0;

        while (size >= 1024 && unitIndex < units.length - 1) {
            size /= 1024;
            unitIndex++;
        }

        return `${size.toFixed(2)} ${units[unitIndex]}`;
    }
}

export class ColorUtils {
    static hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

    static rgbToHex(r, g, b) {
        return '#' + [r, g, b].map(x => {
            const hex = x.toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        }).join('');
    }

    static hslToRgb(h, s, l) {
        h /= 360;
        s /= 100;
        l /= 100;

        let r, g, b;

        if (s === 0) {
            r = g = b = l;
        } else {
            const hue2rgb = (p, q, t) => {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1/6) return p + (q - p) * 6 * t;
                if (t < 1/2) return q;
                if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                return p;
            };

            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            r = hue2rgb(p, q, h + 1/3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1/3);
        }

        return {
            r: Math.round(r * 255),
            g: Math.round(g * 255),
            b: Math.round(b * 255)
        };
    }

    static lerpColor(c1, c2, t) {
        return {
            r: Math.round(MathUtils.lerp(c1.r, c2.r, t)),
            g: Math.round(MathUtils.lerp(c1.g, c2.g, t)),
            b: Math.round(MathUtils.lerp(c1.b, c2.b, t))
        };
    }
}

export class PerformanceUtils {
    static measureTime(fn) {
        const start = performance.now();
        fn();
        return performance.now() - start;
    }

    static async measureAsync(fn) {
        const start = performance.now();
        await fn();
        return performance.now() - start;
    }

    static debounce(fn, delay) {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => fn.apply(this, args), delay);
        };
    }

    static throttle(fn, limit) {
        let lastRun = 0;
        return function(...args) {
            const now = Date.now();
            if (now - lastRun >= limit) {
                fn.apply(this, args);
                lastRun = now;
            }
        };
    }

    static memoize(fn) {
        const cache = new Map();
        return function(...args) {
            const key = JSON.stringify(args);
            if (cache.has(key)) {
                return cache.get(key);
            }
            const result = fn.apply(this, args);
            cache.set(key, result);
            return result;
        };
    }
}

export class ArrayUtils {
    static shuffle(array) {
        const result = [...array];
        for (let i = result.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [result[i], result[j]] = [result[j], result[i]];
        }
        return result;
    }

    static chunk(array, size) {
        const chunks = [];
        for (let i = 0; i < array.length; i += size) {
            chunks.push(array.slice(i, i + size));
        }
        return chunks;
    }

    static flatten(array) {
        return array.reduce((acc, val) =>
            acc.concat(Array.isArray(val) ? this.flatten(val) : val), []);
    }

    static unique(array) {
        return [...new Set(array)];
    }

    static groupBy(array, key) {
        return array.reduce((acc, obj) => {
            const group = key(obj);
            if (!acc[group]) acc[group] = [];
            acc[group].push(obj);
            return acc;
        }, {});
    }
}

export class StorageUtils {
    static setItem(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (e) {
            console.warn('Storage error:', e);
            return false;
        }
    }

    static getItem(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (e) {
            console.warn('Storage error:', e);
            return defaultValue;
        }
    }

    static removeItem(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (e) {
            console.warn('Storage error:', e);
            return false;
        }
    }

    static clear() {
        try {
            localStorage.clear();
            return true;
        } catch (e) {
            console.warn('Storage error:', e);
            return false;
        }
    }
}
