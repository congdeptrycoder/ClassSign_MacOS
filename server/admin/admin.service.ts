import db from '../db';

export class AdminService {
    getCourseRegistrationStats(semester: number): Promise<any[]> {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT 
                    c.id AS course_id,
                    c.course_code AS ma_hp,
                    c.course_name AS ten_hp,
                    m.major_name AS truong_khoa,
                    COUNT(sc.student_id) AS so_luong_dang_ky,
                    COALESCE(cls.so_luong_lop, 0) AS so_luong_lop,
                    COALESCE(cls.so_luong_dk_toi_da, 0) AS so_luong_dk_toi_da
                FROM courses c
                JOIN student_courses sc ON c.id = sc.course_id
                LEFT JOIN (
                    SELECT course_id, MIN(program_id) as program_id 
                    FROM program_course 
                    GROUP BY course_id
                ) pc ON c.id = pc.course_id
                LEFT JOIN programs p ON pc.program_id = p.id
                LEFT JOIN majors m ON p.major_id = m.id
                LEFT JOIN (
                    SELECT course_id, COUNT(id) as so_luong_lop, SUM(total_slots) as so_luong_dk_toi_da
                    FROM classes_course
                    WHERE semester = ?
                    GROUP BY course_id
                ) cls ON c.id = cls.course_id
                WHERE sc.semester = ?
                GROUP BY c.id, c.course_code, c.course_name, m.major_name, cls.so_luong_lop, cls.so_luong_dk_toi_da
            `;
            db.all(query, [semester, semester], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }
}
