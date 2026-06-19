import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../../../server/app';
import db from '../../../server/db';
import './setup'; // Run setup script to create tables and clean up

describe('Semester Integration Tests', () => {
    beforeEach(async () => {
        // Insert a test semester
        await new Promise<void>((resolve, reject) => {
            db.run(
                `INSERT INTO semesters (semester, is_active) VALUES (?, ?)`,
                [20231, 1],
                (err) => {
                    if (err) reject(err);
                    else resolve();
                }
            );
        });
    });

    it('should get all semesters', async () => {
        const response = await request(app)
            .get('/api/semesters');
        
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(Array.isArray(response.body.data)).toBe(true);
        expect(response.body.data.length).toBe(1);
        expect(response.body.data[0].semester).toBe(20231);
        expect(response.body.data[0].is_active).toBe(1);
    });

    it('should create a new semester successfully', async () => {
        const response = await request(app)
            .post('/api/semesters')
            .send({
                semester: '20232'
            });
        
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.message).toBe('Thêm kỳ thành công');

        // Verify it was added
        const getResponse = await request(app).get('/api/semesters');
        expect(getResponse.body.data.length).toBe(2);
        // Order is descending by semester, so 20232 should be first
        const addedSemester = getResponse.body.data.find((s: any) => s.semester === 20232);
        expect(addedSemester).toBeDefined();
        expect(addedSemester.is_active).toBe(0); // Default is_active = 0
    });

    it('should fail to create semester with invalid data', async () => {
        const response = await request(app)
            .post('/api/semesters')
            .send({}); // missing semester field
        
        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe('Mã kỳ không hợp lệ.');
    });
});
