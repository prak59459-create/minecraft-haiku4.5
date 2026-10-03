export class Profiler {
    constructor() {
        this.metrics = {};
    }

    start(name) {
        if (!this.metrics[name]) {
            this.metrics[name] = { times: [], count: 0 };
        }
        this.metrics[name].startTime = performance.now();
    }

    end(name) {
        if (this.metrics[name] && this.metrics[name].startTime) {
            const duration = performance.now() - this.metrics[name].startTime;
            this.metrics[name].times.push(duration);
            this.metrics[name].count++;

            if (this.metrics[name].times.length > 100) {
                this.metrics[name].times.shift();
            }
        }
    }

    getAverage(name) {
        if (!this.metrics[name] || this.metrics[name].times.length === 0) {
            return 0;
        }
        const sum = this.metrics[name].times.reduce((a, b) => a + b, 0);
        return sum / this.metrics[name].times.length;
    }

    getMax(name) {
        if (!this.metrics[name] || this.metrics[name].times.length === 0) {
            return 0;
        }
        return Math.max(...this.metrics[name].times);
    }

    report() {
        const report = {};
        for (const name in this.metrics) {
            report[name] = {
                avg: this.getAverage(name).toFixed(2) + 'ms',
                max: this.getMax(name).toFixed(2) + 'ms',
                count: this.metrics[name].count
            };
        }
        return report;
    }

    reset() {
        this.metrics = {};
    }
}
