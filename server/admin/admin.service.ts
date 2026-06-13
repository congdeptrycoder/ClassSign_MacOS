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

    createClassCourse(data: any): Promise<void> {
        return new Promise((resolve, reject) => {
            // First look up semester id
            db.get(`SELECT id FROM semesters WHERE semester = ?`, [data.ky], (err, row1: any) => {
                if (err) return reject(err);
                if (!row1) return reject(new Error("Không tìm thấy kỳ học"));
                
                const semester_id = row1.id;
                
                // Then look up course id
                db.get(`SELECT id FROM courses WHERE course_code = ?`, [data.ma_hp], (err, row2: any) => {
                    if (err) return reject(err);
                    if (!row2) return reject(new Error("Không tìm thấy học phần"));
                    
                    const course_id = row2.id;
                    
                    const detailJSON = JSON.stringify({
                        ma_lop: data.ma_lop,
                        ma_lop_kem: data.ma_lop_kem,
                        ghi_chu: data.ghi_chu,
                        thu: data.thu,
                        tiet_bd: data.tiet_bd,
                        tiet_kt: data.tiet_kt,
                        buoi: data.buoi,
                        phong_hoc: data.phong_hoc,
                        can_tn: data.can_tn,
                        teaching_type: data.teaching_type
                    });
                    
                    const query = `
                        INSERT INTO classes_course (course_id, semester, detail, total_slots, occupied_slots)
                        VALUES (?, ?, ?, ?, 0)
                    `;
                    
                    db.run(query, [course_id, semester_id, detailJSON, data.sl_max || 0], function(err) {
                        if (err) return reject(err);
                        resolve();
                    });
                });
            });
        });
    }

    updateClassCourse(id: number, data: any): Promise<void> {
        return new Promise((resolve, reject) => {
            const detailJSON = JSON.stringify({
                ma_lop: data.ma_lop,
                ma_lop_kem: data.ma_lop_kem,
                ghi_chu: data.ghi_chu,
                thu: data.thu,
                tiet_bd: data.tiet_bd,
                tiet_kt: data.tiet_kt,
                buoi: data.buoi,
                phong_hoc: data.phong_hoc,
                can_tn: data.can_tn,
                teaching_type: data.teaching_type
            });
            
            const query = `
                UPDATE classes_course 
                SET detail = ?, total_slots = ?
                WHERE id = ?
            `;
            
            db.run(query, [detailJSON, data.sl_max || 0, id], function(err) {
                if (err) return reject(err);
                resolve();
            });
        });
    }

    getClassesByCourse(semester: number, courseId: number): Promise<any[]> {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT 
                    id AS class_id,
                    total_slots AS sl_max,
                    occupied_slots AS sl_dk,
                    detail
                FROM classes_course
                WHERE semester = ? AND course_id = ?
            `;
            db.all(query, [semester, courseId], (err, rows) => {
                if (err) return reject(err);
                
                // Parse detail JSON for each row
                const formattedRows = rows.map((row: any) => {
                    let detailObj = {};
                    try {
                        detailObj = JSON.parse(row.detail || '{}');
                    } catch(e) {}
                    
                    return {
                        id: row.class_id,
                        sl_max: row.sl_max,
                        sl_dk: row.sl_dk,
                        ...detailObj
                    };
                });
                
                resolve(formattedRows);
            });
        });
    }

    deleteClassCourse(classId: number): Promise<void> {
        return new Promise((resolve, reject) => {
            const query = `DELETE FROM classes_course WHERE id = ?`;
            db.run(query, [classId], function(err) {
                if (err) return reject(err);
                resolve();
            });
        });
    }

    getAllClassesBySemester(semester: number): Promise<any[]> {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT 
                    cc.id AS class_id,
                    c.course_code AS ma_hp,
                    c.course_name AS ten_hp,
                    c.credits AS khoi_luong,
                    m.major_name AS khoa_truong,
                    cc.total_slots AS sl_max,
                    cc.occupied_slots AS sl_dk,
                    s.semester AS ky_hoc,
                    cc.detail
                FROM classes_course cc
                JOIN courses c ON cc.course_id = c.id
                JOIN semesters s ON cc.semester = s.id
                LEFT JOIN (
                    SELECT course_id, MIN(program_id) as program_id 
                    FROM program_course 
                    GROUP BY course_id
                ) pc ON c.id = pc.course_id
                LEFT JOIN programs p ON pc.program_id = p.id
                LEFT JOIN majors m ON p.major_id = m.id
                WHERE cc.semester = ?
            `;
            db.all(query, [semester], (err, rows) => {
                if (err) return reject(err);
                
                const formattedRows = rows.map((row: any) => {
                    let detailObj = {};
                    try {
                        detailObj = JSON.parse(row.detail || '{}');
                    } catch(e) {}
                    
                    return {
                        id: row.class_id,
                        ky: row.ky_hoc?.toString() || '',
                        ma_hp: row.ma_hp,
                        ten_hp: row.ten_hp,
                        khoa_truong: row.khoa_truong,
                        khoi_luong: row.khoi_luong?.toString() || '',
                        sl_max: row.sl_max,
                        sl_dk: row.sl_dk,
                        ...detailObj
                    };
                });
                
                resolve(formattedRows);
            });
        });
    }
}
