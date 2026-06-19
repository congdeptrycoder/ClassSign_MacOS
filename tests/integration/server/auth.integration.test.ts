import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../../../server/app';
import db from '../../../server/db';
import './setup'; // Run setup script to create tables and clean up

describe('Auth Integration Tests', () => {
    beforeEach(async () => {
        // Insert a test user
        await new Promise<void>((resolve, reject) => {
            db.run(
                `INSERT INTO accounts (username, password, name, role, is_active) VALUES (?, ?, ?, ?, ?)`,
                ['teststudent', 'password123', 'Test Student', 'student', 1],
                (err) => {
                    if (err) reject(err);
                    else resolve();
                }
            );
        });
    });

    it('should login successfully with correct credentials', async () => {
        const response = await request(app)
            .post('/api/auth/login')
            .send({
                username: 'teststudent',
                password: 'password123'
            });
        
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeDefined();
        expect(response.body.data.user.username).toBe('teststudent');
        expect(response.body.data.user.role).toBe('student');
    });

    it('should fail login with incorrect password', async () => {
        const response = await request(app)
            .post('/api/auth/login')
            .send({
                username: 'teststudent',
                password: 'wrongpassword'
            });
        
        expect(response.status).toBe(401);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe('Sai tài khoản hoặc mật khẩu.');
    });

    it('should fail login with non-existent username', async () => {
        const response = await request(app)
            .post('/api/auth/login')
            .send({
                username: 'nonexistent',
                password: 'password123'
            });
        
        expect(response.status).toBe(401);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe('Sai tài khoản hoặc mật khẩu.');
    });
});
