import { IValidationStrategy } from '../IValidationStrategy';
import { CourseRegistrationContext, SkipValidationException } from './CourseRegistrationContext';
import { dbGet } from '../../utils/db.utils';

export class DuplicateCourseSemesterStrategy implements IValidationStrategy<CourseRegistrationContext> {
    async validate(context: CourseRegistrationContext): Promise<void> {
        const existingInSemester = await dbGet<{ id: number }>(
            `SELECT id FROM student_courses WHERE student_id = ? AND course_id = ? AND semester = ? LIMIT 1`,
            [context.studentId, context.targetCourseId, context.activePeriod.semester]
        );

        if (existingInSemester) {
            if (!context.isAutoAdd) throw new Error('Bạn đã đăng ký thành công trước đó');
            throw new SkipValidationException();
        }
    }
}
