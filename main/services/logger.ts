import * as fs from 'fs';
import * as path from 'path';

export enum LogLevel {
    DEBUG = 'debug',
    INFO = 'info',
    WARN = 'warn',
    ERROR = 'error'
}

interface LogOptions {
    timestamp?: boolean;
    logToFile?: boolean;
    logToConsole?: boolean;
}

export class Logger {
    private level: LogLevel;
    private logDir: string;
    private logFile: string;
    private options: LogOptions;

    constructor(level: string = LogLevel.INFO, logDir: string = './logs', options: LogOptions = {}) {
        this.level = this.validateLogLevel(level);
        this.logDir = logDir;
        this.logFile = path.join(this.logDir, 'app.log');
        this.options = {
            timestamp: true,
            logToFile: true,
            logToConsole: true,
            ...options
        };

        // Create log directory if it doesn't exist
        if (this.options.logToFile && !fs.existsSync(this.logDir)) {
            fs.mkdirSync(this.logDir, { recursive: true });
        }
    }

    private validateLogLevel(level: string): LogLevel {
        const normalizedLevel = level.toLowerCase();
        if (Object.values(LogLevel).includes(normalizedLevel as LogLevel)) {
            return normalizedLevel as LogLevel;
        }
        console.warn(`Invalid log level: ${level}. Defaulting to INFO`);
        return LogLevel.INFO;
    }

    private getLogLevelPriority(level: LogLevel): number {
        const priorities: { [key in LogLevel]: number } = {
            [LogLevel.DEBUG]: 0,
            [LogLevel.INFO]: 1,
            [LogLevel.WARN]: 2,
            [LogLevel.ERROR]: 3
        };
        return priorities[level];
    }

    private shouldLog(messageLevel: LogLevel): boolean {
        return this.getLogLevelPriority(messageLevel) >= this.getLogLevelPriority(this.level);
    }

    private formatMessage(level: LogLevel, message: string): string {
        const timestamp = this.options.timestamp ? new Date().toISOString() : '';
        return `${timestamp ? `[${timestamp}] ` : ''}[${level.toUpperCase()}] ${message}`;
    }

    private async writeToFile(message: string): Promise<void> {
        if (!this.options.logToFile) return;

        try {
            await fs.promises.appendFile(this.logFile, message + '\n');
        } catch (error) {
            console.error(`Failed to write to log file: ${error.message}`);
        }
    }

    public async debug(message: string): Promise<void> {
        if (this.shouldLog(LogLevel.DEBUG)) {
            const formattedMessage = this.formatMessage(LogLevel.DEBUG, message);
            if (this.options.logToConsole) console.debug(formattedMessage);
            await this.writeToFile(formattedMessage);
        }
    }

    public async info(message: string): Promise<void> {
        if (this.shouldLog(LogLevel.INFO)) {
            const formattedMessage = this.formatMessage(LogLevel.INFO, message);
            if (this.options.logToConsole) console.info(formattedMessage);
            await this.writeToFile(formattedMessage);
        }
    }

    public async warn(message: string): Promise<void> {
        if (this.shouldLog(LogLevel.WARN)) {
            const formattedMessage = this.formatMessage(LogLevel.WARN, message);
            if (this.options.logToConsole) console.warn(formattedMessage);
            await this.writeToFile(formattedMessage);
        }
    }

    public async error(message: string): Promise<void> {
        if (this.shouldLog(LogLevel.ERROR)) {
            const formattedMessage = this.formatMessage(LogLevel.ERROR, message);
            if (this.options.logToConsole) console.error(formattedMessage);
            await this.writeToFile(formattedMessage);
        }
    }

    public async truncateLogFile(): Promise<void> {
        if (!this.options.logToFile) return;

        try {
            await fs.promises.writeFile(this.logFile, '');
            await this.info('Log file truncated');
        } catch (error) {
            console.error(`Failed to truncate log file: ${error.message}`);
        }
    }

    public setLevel(level: string): void {
        this.level = this.validateLogLevel(level);
    }

    public getLevel(): LogLevel {
        return this.level;
    }
}
