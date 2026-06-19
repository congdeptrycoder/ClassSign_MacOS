import db from '../db';

import { getActiveRegistrationPeriod, parseSchedule } from '../utils/registration.utils';
import { dbAll, dbGet, dbRun } from '../utils/db.utils';
import { ValidationContext } from '../strategies/IValidationStrategy';
import { ClassRegistrationContext } from '../strategies/class-registration/ClassRegistrationContext';
import { ActivePeriodClassStrategy } from '../strategies/class-registration/ActivePeriodClassStrategy';
import { ClassCapacityStrategy } from '../strategies/class-registration/ClassCapacityStrategy';
import { CourseRegisteredStrategy } from '../strategies/class-registration/CourseRegisteredStrategy';
import { DuplicateClassStrategy } from '../strategies/class-registration/DuplicateClassStrategy';
import { TimeOverlapStrategy } from '../strategies/class-registration/TimeOverlapStrategy';
import { CourseRegistrationContext, SkipValidationException } from '../strategies/course-registration/CourseRegistrationContext';
import { CurriculumCourseStrategy } from '../strategies/course-registration/CurriculumCourseStrategy';
import { PrerequisiteCourseStrategy } from '../strategies/course-registration/PrerequisiteCourseStrategy';
import { DuplicateCourseSemesterStrategy } from '../strategies/course-registration/DuplicateCourseSemesterStrategy';
import { BackendEventBus } from '../infrastructure/events/EventBusImpl';
import { ClassRegisteredEvent, ClassRegistrationCancelledEvent } from '../domain/events/ClassRegistrationEvents';

type RunResult = {
  lastID: number;
  changes: number;
};

async function ensureStudentCourseStatusColumn() {
  const columns = await dbAll<{ name: string }>('PRAGMA table_info(student_courses)');
  const hasStatus = columns.some(column => column.name === 'status');

  if (!hasStatus) {
    await dbRun("ALTER TABLE student_courses ADD COLUMN status TEXT DEFAULT 'registered'");
  }
}

async function ensureStudentRecord(studentId: number) {
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

async function getStudentProfile(studentId: number) {
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

async function getStudentProgramId(studentId: number): Promise<number> {
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

async function getActiveRegistrationPeriod(expectedType: string) {
  const rows = await dbAll<any>(
    `
      SELECT id, semester, period_type, start_date, end_date, is_active
      FROM academic_periods
      WHERE is_active = 1
      ORDER BY id DESC
    `
  );

  const now = new Date();
  return rows.find(row => {
    const start = new Date(String(row.start_date).replace(' ', 'T'));
    const end = new Date(String(row.end_date).replace(' ', 'T'));
    return row.period_type === expectedType && now >= start && now <= end;
  }) ?? null;
}

async function getCompletedCourseIds(studentId: number) {
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

export async function getRegisteredCourses(studentId: number) {
  await ensureStudentCourseStatusColumn();
  return dbAll(
    `
      SELECT
        sc.id,
        sc.course_id as courseId,
        sc.semester,
        COALESCE(sc.status, 'registered') as status,
        c.course_code as code,
        c.course_name as name,
        c.credits
      FROM student_courses sc
      JOIN courses c ON c.id = sc.course_id
      WHERE sc.student_id = ?
      ORDER BY sc.created_at DESC, sc.id DESC
    `,
    [studentId]
  );
}

function getCourseStatusLabel(status: string) {
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

async function getCurriculumRows(studentId: number) {
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

export async function searchCourseSuggestions(
  studentId: number,
  query: string,
  limit = 10
) {
  const normalized = query.trim().toLowerCase();

  const curriculum = await getCurriculumRows(studentId);
  return curriculum
    .filter(
      course =>
        !normalized ||
        course.code.toLowerCase().includes(normalized) ||
        course.name.toLowerCase().includes(normalized)
    )
    .slice(0, limit);
}

export async function registerCourse(
  studentId: number,
  input: { courseId?: number; courseCode?: string }
) {
  await ensureStudentRecord(studentId);
  await ensureStudentCourseStatusColumn();

  const activePeriod = await getActiveRegistrationPeriod('register_program');
  if (!activePeriod) {
    throw new Error('Hiện không trong giai đoạn đăng ký học phần.');
  }

  const course = input.courseId
    ? await dbGet<any>('SELECT * FROM courses WHERE id = ?', [input.courseId])
    : await dbGet<any>('SELECT * FROM courses WHERE course_code = ?', [
      input.courseCode,
    ]);

  if (!course) {
    throw new Error('Học phần không tồn tại.');
  }

  const curriculumCourses = await getCurriculumRows(studentId);
  const courseMap = new Map(curriculumCourses.map(c => [c.courseId, c]));

  const collectedToRegister = new Map<number, any>();
  const autoAddedNames: string[] = [];

  async function collectAsync(targetCourseId: number, isAutoAdd: boolean, depth = 0) {
    if (depth > 10) throw new Error('Phát hiện vòng lặp đệ quy học phần song hành.');
    if (collectedToRegister.has(targetCourseId)) return;

    const validationContext = new ValidationContext<CourseRegistrationContext>();
    validationContext.addStrategy(new CurriculumCourseStrategy());
    validationContext.addStrategy(new PrerequisiteCourseStrategy());
    validationContext.addStrategy(new DuplicateCourseSemesterStrategy());

    const courseContext: CourseRegistrationContext = {
      studentId,
      targetCourseId,
      isAutoAdd,
      activePeriod,
      courseMap
    };

    try {
      await validationContext.validateAll(courseContext);
    } catch (error) {
      if (error instanceof SkipValidationException) {
        return;
      }
      throw error;
    }

    const curriculumCourse = courseContext.curriculumCourse;

    collectedToRegister.set(targetCourseId, curriculumCourse);
    if (isAutoAdd) {
      autoAddedNames.push(`${curriculumCourse.code}-${curriculumCourse.name}`);
    }

    if (curriculumCourse.parallelCourseId) {
      const parStatus = curriculumCourse.parallelCourseRawStatus;
      if (parStatus !== 'completed' && parStatus !== 're_registered') {
        await collectAsync(curriculumCourse.parallelCourseId, true, depth + 1);
      }
    }
  }

  await collectAsync(course.id, false);

  let primaryRegisteredCourse = null;
  let primaryMessage = 'Đăng ký thành công';

  for (const [cId, cCourse] of collectedToRegister) {
    const existingRegisteredOtherSemester = await dbGet<{ id: number }>(
      `SELECT id FROM student_courses WHERE student_id = ? AND course_id = ? AND status = 'registered' LIMIT 1`,
      [studentId, cId]
    );

    const existingCompleted = await dbGet<{ id: number }>(
      `SELECT id FROM student_courses WHERE student_id = ? AND course_id = ? AND status = 'completed' LIMIT 1`,
      [studentId, cId]
    );

    let newStatus = 'registered';
    let msg = 'Đăng ký thành công';

    if (existingCompleted) {
      newStatus = 're_registered';
      msg = 'Đăng ký thành công. Học phần này đã từng được học, bạn đang đăng ký học lại.';
    } else if (existingRegisteredOtherSemester) {
      newStatus = 'registered';
      msg = 'Đăng ký thành công. Học phần này đã từng được đăng ký nhưng chưa học xong.';
    }

    const result = await dbRun(
      `INSERT INTO student_courses (student_id, course_id, semester, status) VALUES (?, ?, ?, ?)`,
      [studentId, cId, activePeriod.semester, newStatus]
    );

    if (cId === course.id) {
      primaryRegisteredCourse = (await getRegisteredCourses(studentId)).find(
        (item: any) => item.id === result.lastID
      );
      primaryMessage = msg;
    }
  }

  if (autoAddedNames.length > 0) {
    primaryMessage = `Đã tự động thêm học phần song hành ${autoAddedNames.join(', ')}`;
  }

  return {
    course: primaryRegisteredCourse,
    message: primaryMessage
  };
}

export async function removeCourseRegistration(studentId: number, courseId: number) {
  await ensureStudentRecord(studentId);
  const activePeriod = await getActiveRegistrationPeriod('register_program');
  if (!activePeriod) {
    throw new Error('Hiện không trong giai đoạn đăng ký học phần.');
  }

  const result = await dbRun(
    `
      DELETE FROM student_courses
      WHERE student_id = ?
        AND course_id = ?
        AND semester = ?
    `,
    [studentId, courseId, activePeriod.semester]
  );

  if (result.changes === 0) {
    throw new Error('Không tìm thấy đăng ký học phần này trong học kỳ hiện tại.');
  }
}

export async function searchClassSuggestions(
  studentId: number,
  query: string,
  limit = 10
) {
  await ensureStudentCourseStatusColumn();
  const normalized = query.trim().toLowerCase();

  return dbAll(
    `
      SELECT DISTINCT
        cc.id,
        cc.course_id as courseId,
        c.course_code as code,
        c.course_name as name,
        c.credits,
        cc.detail,
        cc.total_slots as totalSlots,
        cc.occupied_slots as occupiedSlots
      FROM classes_course cc
      JOIN courses c ON c.id = cc.course_id
      JOIN student_courses sc
        ON sc.course_id = cc.course_id
        AND sc.student_id = ?
        AND COALESCE(sc.status, 'registered') IN ('registered', 're_registered')
      WHERE ? = '' OR lower(c.course_code) LIKE ? OR lower(c.course_name) LIKE ?
      ORDER BY c.course_code ASC
      LIMIT ?
    `,
    [studentId, normalized, `%${normalized}%`, `%${normalized}%`, limit]
  );
}

function parseSchedule(detailStr: string): Array<{ day: string, periods: number[] }> {
  try {
    const parsed = JSON.parse(detailStr || '{}');
    let slots = [];
    if (Array.isArray(parsed)) slots = parsed;
    else if (parsed.slots && Array.isArray(parsed.slots)) slots = parsed.slots;
    
    if (slots.length > 0) {
      return slots.map((s: any) => ({
        day: String(s.day).replace('T', ''), // 'T3' -> '3'
        periods: Array.isArray(s.periods) ? s.periods.map(Number) : [Number(s.period)]
      }));
    } else if (parsed.thu && parsed.tiet_bd && parsed.tiet_kt) {
      const start = Number(parsed.tiet_bd);
      const end = Number(parsed.tiet_kt);
      const periods = [];
      for(let i = start; i <= end; i++) periods.push(i);
      return [{
        day: String(parsed.thu),
        periods
      }];
    }
  } catch {}
  return [];
}

function hasOverlap(detailA: string, detailB: string): boolean {
  const schedA = parseSchedule(detailA);
  const schedB = parseSchedule(detailB);
  
  for (const slotA of schedA) {
    for (const slotB of schedB) {
      if (slotA.day === slotB.day) {
        const setB = new Set(slotB.periods);
        for (const p of slotA.periods) {
          if (setB.has(p)) return true;
        }
      }
    }
  }
  return false;
}

export async function getClassesForCourse(
  studentId: number,
  courseId: number
) {
  await ensureStudentCourseStatusColumn();

  return dbAll(
    `
      SELECT DISTINCT
        cc.id,
        cc.course_id as courseId,
        c.course_code as code,
        c.course_name as name,
        c.credits,
        cc.detail,
        cc.total_slots as totalSlots,
        cc.occupied_slots as occupiedSlots
      FROM classes_course cc
      JOIN courses c ON c.id = cc.course_id
      JOIN student_courses sc
        ON sc.course_id = cc.course_id
        AND sc.student_id = ?
        AND COALESCE(sc.status, 'registered') IN ('registered', 're_registered')
      WHERE cc.course_id = ?
      ORDER BY cc.id ASC
    `,
    [studentId, courseId]
  );
}

export async function registerClassSection(studentId: number, classId: number) {
  await ensureStudentRecord(studentId);

  const context = new ValidationContext<ClassRegistrationContext>();
  context.addStrategy(new ActivePeriodClassStrategy());
  context.addStrategy(new ClassCapacityStrategy());
  context.addStrategy(new CourseRegisteredStrategy());
  context.addStrategy(new DuplicateClassStrategy());
  context.addStrategy(new TimeOverlapStrategy());

  const registrationContext: ClassRegistrationContext = {
    studentId,
    classId
  };

  await context.validateAll(registrationContext);

  try {
    await dbRun('BEGIN IMMEDIATE TRANSACTION');
    const result = await dbRun(
      `
        INSERT INTO student_class_registrations (student_id, class_id)
        VALUES (?, ?)
      `,
      [studentId, classId]
    );
    await dbRun(
      `
        UPDATE classes_course
        SET occupied_slots = occupied_slots + 1
        WHERE id = ?
      `,
      [classId]
    );
    await dbRun('COMMIT');

    BackendEventBus.publish(new ClassRegisteredEvent(studentId, classId));

    return { id: result.lastID };
  } catch (error) {
    try {
      await dbRun('ROLLBACK');
    } catch (_rollbackError) {
      // Keep the original registration failure visible to the caller.
    }
    throw error;
  }
}

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

export async function removeClassRegistration(studentId: number, classId: number) {
  await ensureStudentRecord(studentId);

  const activePeriod = await getActiveRegistrationPeriod('register_class');
  if (!activePeriod) {
    throw new Error('Hiện không trong giai đoạn đăng ký lớp học.');
  }

  try {
    await dbRun('BEGIN IMMEDIATE TRANSACTION');
    const result = await dbRun(
      `
        DELETE FROM student_class_registrations
        WHERE student_id = ? AND class_id = ?
      `,
      [studentId, classId]
    );

    if (result.changes === 0) {
      throw new Error('Không tìm thấy đăng ký lớp học phần này.');
    }

    await dbRun(
      `
        UPDATE classes_course
        SET occupied_slots = MAX(0, occupied_slots - 1)
        WHERE id = ?
      `,
      [classId]
    );
    await dbRun('COMMIT');
    BackendEventBus.publish(new ClassRegistrationCancelledEvent(studentId, classId));
  } catch (error) {
    try {
      await dbRun('ROLLBACK');
    } catch (_rollbackError) {
      //
    }
    throw error;
  }
}
