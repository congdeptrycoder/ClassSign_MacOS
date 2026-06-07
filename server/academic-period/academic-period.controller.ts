import { Request, Response } from 'express';
import db from '../db';

export const getAllAcademicPeriods = (req: Request, res: Response) => {
    const query = `
        SELECT a.*, s.semester as semester_name 
        FROM academic_periods a
        LEFT JOIN semesters s ON a.semester = s.id
        ORDER BY a.created_at DESC
    `;
    db.all(query, [], (err, rows: any[]) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ message: 'Lỗi máy chủ nội bộ.' });
        }

        const now = new Date();
        let needsUpdate = false;
        
        // Cập nhật is_active = 0 nếu hết hạn
        const periodsToUpdate = rows.filter(row => {
            if (row.is_active === 1 && new Date(row.end_date) < now) {
                row.is_active = 0;
                return true;
            }
            return false;
        });

        if (periodsToUpdate.length > 0) {
            const updateStmt = db.prepare('UPDATE academic_periods SET is_active = 0 WHERE id = ?');
            periodsToUpdate.forEach(period => {
                updateStmt.run(period.id);
            });
            updateStmt.finalize();
        }

        res.status(200).json(rows);
    });
};

export const createAcademicPeriod = (req: Request, res: Response) => {
    const { semester, period_type, start_date, end_date } = req.body;

    if (!semester || !period_type || !start_date || !end_date) {
        return res.status(400).json({ message: 'Vui lòng cung cấp đầy đủ thông tin.' });
    }

    // Set các period cũ về inactive
    db.run(`UPDATE academic_periods SET is_active = 0 WHERE is_active = 1`, function(err) {
        if (err) {
            console.error('Lỗi khi update is_active:', err);
            return res.status(500).json({ message: 'Lỗi máy chủ nội bộ.' });
        }

        const insertQuery = `
            INSERT INTO academic_periods (semester, period_type, start_date, end_date, is_active)
            VALUES (?, ?, ?, ?, 1)
        `;
        db.run(insertQuery, [semester, period_type, start_date, end_date], function(insertErr) {
            if (insertErr) {
                console.error('Lỗi khi insert:', insertErr);
                return res.status(500).json({ message: 'Lỗi máy chủ nội bộ.' });
            }
            
            res.status(201).json({ id: this.lastID, message: 'Tạo kế hoạch đăng ký thành công.' });
        });
    });
};

export const deleteAcademicPeriod = (req: Request, res: Response) => {
    const { id } = req.params;
    
    const query = `DELETE FROM academic_periods WHERE id = ?`;
    db.run(query, [id], function(err) {
        if (err) {
            console.error('Lỗi khi delete:', err);
            return res.status(500).json({ message: 'Lỗi máy chủ nội bộ.' });
        }
        res.status(200).json({ message: 'Xóa kế hoạch đăng ký thành công.' });
    });
};
