import { IValidationStrategy } from '../IValidationStrategy';
import { ClassRegistrationContext } from './ClassRegistrationContext';
import { dbGet } from '../../utils/db.utils';

export class CourseRegisteredStrategy implements IValidationStrategy<ClassRegistrationContext> {
    async validate(context: ClassRegistrationContext): Promise<void> {
        if (!context.classSection) {
            throw new Error('Thiếu thông tin lớp học phần.');
        }

        const registeredCourse = await dbGet(
            `
              SELECT id
              FROM student_courses
              WHERE student_id = ?
                AND course_id = ?
                AND COALESCE(status, 'registered') = 'registered'
              LIMIT 1
            `,
            [context.studentId, context.classSection.courseId]
        );

        if (!registeredCourse) {
            throw new Error('Sinh viên chưa đăng ký học phần của lớp này.');
        }
    }
}
