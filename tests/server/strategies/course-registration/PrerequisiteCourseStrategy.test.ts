import { describe, it, expect } from 'vitest';
import { PrerequisiteCourseStrategy } from '../../../../server/strategies/course-registration/PrerequisiteCourseStrategy';
import { CourseRegistrationContext } from '../../../../server/strategies/course-registration/CourseRegistrationContext';

describe('PrerequisiteCourseStrategy', () => {
    it('should throw error if curriculumCourse is missing', async () => {
        const strategy = new PrerequisiteCourseStrategy();
        const context: CourseRegistrationContext = { studentId: 1, curriculumCourseId: 1 };
        
        await expect(strategy.validate(context)).rejects.toThrow('Thiếu thông tin học phần.');
    });

    it('should throw error if there is a blocking reason', async () => {
        const strategy = new PrerequisiteCourseStrategy();
        const context: CourseRegistrationContext = { studentId: 1, curriculumCourseId: 1 };
        context.curriculumCourse = {
            id: 1,
            course_id: 1,
            semester_id: 1,
            prerequisiteCode: 'INT1001',
            prerequisiteName: 'Nhập môn lập trình',
            blockingReason: 'Chưa học môn tiên quyết'
        };

        await expect(strategy.validate(context)).rejects.toThrow('Học phần tiên quyết INT1001-Nhập môn lập trình chưa hoàn thành');
    });

    it('should pass if there is no blocking reason', async () => {
        const strategy = new PrerequisiteCourseStrategy();
        const context: CourseRegistrationContext = { studentId: 1, curriculumCourseId: 1 };
        context.curriculumCourse = {
            id: 1,
            course_id: 1,
            semester_id: 1,
            prerequisiteCode: null,
            prerequisiteName: null,
            blockingReason: null
        };

        await expect(strategy.validate(context)).resolves.not.toThrow();
    });
});
