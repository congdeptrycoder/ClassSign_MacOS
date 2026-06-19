import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ActivePeriodClassStrategy } from '../../../../server/strategies/class-registration/ActivePeriodClassStrategy';
import { CourseRegisteredStrategy } from '../../../../server/strategies/class-registration/CourseRegisteredStrategy';
import * as registrationUtils from '../../../../server/utils/registration.utils';
import * as dbUtils from '../../../../server/utils/db.utils';

vi.mock('../../../../server/utils/registration.utils', () => ({
    getActiveRegistrationPeriod: vi.fn(),
}));

vi.mock('../../../../server/utils/db.utils', () => ({
    dbGet: vi.fn(),
}));

describe('ClassRegistration - ActivePeriodClassStrategy', () => {
    let strategy: ActivePeriodClassStrategy;

    beforeEach(() => {
        strategy = new ActivePeriodClassStrategy();
        vi.clearAllMocks();
    });

    it('should pass if there is an active registration period for class', async () => {
        vi.mocked(registrationUtils.getActiveRegistrationPeriod).mockResolvedValueOnce({ id: 1 } as any);

        const context: any = { studentId: 1, classId: 101 };

        await expect(strategy.validate(context)).resolves.not.toThrow();
        expect(registrationUtils.getActiveRegistrationPeriod).toHaveBeenCalledWith('register_class');
    });

    it('should throw error if no active class registration period exists', async () => {
        vi.mocked(registrationUtils.getActiveRegistrationPeriod).mockResolvedValueOnce(null);

        const context: any = { studentId: 1, classId: 101 };

        await expect(strategy.validate(context)).rejects.toThrow('Hiện không trong giai đoạn đăng ký lớp học.');
    });
});

describe('ClassRegistration - CourseRegisteredStrategy', () => {
    let strategy: CourseRegisteredStrategy;

    beforeEach(() => {
        strategy = new CourseRegisteredStrategy();
        vi.clearAllMocks();
    });

    it('should throw error if classSection is missing in context', async () => {
        const context: any = { studentId: 1, classId: 101 };

        await expect(strategy.validate(context)).rejects.toThrow('Thiếu thông tin lớp học phần.');
    });

    it('should pass if student has registered the course', async () => {
        vi.mocked(dbUtils.dbGet).mockResolvedValueOnce({ id: 99 });

        const context: any = {
            studentId: 1,
            classId: 101,
            classSection: { courseId: 501 }
        };

        await expect(strategy.validate(context)).resolves.not.toThrow();
    });

    it('should throw error if student has not registered the course', async () => {
        vi.mocked(dbUtils.dbGet).mockResolvedValueOnce(null);

        const context: any = {
            studentId: 1,
            classId: 101,
            classSection: { courseId: 501 }
        };

        await expect(strategy.validate(context)).rejects.toThrow('Sinh viên chưa đăng ký học phần của lớp này.');
    });
});
