import { IValidationStrategy } from '../IValidationStrategy';
import { ClassRegistrationContext } from './ClassRegistrationContext';
import { dbGet } from '../../utils/db.utils';

export class DuplicateClassStrategy implements IValidationStrategy<ClassRegistrationContext> {
    async validate(context: ClassRegistrationContext): Promise<void> {
        if (!context.classSection) {
            throw new Error('Thiếu thông tin lớp học phần.');
        }

        const existingCourseClass = await dbGet(
            `
              SELECT scr.id
              FROM student_class_registrations scr
              JOIN classes_course cc ON cc.id = scr.class_id
              WHERE scr.student_id = ? AND cc.course_id = ?
              LIMIT 1
            `,
            [context.studentId, context.classSection.courseId]
        );

        if (existingCourseClass) {
            throw new Error('Bạn đã đăng ký một lớp khác của học phần này.');
        }

        const existingExactClass = await dbGet(
            `
              SELECT id
              FROM student_class_registrations
              WHERE student_id = ? AND class_id = ?
              LIMIT 1
            `,
            [context.studentId, context.classId]
        );

        if (existingExactClass) {
            throw new Error('Lớp học phần này đã được đăng ký.');
        }
    }
}
