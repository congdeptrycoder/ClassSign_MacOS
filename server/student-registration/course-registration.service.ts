import { dbAll, dbGet, dbRun } from '../utils/db.utils';
import { getActiveRegistrationPeriod } from '../utils/registration.utils';
import { ensureStudentRecord, ensureStudentCourseStatusColumn } from './migration.service';
import { getCurriculumRows } from './curriculum.service';
import { ValidationContext } from '../strategies/IValidationStrategy';
import { CourseRegistrationContext, SkipValidationException } from '../strategies/course-registration/CourseRegistrationContext';
import { CurriculumCourseStrategy } from '../strategies/course-registration/CurriculumCourseStrategy';
import { PrerequisiteCourseStrategy } from '../strategies/course-registration/PrerequisiteCourseStrategy';
import { DuplicateCourseSemesterStrategy } from '../strategies/course-registration/DuplicateCourseSemesterStrategy';

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
