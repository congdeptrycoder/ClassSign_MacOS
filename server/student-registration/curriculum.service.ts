import { dbAll, dbGet } from '../utils/db.utils';
import { ensureStudentCourseStatusColumn, getStudentProgramId, getStudentProfile } from './migration.service';

export async function getCompletedCourseIds(studentId: number) {
  await ensureStudentCourseStatusColumn();
  const rows = await dbAll<{ course_id: number }>(
    `
      SELECT course_id
      FROM student_courses
      WHERE student_id = ? AND status = 'completed'
    `,
    [studentId]
  );

  return new Set(rows.map(row => row.course_id));
}

export function getCourseStatusLabel(status: string) {
  switch (status) {
    case 'completed':
      return 'Đã học xong. Có thể học lại';
    case 'registered':
      return 'Đã từng đăng ký, chưa học xong';
    case 'blocked':
      return 'Chưa đủ điều kiện';
    default:
      return 'Có thể đăng ký';
  }
}

export async function getCurriculumRows(studentId: number) {
  await ensureStudentCourseStatusColumn();
  const programId = await getStudentProgramId(studentId);
  const rows = await dbAll<any>(
    `
      WITH student_course_state AS (
        SELECT
          course_id,
          CASE
            WHEN SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) > 0 THEN 'completed'
            WHEN SUM(CASE WHEN COALESCE(status, 'registered') IN ('registered', 're_registered') THEN 1 ELSE 0 END) > 0 THEN 'registered'
            ELSE NULL
          END as registrationStatus,
          (SELECT COALESCE(status, 'registered') FROM student_courses sc2 WHERE sc2.course_id = student_courses.course_id AND sc2.student_id = student_courses.student_id ORDER BY id DESC LIMIT 1) as latestStatus
        FROM student_courses
        WHERE student_id = ?
        GROUP BY course_id
      )
      SELECT
        pc.id as curriculumId,
        pc.course_id as courseId,
        pc.prerequisite_course_id as prerequisiteCourseId,
        pc.parallel_course_id as parallelCourseId,
        c.course_code as code,
        c.course_name as name,
        c.credits,
        pre.course_code as prerequisiteCode,
        pre.course_name as prerequisiteName,
        par.course_code as parallelCode,
        par.course_name as parallelName,
        sc.registrationStatus,
        sc.latestStatus
      FROM program_course pc
      JOIN courses c ON c.id = pc.course_id
      LEFT JOIN courses pre ON pre.id = pc.prerequisite_course_id
      LEFT JOIN courses par ON par.id = pc.parallel_course_id
      LEFT JOIN student_course_state sc ON sc.course_id = pc.course_id
      WHERE pc.program_id = ?
      ORDER BY c.course_code ASC
    `,
    [studentId, programId]
  );

  const completedCourseIds = await getCompletedCourseIds(studentId);

  const courses = rows.map(row => {
    const hasMissingPrerequisite =
      row.prerequisiteCourseId && !completedCourseIds.has(row.prerequisiteCourseId);
    const status = row.registrationStatus === 'completed'
      ? 'completed'
      : row.registrationStatus
        ? 'registered'
        : hasMissingPrerequisite
          ? 'blocked'
          : 'available';
    const hasStudied = status === 'completed';

    return {
      ...row,
      latestStatus: row.latestStatus,
      status,
      statusLabel: getCourseStatusLabel(status),
      hasStudied,
      studyStatusLabel: hasStudied ? 'Đã học' : 'Chưa học',
      canRegister: status === 'available',
      blockingReason: hasMissingPrerequisite
        ? `Thiếu học phần tiên quyết ${row.prerequisiteCode}-${row.prerequisiteName} chưa hoàn thành`
        : null,
    };
  });

  const courseMap = new Map(courses.map(c => [c.courseId, c]));
  courses.forEach(c => {
    if (c.parallelCourseId) {
      const parCourse = courseMap.get(c.parallelCourseId);
      c.parallelCourseRawStatus = parCourse ? parCourse.latestStatus : null;
    } else {
      c.parallelCourseRawStatus = null;
    }
  });

  return courses;
}

export async function getCurriculum(studentId: number) {
  const profile = await getStudentProfile(studentId);
  const programId = await getStudentProgramId(studentId);
  const program = await dbGet(
    `
      SELECT p.id, p.program_code as code, p.program_name as name
      FROM programs p
      WHERE p.id = ?
    `,
    [programId]
  );

  return {
    student: profile,
    program,
    courses: await getCurriculumRows(studentId),
  };
}
