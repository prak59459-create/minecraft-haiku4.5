export class Logger {
    constructor(name = 'App') {
        this.name = name;
        this.logs = [];
        this.maxLogs = 100;
    }

    info(message, data = null) {
        const log = { time: Date.now(), level: 'INFO', message, data };
        this.logs.push(log);
        console.log(`[${this.name}:INFO] ${message}`, data);
        this.trimLogs();
    }

    warn(message, data = null) {
        const log = { time: Date.now(), level: 'WARN', message, data };
        this.logs.push(log);
        console.warn(`[${this.name}:WARN] ${message}`, data);
        this.trimLogs();
    }

    error(message, data = null) {
        const log = { time: Date.now(), level: 'ERROR', message, data };
        this.logs.push(log);
        console.error(`[${this.name}:ERROR] ${message}`, data);
        this.trimLogs();
    }

    debug(message, data = null) {
        const log = { time: Date.now(), level: 'DEBUG', message, data };
        this.logs.push(log);
        if (process.env.DEBUG) {
            console.debug(`[${this.name}:DEBUG] ${message}`, data);
        }
        this.trimLogs();
    }

    trimLogs() {
        if (this.logs.length > this.maxLogs) {
            this.logs = this.logs.slice(-this.maxLogs);
        }
    }

    getLogs() {
        return this.logs;
    }

    clear() {
        this.logs = [];
    }

    export() {
        return JSON.stringify(this.logs, null, 2);
    }
}
