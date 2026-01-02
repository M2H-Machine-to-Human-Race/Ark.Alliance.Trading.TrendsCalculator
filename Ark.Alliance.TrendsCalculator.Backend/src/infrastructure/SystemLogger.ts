/**
 * @fileoverview System Logger Service
 * @module core/logging/SystemLogger
 * 
 * Centralized logging for TrendsCalculator backend
 */

export enum LogLevel {
    DEBUG = 'debug',
    INFO = 'info',
    WARN = 'warn',
    ERROR = 'error',
}

export interface LogEntry {
    level: LogLevel;
    message: string;
    source?: string;
    details?: Record<string, unknown>;
    error?: Error;
    timestamp: Date;
}

/**
 * System Logger singleton
 */
class SystemLoggerClass {
    private static instance: SystemLoggerClass;
    private logBuffer: LogEntry[] = [];
    private maxBufferSize: number = 1000;

    private constructor() { }

    static getInstance(): SystemLoggerClass {
        if (!SystemLoggerClass.instance) {
            SystemLoggerClass.instance = new SystemLoggerClass();
        }
        return SystemLoggerClass.instance;
    }

    debug(message: string, meta?: { source?: string; details?: Record<string, unknown> }): void {
        this.log(LogLevel.DEBUG, message, meta);
    }

    info(message: string, meta?: { source?: string; details?: Record<string, unknown> }): void {
        this.log(LogLevel.INFO, message, meta);
    }

    warn(message: string, meta?: { source?: string; details?: Record<string, unknown> }): void {
        this.log(LogLevel.WARN, message, meta);
    }

    error(message: string, meta?: { source?: string; details?: Record<string, unknown>; error?: Error }): void {
        this.log(LogLevel.ERROR, message, meta);
    }

    private log(level: LogLevel, message: string, meta?: { source?: string; details?: Record<string, unknown>; error?: Error }): void {
        const entry: LogEntry = {
            level,
            message,
            source: meta?.source,
            details: meta?.details,
            error: meta?.error,
            timestamp: new Date(),
        };

        // Console output
        const prefix = `[${entry.timestamp.toISOString()}] [${level.toUpperCase()}]`;
        const sourceTag = meta?.source ? ` [${meta.source}]` : '';

        switch (level) {
            case LogLevel.DEBUG:
                console.debug(`${prefix}${sourceTag} ${message}`);
                break;
            case LogLevel.INFO:
                console.info(`${prefix}${sourceTag} ${message}`);
                break;
            case LogLevel.WARN:
                console.warn(`${prefix}${sourceTag} ${message}`);
                break;
            case LogLevel.ERROR:
                console.error(`${prefix}${sourceTag} ${message}`, meta?.error || '');
                break;
        }

        // Buffer for persistence
        this.logBuffer.push(entry);
        if (this.logBuffer.length > this.maxBufferSize) {
            this.logBuffer.shift();
        }
    }

    getRecentLogs(count: number = 100): LogEntry[] {
        return this.logBuffer.slice(-count);
    }

    clearBuffer(): void {
        this.logBuffer = [];
    }
}

export const systemLogger = SystemLoggerClass.getInstance();
