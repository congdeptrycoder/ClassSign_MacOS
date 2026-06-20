import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Logger } from '../../../../src/shared/utils/logger';
import { apiClient } from '../../../../src/infrastructure/api/apiClient';

vi.mock('../../../../src/infrastructure/api/apiClient', () => ({
    apiClient: {
        post: vi.fn(),
    },
}));

describe('Client Logger', () => {
    let consoleLogSpy: any;
    let consoleWarnSpy: any;
    let consoleErrorSpy: any;

    beforeEach(() => {
        vi.clearAllMocks();
        consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
        consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
        consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        consoleLogSpy.mockRestore();
        consoleWarnSpy.mockRestore();
        consoleErrorSpy.mockRestore();
    });

    it('should log INFO level to console and server', async () => {
        (apiClient.post as any).mockResolvedValue({});
        await Logger.log('INFO', 'Test info');

        expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('[INFO] Test info'));
        expect(apiClient.post).toHaveBeenCalledWith('/logs', expect.objectContaining({
            level: 'INFO',
            message: 'Test info'
        }));
    });

    it('should log WARN level to console and server', async () => {
        (apiClient.post as any).mockResolvedValue({});
        await Logger.log('WARN', 'Test warning');

        expect(consoleWarnSpy).toHaveBeenCalledWith(expect.stringContaining('[WARN] Test warning'));
        expect(apiClient.post).toHaveBeenCalledWith('/logs', expect.objectContaining({
            level: 'WARN',
            message: 'Test warning'
        }));
    });

    it('should log ERROR level to console and server', async () => {
        (apiClient.post as any).mockResolvedValue({});
        await Logger.log('ERROR', 'Test error');

        expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('[ERROR] Test error'));
        expect(apiClient.post).toHaveBeenCalledWith('/logs', expect.objectContaining({
            level: 'ERROR',
            message: 'Test error'
        }));
    });

    it('should handle API errors gracefully', async () => {
        (apiClient.post as any).mockRejectedValue(new Error('Network error'));
        await Logger.log('INFO', 'Test catch error');

        expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('[INFO] Test catch error'));
        expect(consoleWarnSpy).toHaveBeenCalledWith(expect.stringContaining('Failed to send log to server'), expect.any(Error));
    });

    it('should provide convenience wrappers', () => {
        const logSpy = vi.spyOn(Logger, 'log').mockResolvedValue();

        Logger.info('info message');
        expect(logSpy).toHaveBeenCalledWith('INFO', 'info message');

        Logger.warn('warn message');
        expect(logSpy).toHaveBeenCalledWith('WARN', 'warn message');

        Logger.error('error message');
        expect(logSpy).toHaveBeenCalledWith('ERROR', 'error message');

        logSpy.mockRestore();
    });
});
