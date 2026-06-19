import { IValidationStrategy } from '../IValidationStrategy';
import { CourseRegistrationContext } from './CourseRegistrationContext';

export class PrerequisiteCourseStrategy implements IValidationStrategy<CourseRegistrationContext> {
    async validate(context: CourseRegistrationContext): Promise<void> {
        if (!context.curriculumCourse) {
            throw new Error('Thiếu thông tin học phần.');
        }

        if (context.curriculumCourse.blockingReason) {
            throw new Error(`Học phần tiên quyết ${context.curriculumCourse.prerequisiteCode}-${context.curriculumCourse.prerequisiteName} chưa hoàn thành`);
        }
    }
}
