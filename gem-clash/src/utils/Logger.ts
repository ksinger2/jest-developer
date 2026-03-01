/**
 * Gem Link — Logger Utility
 * Owner: Frontend Lead Engineer
 * Task: TASK-001
 *
 * Singleton-style logger with module tagging.
 * Output format: [ModuleName.method] message { optional data }
 *
 * Usage:
 *   const logger = new Logger('BootScene');
 *   logger.info('create', 'Transitioning to PreloadScene');
 *   // => [BootScene.create] Transitioning to PreloadScene
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

export class Logger {
  private static globalLevel: LogLevel = LogLevel.DEBUG;
  private module: string;

  constructor(module: string) {
    this.module = module;
  }

  /** Set the minimum log level globally. Messages below this level are suppressed. */
  static setLevel(level: LogLevel): void {
    Logger.globalLevel = level;
  }

  /** Get the current global log level. */
  static getLevel(): LogLevel {
    return Logger.globalLevel;
  }

  /** Format the log prefix: [Module.method] */
  private formatPrefix(method: string): string {
    return `[${this.module}.${method}]`;
  }

  debug(method: string, message: string, data?: unknown): void {
    if (Logger.globalLevel > LogLevel.DEBUG) return;
    const prefix = this.formatPrefix(method);
    if (data !== undefined) {
      console.debug(`${prefix} ${message}`, data);
    } else {
      console.debug(`${prefix} ${message}`);
    }
  }

  info(method: string, message: string, data?: unknown): void {
    if (Logger.globalLevel > LogLevel.INFO) return;
    const prefix = this.formatPrefix(method);
    if (data !== undefined) {
      console.info(`${prefix} ${message}`, data);
    } else {
      console.info(`${prefix} ${message}`);
    }
  }

  warn(method: string, message: string, data?: unknown): void {
    if (Logger.globalLevel > LogLevel.WARN) return;
    const prefix = this.formatPrefix(method);
    if (data !== undefined) {
      console.warn(`${prefix} ${message}`, data);
    } else {
      console.warn(`${prefix} ${message}`);
    }
  }

  error(method: string, message: string, error?: unknown): void {
    if (Logger.globalLevel > LogLevel.ERROR) return;
    const prefix = this.formatPrefix(method);
    if (error !== undefined) {
      console.error(`${prefix} ${message}`, error);
    } else {
      console.error(`${prefix} ${message}`);
    }
  }
}
