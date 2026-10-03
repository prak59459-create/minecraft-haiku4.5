export class Profiler {
    constructor() {
        this.measurements = {};
        this.startTimes = {};
    }

    start(label) {
        this.startTimes[label] = performance.now();
    }

    end(label) {
        if (!this.startTimes[label]) return;

        const duration = performance.now() - this.startTimes[label];

        if (!this.measurements[label]) {
            this.measurements[label] = {
                count: 0,
                total: 0,
                min: Infinity,
                max: -Infinity,
                avg: 0
            };
        }

        const m = this.measurements[label];
        m.count++;
        m.total += duration;
        m.min = Math.min(m.min, duration);
        m.max = Math.max(m.max, duration);
        m.avg = m.total / m.count;

        delete this.startTimes[label];
        return duration;
    }

    getReport(label) {
        return this.measurements[label] || null;
    }

    getAllReports() {
        return this.measurements;
    }

    reset() {
        this.measurements = {};
        this.startTimes = {};
    }

    printReport() {
        console.table(this.measurements);
    }
}
