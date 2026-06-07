import { Request, Response } from 'express';
import db from '../db';

export const getAllSemesters = (req: Request, res: Response) => {
    const query = `SELECT * FROM semesters ORDER BY semester DESC`;
    db.all(query, [], (err, rows) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ message: 'Lỗi máy chủ nội bộ.' });
        }
        res.status(200).json(rows);
    });
};
