export class Logger {
    static levels = {
        DEBUG: 0,
        INFO: 1,
        WARN: 2,
        ERROR: 3,
        NONE: 4
    };

    static currentLevel = Logger.levels.INFO;

    static setLevel(level) {
        Logger.currentLevel = level;
    }

    static debug(message, data) {
        if (Logger.currentLevel <= Logger.levels.DEBUG) {
            console.log('%c[DEBUG]', 'color: cyan;', message, data || '');
        }
    }

    static info(message, data) {
        if (Logger.currentLevel <= Logger.levels.INFO) {
            console.log('%c[INFO]', 'color: green;', message, data || '');
        }
    }

    static warn(message, data) {
        if (Logger.currentLevel <= Logger.levels.WARN) {
            console.warn('%c[WARN]', 'color: orange;', message, data || '');
        }
    }

    static error(message, data) {
        if (Logger.currentLevel <= Logger.levels.ERROR) {
            console.error('%c[ERROR]', 'color: red;', message, data || '');
        }
    }

    static group(label) {
        console.group(label);
    }

    static groupEnd() {
        console.groupEnd();
    }
}
