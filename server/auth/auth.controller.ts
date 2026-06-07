import { Request, Response } from 'express';
import db from '../db';

export const login = (req: Request, res: Response) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Vui lòng cung cấp tài khoản và mật khẩu.' });
    }

    const query = `SELECT * FROM accounts WHERE username = ? AND password = ?`;
    db.get(query, [username, password], (err, row: any) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ message: 'Lỗi máy chủ nội bộ.' });
        }

        if (!row) {
            return res.status(401).json({ message: 'Sai tài khoản hoặc mật khẩu.' });
        }

        if (row.is_active === 0) {
            return res.status(403).json({ message: 'Tài khoản đã bị khoá.' });
        }

        // Return user info on success
        res.status(200).json({
            id: row.id,
            username: row.username,
            name: row.name,
            role: row.role,
            id_card: row.id_card,
        });
    });
};
