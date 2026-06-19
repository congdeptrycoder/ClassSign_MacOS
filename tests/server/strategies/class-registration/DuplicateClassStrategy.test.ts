import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DuplicateClassStrategy } from '../../../../server/strategies/class-registration/DuplicateClassStrategy';
import { ClassRegistrationContext } from '../../../../server/strategies/class-registration/ClassRegistrationContext';
import * as dbUtils from '../../../../server/utils/db.utils';

// Mock dbUtils
vi.mock('../../../../server/utils/db.utils', () => ({
    dbGet: vi.fn(),
}));

describe('DuplicateClassStrategy', () => {
    let strategy: DuplicateClassStrategy;

    beforeEach(() => {
        strategy = new DuplicateClassStrategy();
        vi.clearAllMocks();
    });

    it('should throw error if classSection is missing', async () => {
        const context: ClassRegistrationContext = { studentId: 1, classId: 1 };
        await expect(strategy.validate(context)).rejects.toThrow('Thiếu thông tin lớp học phần.');
    });

    it('should throw error if student registered another class of the same course', async () => {
        const context: ClassRegistrationContext = { studentId: 1, classId: 1 };
        context.classSection = {
            id: 1,
            courseId: 1,
            totalSlots: 40,
            occupiedSlots: 20,
            detail: '{}'
        };

        // First query returns an existing class
        vi.mocked(dbUtils.dbGet).mockResolvedValueOnce({ id: 99 });

        await expect(strategy.validate(context)).rejects.toThrow('Bạn đã đăng ký một lớp khác của học phần này.');
        expect(dbUtils.dbGet).toHaveBeenCalledTimes(1);
    });

    it('should throw error if student already registered this exact class', async () => {
        const context: ClassRegistrationContext = { studentId: 1, classId: 1 };
        context.classSection = {
            id: 1,
            courseId: 1,
            totalSlots: 40,
            occupiedSlots: 20,
            detail: '{}'
        };

        // First query returns null (no other class of same course)
        vi.mocked(dbUtils.dbGet).mockResolvedValueOnce(null);
        // Second query returns the exact same class
        vi.mocked(dbUtils.dbGet).mockResolvedValueOnce({ id: 1 });

        await expect(strategy.validate(context)).rejects.toThrow('Lớp học phần này đã được đăng ký.');
        expect(dbUtils.dbGet).toHaveBeenCalledTimes(2);
    });

    it('should pass if student has not registered any class of this course', async () => {
        const context: ClassRegistrationContext = { studentId: 1, classId: 1 };
        context.classSection = {
            id: 1,
            courseId: 1,
            totalSlots: 40,
            occupiedSlots: 20,
            detail: '{}'
        };

        // Both queries return null
        vi.mocked(dbUtils.dbGet).mockResolvedValue(null);

        await expect(strategy.validate(context)).resolves.not.toThrow();
        expect(dbUtils.dbGet).toHaveBeenCalledTimes(2);
    });
});
