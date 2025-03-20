import * as fs from 'fs';
import * as fsPromises from 'fs/promises';
import * as path from 'path';

class Logger {
    private levels: { [key: string]: number };
    private currentLevel: number;
    private logDir: string | null;

    constructor(level = 'INFO', logDir: string | null = null) {
        this.levels = { DEBUG: 0, INFO: 1, WARN: 2, ERROR: 3 };
        this.currentLevel = this.levels[level.toUpperCase()] ?? this.levels.INFO;
        this.logDir = logDir;

        if (logDir) {
            if (!fs.existsSync(logDir)) {
                fs.mkdirSync(logDir, { recursive: true });
            }
        }
    }

    private getLogFilePath(): string {
        const date = new Date().toISOString().split('T')[0].replace(/-/g, '');
        if (!this.logDir) {
            throw new Error('Log directory is not set.');
        }
        return path.join(this.logDir, `coinstopper_${date}.log`);
    }

    log(level: string, message: string): void {
        const levelValue = this.levels[level.toUpperCase()];
        if (levelValue >= this.currentLevel) {
            const logMessage = `[${new Date().toISOString()}] [${level}] ${message}`;
            console.log(logMessage);
            if (this.logDir) {
                const logFilePath = this.getLogFilePath();
                fs.appendFileSync(logFilePath, logMessage + '\n');
            }
        }
    }

    debug(message: string): void {
        this.log('DEBUG', message);
    }

    info(message: string): void {
        this.log('INFO', message);
    }

    warn(message: string): void {
        this.log('WARN', message);
    }

    error(message: string): void {
        this.log('ERROR', message);
    }

    // Async function to truncate the log file
    async truncateLogFile(): Promise<void> {
        try {
            const logFilePath = this.getLogFilePath();
            await fsPromises.truncate(logFilePath, 0);
            console.log(`Log file ${logFilePath} truncated successfully.`);
        } catch (err) {
            console.error(`Error truncating log file: ${err.message}`);
        }
    }
}

export default Logger;