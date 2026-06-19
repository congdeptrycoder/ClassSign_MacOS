import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../../../server/app';
import db from '../../../server/db';
import './setup'; // Run setup script to create tables and clean up

describe('Academic Period Integration Tests', () => {
    let semesterId: number;
    let periodId: number;

    beforeEach(async () => {
        // Insert a test semester
        semesterId = await new Promise<number>((resolve, reject) => {
            db.run(
                `INSERT INTO semesters (semester, is_active) VALUES (?, ?)`,
                [20231, 1],
                function (err) {
                    if (err) reject(err);
                    else resolve(this.lastID);
                }
            );
        });

        // Insert a test academic period
        periodId = await new Promise<number>((resolve, reject) => {
            db.run(
                `INSERT INTO academic_periods (semester, period_type, start_date, end_date, is_active) VALUES (?, ?, ?, ?, ?)`,
                [semesterId, 'register_program', '2023-01-01', '2023-02-01', 1],
                function (err) {
                    if (err) reject(err);
                    else resolve(this.lastID);
                }
            );
        });
    });

    it('should get all academic periods', async () => {
        const response = await request(app).get('/api/academic-periods');
        
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(Array.isArray(response.body.data)).toBe(true);
        expect(response.body.data.length).toBe(1);
        expect(response.body.data[0].semester).toBe(semesterId);
        expect(response.body.data[0].period_type).toBe('register_program');
    });

    it('should create a new academic period successfully', async () => {
        const response = await request(app)
            .post('/api/academic-periods')
            .send({
                semester: semesterId,
                period_type: 'register_class',
                start_date: '2099-03-01',
                end_date: '2099-04-01'
            });
        
        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe('Tạo kế hoạch đăng ký thành công.');
        expect(response.body.data.id).toBeDefined();

        // Verify old active period is set to 0 and new one is 1
        const getResponse = await request(app).get('/api/academic-periods');
        const oldPeriod = getResponse.body.data.find((p: any) => p.id === periodId);
        const newPeriod = getResponse.body.data.find((p: any) => p.id === response.body.data.id);
        
        expect(oldPeriod.is_active).toBe(0);
        expect(newPeriod.is_active).toBe(1);
    });

    it('should update an existing academic period', async () => {
        const response = await request(app)
            .put(`/api/academic-periods/${periodId}`)
            .send({
                semester: semesterId,
                period_type: 'register_program',
                start_date: '2023-01-01',
                end_date: '2023-02-15' // Updated end date
            });
        
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe('Cập nhật kế hoạch đăng ký thành công.');

        const getResponse = await request(app).get('/api/academic-periods');
        const updatedPeriod = getResponse.body.data.find((p: any) => p.id === periodId);
        expect(updatedPeriod.end_date).toBe('2023-02-15');
    });

    it('should delete an existing academic period', async () => {
        const response = await request(app)
            .delete(`/api/academic-periods/${periodId}`);
        
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe('Xóa kế hoạch đăng ký thành công.');

        const getResponse = await request(app).get('/api/academic-periods');
        expect(getResponse.body.data.length).toBe(0);
    });
});
