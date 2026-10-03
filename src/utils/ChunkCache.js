export class ChunkCache {
    constructor(maxSize = 512) {
        this.maxSize = maxSize;
        this.cache = new Map();
        this.accessTimes = new Map();
        this.hits = 0;
        this.misses = 0;
    }

    get(key) {
        if (this.cache.has(key)) {
            this.hits++;
            this.accessTimes.set(key, Date.now());
            return this.cache.get(key);
        }
        this.misses++;
        return null;
    }

    set(key, value) {
        if (this.cache.size >= this.maxSize) {
            this.evictLRU();
        }
        this.cache.set(key, value);
        this.accessTimes.set(key, Date.now());
    }

    evictLRU() {
        let lruKey = null;
        let lruTime = Infinity;

        for (const [key, time] of this.accessTimes.entries()) {
            if (time < lruTime) {
                lruTime = time;
                lruKey = key;
            }
        }

        if (lruKey) {
            this.cache.delete(lruKey);
            this.accessTimes.delete(lruKey);
        }
    }

    clear() {
        this.cache.clear();
        this.accessTimes.clear();
        this.hits = 0;
        this.misses = 0;
    }

    getHitRate() {
        const total = this.hits + this.misses;
        return total === 0 ? 0 : this.hits / total;
    }

    getStats() {
        return {
            size: this.cache.size,
            maxSize: this.maxSize,
            hits: this.hits,
            misses: this.misses,
            hitRate: this.getHitRate()
        };
    }
}
