import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SkipValidationException } from '../../../../server/strategies/course-registration/CourseRegistrationContext';
import { CurriculumCourseStrategy } from '../../../../server/strategies/course-registration/CurriculumCourseStrategy';
import { DuplicateCourseSemesterStrategy } from '../../../../server/strategies/course-registration/DuplicateCourseSemesterStrategy';
import * as dbUtils from '../../../../server/utils/db.utils';

vi.mock('../../../../server/utils/db.utils', () => ({
    dbGet: vi.fn(),
}));

describe('CourseRegistration - SkipValidationException', () => {
    it('should initialize correctly', () => {
        const error = new SkipValidationException();
        expect(error.message).toBe('SKIP');
        expect(error.name).toBe('SkipValidationException');
    });
});

describe('CourseRegistration - CurriculumCourseStrategy', () => {
    let strategy: CurriculumCourseStrategy;

    beforeEach(() => {
        strategy = new CurriculumCourseStrategy();
    });

    it('should set curriculumCourse if it exists in courseMap', async () => {
        const mockCourse = { id: 101, code: 'IT101' };
        const courseMap = new Map<number, any>();
        courseMap.set(101, mockCourse);

        const context: any = {
            targetCourseId: 101,
            courseMap,
            isAutoAdd: false,
        };

        await expect(strategy.validate(context)).resolves.not.toThrow();
        expect(context.curriculumCourse).toBe(mockCourse);
    });

    it('should throw error if curriculumCourse missing and not auto add', async () => {
        const courseMap = new Map<number, any>();
        const context: any = {
            targetCourseId: 101,
            courseMap,
            isAutoAdd: false,
        };

        await expect(strategy.validate(context)).rejects.toThrow('Học phần không thuộc chương trình đào tạo của sinh viên.');
    });

    it('should throw SkipValidationException if curriculumCourse missing and is auto add', async () => {
        const courseMap = new Map<number, any>();
        const context: any = {
            targetCourseId: 101,
            courseMap,
            isAutoAdd: true,
        };

        await expect(strategy.validate(context)).rejects.toThrow(SkipValidationException);
    });
});

describe('CourseRegistration - DuplicateCourseSemesterStrategy', () => {
    let strategy: DuplicateCourseSemesterStrategy;

    beforeEach(() => {
        strategy = new DuplicateCourseSemesterStrategy();
        vi.clearAllMocks();
    });

    it('should pass if course is not already registered in this semester', async () => {
        vi.mocked(dbUtils.dbGet).mockResolvedValueOnce(null);

        const context: any = {
            studentId: 1,
            targetCourseId: 101,
            activePeriod: { semester: 20231 },
            isAutoAdd: false,
        };

        await expect(strategy.validate(context)).resolves.not.toThrow();
    });

    it('should throw duplicate error if course already registered and not auto add', async () => {
        vi.mocked(dbUtils.dbGet).mockResolvedValueOnce({ id: 99 });

        const context: any = {
            studentId: 1,
            targetCourseId: 101,
            activePeriod: { semester: 20231 },
            isAutoAdd: false,
        };

        await expect(strategy.validate(context)).rejects.toThrow('Bạn đã đăng ký thành công trước đó');
    });

    it('should throw SkipValidationException if course already registered and is auto add', async () => {
        vi.mocked(dbUtils.dbGet).mockResolvedValueOnce({ id: 99 });

        const context: any = {
            studentId: 1,
            targetCourseId: 101,
            activePeriod: { semester: 20231 },
            isAutoAdd: true,
        };

        await expect(strategy.validate(context)).rejects.toThrow(SkipValidationException);
    });
});
