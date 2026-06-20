import { dbAll } from '../utils/db.utils';

export async function getTimetable(studentId: number, semester?: string) {
  let query = `
      SELECT
        scr.id,
        cc.id as classId,
        c.course_code as code,
        c.course_name as name,
        cc.detail
      FROM student_class_registrations scr
      JOIN classes_course cc ON cc.id = scr.class_id
      JOIN courses c ON c.id = cc.course_id
  `;
  const params: any[] = [studentId];

  if (semester) {
    query += `
      JOIN student_courses sc ON sc.course_id = c.id AND sc.student_id = scr.student_id
      WHERE scr.student_id = ? AND sc.semester = ?
    `;
    params.push(semester);
  } else {
    query += ` WHERE scr.student_id = ? `;
  }

  query += ` ORDER BY c.course_code ASC `;

  return dbAll(query, params);
}
