// ─── Why build Logger before Pages/Modules? ──────────────────────────────────
// Logger is a dependency of Modules. If we build Modules first,
// we'd need to stub the logger. Build dependencies before dependents.

export enum LogLevel {
    DEBUG = 'DEBUG',
    INFO = 'INFO',
    WARN = 'WARN',
    ERROR = 'ERROR',
}

// ─── Enum explained ─────────────────────────────────────────────────────────
// enum creates a named set of constants.
// LogLevel.INFO compiles to the string 'INFO'.
// The advantage over plain strings: TypeScript errors if you write
// LogLevel.INOF (typo) — you'd never catch 'INOF' in a plain string.

export class Logger {
    private context: string;
    
    // static = belongs to the CLASS, not to any instance
    // All Logger instances share the same logLevel
    private static logLevel: LogLevel = LogLevel.INFO;

    constructor(context: string) {
        this.context = context;
    }

    // ─── Factory Method Pattern ──────────────────────────────────────────────
    // Logger.create('LoginModule') instead of new Logger('LoginModule')
    // Benefit: in the future, we can add caching here (return existing
    // logger for same context) without changing any call sites
    static create(context: string): Logger {
        return new Logger(context);
    }

    static setLogLevel(level: LogLevel): void {
        Logger.logLevel = level;
    }

    private formatMessage(level: LogLevel, message: string): string {
        const timestamp = new Date().toISOString();
        // Output: [2026-05-15T10:30:00.000Z] [INFO] [LoginModule] Login successful
        return `[${timestamp}] [${level}] [${this.context}] ${message}`;
    }

    private shouldLog(level: LogLevel): boolean {
        const hierarchy = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR];
        // If current message level is >= configured minimum level, log it
        return hierarchy.indexOf(level) >= hierarchy.indexOf(Logger.logLevel);
    }

    debug(message: string): void {
        if (this.shouldLog(LogLevel.DEBUG)) {
            console.debug(this.formatMessage(LogLevel.DEBUG, message));
        }
    }

    info(message: string): void {
        if (this.shouldLog(LogLevel.INFO)) {
            console.info(this.formatMessage(LogLevel.INFO, message));
        }
    }

    warn(message: string): void {
        if (this.shouldLog(LogLevel.WARN)) {
            console.warn(this.formatMessage(LogLevel.WARN, message));
        }
    }

    error(message: string, error?: unknown): void {
        if (this.shouldLog(LogLevel.ERROR)) {
            console.error(this.formatMessage(LogLevel.ERROR, message), error ?? '');
        }
    }

    // ─── Test-specific logging ───────────────────────────────────────────────
    // These are convenience methods that give consistent log formatting
    // for test lifecycle events. Every team member writes steps the same way.

    step(stepNumber: number, description: string): void {
        this.info(`Step ${stepNumber}: ${description}`);
    }

    testStart(testName: string): void {
        this.info(`========== START: ${testName} ==========`);
    }

    testEnd(testName: string): void {
        this.info(`========== END: ${testName} ==========`);
    }
}