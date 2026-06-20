import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../../../server/app';
import fs from 'fs';
import path from 'path';

describe('Logs Integration Tests', () => {
    it('should write log messages to the client log file', async () => {
        const testMessage = `Test integration log message ${Date.now()}`;
        const response = await request(app)
            .post('/api/logs')
            .send({
                level: 'WARN',
                message: testMessage,
                timestamp: new Date().toISOString()
            });

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);

        // Verify the file was updated
        const logPath = path.join(__dirname, '../../../logs/client.log');
        expect(fs.existsSync(logPath)).toBe(true);
        const logsContent = fs.readFileSync(logPath, 'utf8');
        expect(logsContent).toContain(testMessage);
        expect(logsContent).toContain('[WARN]');
    });
});
