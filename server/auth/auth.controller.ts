import { Request, Response } from 'express';
import db from '../db';
import { sendError, sendSuccess } from '../httpResponse';

export const login = (req: Request, res: Response) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return sendError(res, 400, 'Vui lòng cung cấp tài khoản và mật khẩu.');
  }

  const query = `
    SELECT a.id, a.username, a.name, a.role, a.id_card, a.is_active, s.status
    FROM accounts a
    LEFT JOIN students s ON a.id = s.id
    WHERE a.username = ? AND a.password = ?
  `;

  db.get(query, [username, password], (err, row: any) => {
    if (err) {
      console.error('Database error:', err);
      return sendError(res, 500, 'Lỗi máy chủ nội bộ.');
    }

    if (!row) {
      return sendError(res, 401, 'Sai tài khoản hoặc mật khẩu.');
    }

    if (row.is_active === 0) {
      return sendError(res, 403, 'Tài khoản đã bị khoá.');
    }

    return sendSuccess(res, {
      user: {
        id: row.id,
        username: row.username,
        name: row.name,
        role: row.role,
        id_card: row.id_card,
        status: row.status,
      },
    });
  });
};
