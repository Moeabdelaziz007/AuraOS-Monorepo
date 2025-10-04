/**
 * Simple logger utility
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

class Logger {
  private isDevelopment = import.meta.env.DEV;

  debug(...args: any[]) {
    if (this.isDevelopment) {
      console.debug('[DEBUG]', ...args);
    }
  }

  info(...args: any[]) {
    console.info('[INFO]', ...args);
  }

  warn(...args: any[]) {
    console.warn('[WARN]', ...args);
  }

  error(...args: any[]) {
    console.error('[ERROR]', ...args);
  }

  log(level: LogLevel, ...args: any[]) {
    this[level](...args);
  }
}

export const logger = new Logger();
export default logger;
