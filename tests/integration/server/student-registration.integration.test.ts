import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../../../server/app';
import db from '../../../server/db';
import './setup';

describe('Student Registration Integration Tests', () => {
    let studentId: number;
    let semesterId: number;
    let courseId: number;
    let classCourseId: number;

    beforeEach(async () => {
        // Create student account
        studentId = await new Promise<number>((resolve, reject) => {
            db.run(
                `INSERT INTO accounts (username, password, name, role) VALUES (?, ?, ?, ?)`,
                ['student1', 'pass', 'Test Student', 'student'],
                function (err) {
                    if (err) reject(err);
                    else resolve(this.lastID);
                }
            );
        });

        await new Promise<void>((resolve, reject) => {
            db.run(`INSERT INTO students (id, status) VALUES (?, ?)`, [studentId, 'study'], (err) => err ? reject(err) : resolve());
        });

        // Create Major
        const majorId = await new Promise<number>((resolve, reject) => {
            db.run(`INSERT INTO majors (major_code, major_name) VALUES (?, ?)`, ['IT', 'Information Tech'], function (err) { err ? reject(err) : resolve(this.lastID) });
        });

        // Create Program
        const programId = await new Promise<number>((resolve, reject) => {
            db.run(`INSERT INTO programs (program_code, program_name, major_id) VALUES (?, ?, ?)`, ['IT_PROG', 'IT Program', majorId], function (err) { err ? reject(err) : resolve(this.lastID) });
        });

        // Create Class for Student
        const classId = await new Promise<number>((resolve, reject) => {
            db.run(`INSERT INTO classes (class_name, program_id) VALUES (?, ?)`, ['IT1', programId], function (err) { err ? reject(err) : resolve(this.lastID) });
        });

        // Assign student to class
        await new Promise<void>((resolve, reject) => {
            db.run(`INSERT INTO classes_student (id_class, id_account) VALUES (?, ?)`, [classId, studentId], (err) => err ? reject(err) : resolve());
        });

        // Create Course
        courseId = await new Promise<number>((resolve, reject) => {
            db.run(`INSERT INTO courses (course_code, course_name, credits) VALUES (?, ?, ?)`, ['IT101', 'Intro IT', 3], function (err) { err ? reject(err) : resolve(this.lastID) });
        });

        // Add Course to Program
        await new Promise<void>((resolve, reject) => {
            db.run(`INSERT INTO program_course (program_id, course_id) VALUES (?, ?)`, [programId, courseId], (err) => err ? reject(err) : resolve());
        });

        // Create Semester
        semesterId = await new Promise<number>((resolve, reject) => {
            db.run(`INSERT INTO semesters (semester, is_active) VALUES (?, ?)`, [20231, 1], function (err) { err ? reject(err) : resolve(this.lastID) });
        });

        // Create Academic Periods (both program and class registration active)
        await new Promise<void>((resolve, reject) => {
            db.run(`INSERT INTO academic_periods (semester, period_type, start_date, end_date, is_active) VALUES (?, ?, ?, ?, ?)`, 
                [semesterId, 'register_program', '2000-01-01', '2099-12-31', 1], (err) => err ? reject(err) : resolve());
        });
        await new Promise<void>((resolve, reject) => {
            db.run(`INSERT INTO academic_periods (semester, period_type, start_date, end_date, is_active) VALUES (?, ?, ?, ?, ?)`, 
                [semesterId, 'register_class', '2000-01-01', '2099-12-31', 1], (err) => err ? reject(err) : resolve());
        });

        // Create Class Course
        classCourseId = await new Promise<number>((resolve, reject) => {
            db.run(`INSERT INTO classes_course (course_id, semester, detail, total_slots, occupied_slots) VALUES (?, ?, ?, ?, ?)`, 
                [courseId, semesterId, '{"thu":2,"tiet_bd":1,"tiet_kt":3}', 50, 0], function (err) { err ? reject(err) : resolve(this.lastID) });
        });
    });

    it('should get student curriculum', async () => {
        const response = await request(app).get(`/api/students/${studentId}/curriculum`);
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.courses.length).toBe(1);
        expect(response.body.data.courses[0].code).toBe('IT101');
    });

    it('should register for a course', async () => {
        const response = await request(app)
            .post(`/api/students/${studentId}/course-registrations`)
            .send({ courseId });
        
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.course.courseId).toBe(courseId);

        // Check registered courses
        const getResponse = await request(app).get(`/api/students/${studentId}/registered-courses`);
        expect(getResponse.body.data.length).toBe(1);
        expect(getResponse.body.data[0].courseId).toBe(courseId);
    });

    it('should get class suggestions and register for a class', async () => {
        // Pre-register course to be eligible for class registration
        await request(app).post(`/api/students/${studentId}/course-registrations`).send({ courseId });

        // Get Class Suggestions
        const suggestResponse = await request(app).get(`/api/students/${studentId}/courses/${courseId}/classes`);
        expect(suggestResponse.status).toBe(200);
        expect(suggestResponse.body.data.length).toBe(1);
        expect(suggestResponse.body.data[0].id).toBe(classCourseId);

        // Register for class
        const registerResponse = await request(app)
            .post(`/api/students/${studentId}/class-registrations`)
            .send({ classId: classCourseId });
        
        expect(registerResponse.status).toBe(200);
        expect(registerResponse.body.success).toBe(true);

        // Check timetable
        const timetableResponse = await request(app).get(`/api/students/${studentId}/timetable`);
        expect(timetableResponse.status).toBe(200);
        expect(timetableResponse.body.data.length).toBe(1);
        expect(timetableResponse.body.data[0].classId).toBe(classCourseId);
    });

    it('should cancel course registration', async () => {
        await request(app).post(`/api/students/${studentId}/course-registrations`).send({ courseId });
        
        const deleteResponse = await request(app).delete(`/api/students/${studentId}/course-registrations/${courseId}`);
        expect(deleteResponse.status).toBe(200);
        expect(deleteResponse.body.success).toBe(true);

        const getResponse = await request(app).get(`/api/students/${studentId}/registered-courses`);
        expect(getResponse.body.data.length).toBe(0);
    });

    it('should cancel class registration', async () => {
        await request(app).post(`/api/students/${studentId}/course-registrations`).send({ courseId });
        await request(app).post(`/api/students/${studentId}/class-registrations`).send({ classId: classCourseId });
        
        const deleteResponse = await request(app).delete(`/api/students/${studentId}/class-registrations/${classCourseId}`);
        expect(deleteResponse.status).toBe(200);
        expect(deleteResponse.body.success).toBe(true);

        const timetableResponse = await request(app).get(`/api/students/${studentId}/timetable`);
        expect(timetableResponse.body.data.length).toBe(0);
    });
});
