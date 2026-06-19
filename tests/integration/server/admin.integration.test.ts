import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../../../server/app';
import db from '../../../server/db';
import './setup'; // Run setup script to create tables and clean up

describe('Admin Integration Tests', () => {
    let semesterId: number;
    let courseId: number;
    let lecturerId: number;
    let classId: number;

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

        // Insert a test course
        courseId = await new Promise<number>((resolve, reject) => {
            db.run(
                `INSERT INTO courses (course_code, course_name, credits) VALUES (?, ?, ?)`,
                ['IT101', 'Introduction to IT', 3],
                function (err) {
                    if (err) reject(err);
                    else resolve(this.lastID);
                }
            );
        });

        // Insert a test lecturer
        lecturerId = await new Promise<number>((resolve, reject) => {
            db.run(
                `INSERT INTO accounts (username, password, name, role, is_active) VALUES (?, ?, ?, ?, ?)`,
                ['lecturer1', 'password123', 'Test Lecturer', 'lecturer', 1],
                function (err) {
                    if (err) reject(err);
                    else resolve(this.lastID);
                }
            );
        });

        // Insert an initial class course
        classId = await new Promise<number>((resolve, reject) => {
            db.run(
                `INSERT INTO classes_course (course_id, semester, detail, total_slots, occupied_slots, id_lecturer) VALUES (?, ?, ?, ?, ?, ?)`,
                [courseId, semesterId, 'Monday 1-3', 40, 0, lecturerId],
                function (err) {
                    if (err) reject(err);
                    else resolve(this.lastID);
                }
            );
        });
    });

    it('should get course registration stats', async () => {
        const response = await request(app).get(`/api/admin/course-registration-stats?semester=${semesterId}`);
        
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should create a new class course', async () => {
        const response = await request(app)
            .post('/api/admin/classes')
            .send({
                ky: 20231, // semester number
                ma_hp: 'IT101', // course code
                ma_lop: 'IT101_1',
                ma_lop_kem: '',
                ghi_chu: '',
                thu: '2',
                tiet_bd: '1',
                tiet_kt: '3',
                buoi: 'Sáng',
                phong_hoc: 'D3-101',
                can_tn: 'Không',
                teaching_type: 'LT',
                sl_max: 50
            });
        
        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe('Tạo lớp học thành công');

        const getResponse = await request(app).get(`/api/admin/classes/semester/${semesterId}`);
        expect(getResponse.body.data.length).toBe(2);
    });

    it('should get classes by semester', async () => {
        const response = await request(app).get(`/api/admin/classes/semester/${semesterId}`);
        
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(Array.isArray(response.body.data)).toBe(true);
        // The one inserted in beforeEach
        const found = response.body.data.find((c: any) => c.id === classId);
        expect(found).toBeDefined();
    });

    it('should update a class course', async () => {
        const response = await request(app)
            .put(`/api/admin/classes/${classId}`)
            .send({
                ma_lop: 'IT101_Updated',
                sl_max: 45
            });
        
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe('Cập nhật lớp học thành công');

        const getResponse = await request(app).get(`/api/admin/classes/semester/${semesterId}`);
        const updatedClass = getResponse.body.data.find((c: any) => c.id === classId);
        expect(updatedClass.ma_lop).toBe('IT101_Updated');
        expect(updatedClass.sl_max).toBe(45);
    });

    it('should delete a class course', async () => {
        const response = await request(app).delete(`/api/admin/classes/${classId}`);
        
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe('Xoá lớp học thành công');

        const getResponse = await request(app).get(`/api/admin/classes/semester/${semesterId}`);
        const found = getResponse.body.data.find((c: any) => c.id === classId);
        expect(found).toBeUndefined();
    });
});
