import { dbAll, dbGet, dbRun } from '../utils/db.utils';
import { getActiveRegistrationPeriod, parseSchedule } from '../utils/registration.utils';
import { ensureStudentRecord, ensureStudentCourseStatusColumn } from './migration.service';
import { ValidationContext } from '../strategies/IValidationStrategy';
import { ClassRegistrationContext } from '../strategies/class-registration/ClassRegistrationContext';
import { ActivePeriodClassStrategy } from '../strategies/class-registration/ActivePeriodClassStrategy';
import { ClassCapacityStrategy } from '../strategies/class-registration/ClassCapacityStrategy';
import { CourseRegisteredStrategy } from '../strategies/class-registration/CourseRegisteredStrategy';
import { DuplicateClassStrategy } from '../strategies/class-registration/DuplicateClassStrategy';
import { TimeOverlapStrategy } from '../strategies/class-registration/TimeOverlapStrategy';
import { BackendEventBus } from '../infrastructure/events/EventBusImpl';
import { ClassRegisteredEvent, ClassRegistrationCancelledEvent } from '../domain/events/ClassRegistrationEvents';

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

export function hasOverlap(detailA: string, detailB: string): boolean {
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
