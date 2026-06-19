import { Request, Response } from 'express';
import db from '../db';
import { sendError, sendSuccess } from '../httpResponse';

export const getAllSemesters = (_req: Request, res: Response) => {
  const query = 'SELECT * FROM semesters ORDER BY semester DESC';

  db.all(query, [], (err, rows) => {
    if (err) {
      console.error('Database error:', err);
      return sendError(res, 500, 'Lỗi máy chủ nội bộ.');
    }

    return sendSuccess(res, rows);
  });
};

export const createSemester = (req: Request, res: Response) => {
  const { semester } = req.body;
  
  if (!semester || typeof semester !== 'string') {
    return sendError(res, 400, 'Mã kỳ không hợp lệ.');
  }

  const query = 'INSERT INTO semesters (semester, is_active) VALUES (?, 0)';
  
  db.run(query, [semester.trim()], function(err) {
    if (err) {
      console.error('Database error:', err);
      if (err.message.includes('UNIQUE constraint failed')) {
        return sendError(res, 400, 'Học kỳ này đã tồn tại.');
      }
      return sendError(res, 500, 'Lỗi máy chủ nội bộ.');
    }
    
    return sendSuccess(res, { message: 'Thêm kỳ thành công' }, 201);
  });
};
