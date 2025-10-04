/**
 * Logger utility for Telegram Bot
 */

export interface Logger {
  info: (message: string, ...args: any[]) => void;
  error: (message: string, ...args: any[]) => void;
  warn: (message: string, ...args: any[]) => void;
  debug: (message: string, ...args: any[]) => void;
}

class TelegramLogger implements Logger {
  private formatMessage(level: string, message: string, ...args: any[]): string {
    const timestamp = new Date().toISOString();
    const formattedArgs = args.length > 0 ? ' ' + args.map(arg => 
      typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
    ).join(' ') : '';
    
    return `[${timestamp}] [${level}] ${message}${formattedArgs}`;
  }

  info(message: string, ...args: any[]): void {
    console.log(this.formatMessage('INFO', message, ...args));
  }

  error(message: string, ...args: any[]): void {
    console.error(this.formatMessage('ERROR', message, ...args));
  }

  warn(message: string, ...args: any[]): void {
    console.warn(this.formatMessage('WARN', message, ...args));
  }

  debug(message: string, ...args: any[]): void {
    if (process.env.NODE_ENV === 'development') {
      console.debug(this.formatMessage('DEBUG', message, ...args));
    }
  }
}

// Create singleton logger instance
export const logger = new TelegramLogger();

// Export default logger
export default logger;