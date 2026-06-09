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
