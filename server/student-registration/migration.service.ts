import { dbAll, dbGet, dbRun } from '../utils/db.utils';

export async function ensureStudentCourseStatusColumn() {
  const columns = await dbAll<{ name: string }>('PRAGMA table_info(student_courses)');
  const hasStatus = columns.some(column => column.name === 'status');

  if (!hasStatus) {
    await dbRun("ALTER TABLE student_courses ADD COLUMN status TEXT DEFAULT 'registered'");
  }
}

export async function ensureStudentRecord(studentId: number) {
  const account = await dbGet<{ id: number }>(
    "SELECT id FROM accounts WHERE id = ? AND role = 'student'",
    [studentId]
  );

  if (!account) {
    throw new Error('Không tìm thấy tài khoản sinh viên.');
  }

  const student = await dbGet<{ id: number }>(
    'SELECT id FROM students WHERE id = ?',
    [studentId]
  );

  if (!student) {
    await dbRun("INSERT INTO students (id, status) VALUES (?, 'study')", [
      studentId,
    ]);
  }
}

export async function getStudentProfile(studentId: number) {
  const profile = await dbGet(
    `
      SELECT id, name, username, id_card
      FROM accounts
      WHERE id = ? AND role = 'student'
    `,
    [studentId]
  );

  if (!profile) {
    throw new Error('Không tìm thấy tài khoản sinh viên.');
  }

  return profile;
}

export async function getStudentProgramId(studentId: number): Promise<number> {
  const assignedProgram = await dbGet<{ programId: number }>(
    `
      SELECT c.program_id as programId
      FROM classes_student cs
      JOIN classes c ON c.id = cs.id_class
      WHERE cs.id_account = ?
      LIMIT 1
    `,
    [studentId]
  );

  if (assignedProgram?.programId) {
    return assignedProgram.programId;
  }

  const fallbackProgram = await dbGet<{ id: number }>(
    'SELECT id FROM programs ORDER BY id LIMIT 1'
  );

  if (!fallbackProgram) {
    throw new Error('Chưa có chương trình đào tạo trong cơ sở dữ liệu.');
  }

  return fallbackProgram.id;
}
