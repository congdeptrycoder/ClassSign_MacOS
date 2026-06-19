import { beforeAll, afterAll, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import db from '../../../server/db';

const schemaSql = fs.readFileSync(path.join(__dirname, '../../../src/infrastructure/database/schema.sql'), 'utf-8');

beforeAll(async () => {
    // Run schema.sql to create tables in the in-memory database
    await new Promise<void>((resolve, reject) => {
        db.exec(schemaSql, (err) => {
            if (err) reject(err);
            else resolve();
        });
    });
});

afterEach(async () => {
    // Clean up all tables after each test to ensure isolation
    const tables = ['student_class_registrations', 'student_courses', 'classes_course', 'classes_student', 'classes', 'program_course', 'courses', 'academic_periods', 'semesters', 'programs', 'majors', 'students', 'accounts'];
    
    for (const table of tables) {
        await new Promise<void>((resolve, reject) => {
            db.run(`DELETE FROM ${table};`, (err) => {
                if (err) reject(err);
                else resolve();
            });
        });
    }
});

afterAll(async () => {
    // Close database connection after all tests
    await new Promise<void>((resolve, reject) => {
        db.close((err) => {
            if (err) reject(err);
            else resolve();
        });
    });
});
