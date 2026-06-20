import { apiClient } from '../../infrastructure/api/apiClient';

export class Logger {
    static async log(level: 'INFO' | 'WARN' | 'ERROR', message: string): Promise<void> {
        const timestamp = new Date().toISOString();
        const consoleMsg = `[${timestamp}] [${level}] ${message}`;
        
        if (level === 'ERROR') {
            console.error(consoleMsg);
        } else if (level === 'WARN') {
            console.warn(consoleMsg);
        } else {
            console.log(consoleMsg);
        }

        try {
            await apiClient.post('/logs', {
                level,
                message,
                timestamp
            });
        } catch (error) {
            console.warn('Failed to send log to server:', error);
        }
    }

    static info(message: string): void {
        this.log('INFO', message).catch(() => {});
    }

    static warn(message: string): void {
        this.log('WARN', message).catch(() => {});
    }

    static error(message: string): void {
        this.log('ERROR', message).catch(() => {});
    }
}
