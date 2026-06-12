import { Request, Response } from 'express';
import db from '../db';
import { sendError, sendSuccess } from '../httpResponse';

export const getAllAcademicPeriods = (_req: Request, res: Response) => {
  const query = `
    SELECT a.*, s.semester as semester_name
    FROM academic_periods a
    LEFT JOIN semesters s ON a.semester = s.id
    ORDER BY a.created_at DESC
  `;

  db.all(query, [], (err, rows: any[]) => {
    if (err) {
      console.error('Database error:', err);
      return sendError(res, 500, 'Lỗi máy chủ nội bộ.');
    }

    const now = new Date();
    const periodsToUpdate = rows.filter(row => {
      if (row.is_active === 1 && new Date(row.end_date) < now) {
        row.is_active = 0;
        return true;
      }
      return false;
    });

    if (periodsToUpdate.length === 0) {
      return sendSuccess(res, rows);
    }

    const updateStmt = db.prepare(
      'UPDATE academic_periods SET is_active = 0 WHERE id = ?'
    );

    periodsToUpdate.forEach(period => {
      updateStmt.run(period.id);
    });
    updateStmt.finalize(updateErr => {
      if (updateErr) {
        console.error('Database error:', updateErr);
        return sendError(res, 500, 'Lỗi máy chủ nội bộ.');
      }

      return sendSuccess(res, rows);
    });
  });
};

export const createAcademicPeriod = (req: Request, res: Response) => {
  const { semester, period_type, start_date, end_date } = req.body;

  if (!semester || !period_type || !start_date || !end_date) {
    return sendError(res, 400, 'Vui lòng cung cấp đầy đủ thông tin.');
  }

  db.run(
    'UPDATE academic_periods SET is_active = 0 WHERE is_active = 1',
    updateErr => {
      if (updateErr) {
        console.error('Database error:', updateErr);
        return sendError(res, 500, 'Lỗi máy chủ nội bộ.');
      }

      const insertQuery = `
        INSERT INTO academic_periods (semester, period_type, start_date, end_date, is_active)
        VALUES (?, ?, ?, ?, 1)
      `;

      db.run(
        insertQuery,
        [semester, period_type, start_date, end_date],
        function insertPeriod(insertErr) {
          if (insertErr) {
            console.error('Database error:', insertErr);
            return sendError(res, 500, 'Lỗi máy chủ nội bộ.');
          }

          return sendSuccess(
            res,
            { id: this.lastID },
            'Tạo kế hoạch đăng ký thành công.',
            201
          );
        }
      );
    }
  );
};

export const updateAcademicPeriod = (req: Request, res: Response) => {
  const { id } = req.params;
  const { semester, period_type, start_date, end_date } = req.body;

  if (!semester || !period_type || !start_date || !end_date) {
    return sendError(res, 400, 'Vui lòng cung cấp đầy đủ thông tin.');
  }

  const updateQuery = `
    UPDATE academic_periods 
    SET semester = ?, period_type = ?, start_date = ?, end_date = ?
    WHERE id = ?
  `;

  db.run(updateQuery, [semester, period_type, start_date, end_date, id], function(err) {
    if (err) {
      console.error('Database error:', err);
      return sendError(res, 500, 'Lỗi máy chủ nội bộ.');
    }
    return sendSuccess(res, null, 'Cập nhật kế hoạch đăng ký thành công.');
  });
};

export const deleteAcademicPeriod = (req: Request, res: Response) => {
  const { id } = req.params;

  db.run('DELETE FROM academic_periods WHERE id = ?', [id], err => {
    if (err) {
      console.error('Database error:', err);
      return sendError(res, 500, 'Lỗi máy chủ nội bộ.');
    }

    return sendSuccess(res, null, 'Xóa kế hoạch đăng ký thành công.');
  });
};
