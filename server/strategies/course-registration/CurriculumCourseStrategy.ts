import { IValidationStrategy } from '../IValidationStrategy';
import { CourseRegistrationContext, SkipValidationException } from './CourseRegistrationContext';

export class CurriculumCourseStrategy implements IValidationStrategy<CourseRegistrationContext> {
    async validate(context: CourseRegistrationContext): Promise<void> {
        const curriculumCourse = context.courseMap.get(context.targetCourseId);
        if (!curriculumCourse) {
            if (!context.isAutoAdd) throw new Error('Học phần không thuộc chương trình đào tạo của sinh viên.');
            throw new SkipValidationException();
        }
        context.curriculumCourse = curriculumCourse;
    }
}
