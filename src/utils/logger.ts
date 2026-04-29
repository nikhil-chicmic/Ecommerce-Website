import { ENV } from '../config/env';

type LogLevel = 'info' | 'warn' | 'error';

class Logger {
  private log(level: LogLevel, message: string, data?: any) {
    if (ENV.IS_PROD && level === 'info') return; // Skip info logs in prod
    
    const timestamp = new Date().toISOString();
    const logData = data ? data : '';

    switch (level) {
      case 'info':
        console.log(`[INFO] ${timestamp}: ${message}`, logData);
        break;
      case 'warn':
        console.warn(`[WARN] ${timestamp}: ${message}`, logData);
        break;
      case 'error':
        console.error(`[ERROR] ${timestamp}: ${message}`, logData);
        break;
    }
  }

  info(message: string, data?: any) {
    this.log('info', message, data);
  }

  warn(message: string, data?: any) {
    this.log('warn', message, data);
  }

  error(message: string, error?: any) {
    this.log('error', message, error);
  }
}

export const logger = new Logger();
