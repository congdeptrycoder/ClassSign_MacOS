import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TimeOverlapStrategy } from '../../../../server/strategies/class-registration/TimeOverlapStrategy';
import { ClassRegistrationContext } from '../../../../server/strategies/class-registration/ClassRegistrationContext';
import * as dbUtils from '../../../../server/utils/db.utils';

// Mock dbUtils
vi.mock('../../../../server/utils/db.utils', () => ({
    dbGet: vi.fn(),
    dbAll: vi.fn(),
}));

describe('TimeOverlapStrategy', () => {
    let strategy: TimeOverlapStrategy;

    beforeEach(() => {
        strategy = new TimeOverlapStrategy();
        vi.clearAllMocks();
    });

    it('should throw error if classSection is missing', async () => {
        const context: ClassRegistrationContext = { studentId: 1, classId: 1 };
        await expect(strategy.validate(context)).rejects.toThrow('Thiếu thông tin lớp học phần.');
    });

    it('should pass if there is no overlap', async () => {
        const context: ClassRegistrationContext = { studentId: 1, classId: 1 };
        context.classSection = {
            id: 1,
            detail: JSON.stringify({ thu: 2, tiet_bd: 1, tiet_kt: 3, buoi: 'Sáng' })
        };
        
        // Mock dbGet to return null (no overlap found)
        vi.mocked(dbUtils.dbGet).mockResolvedValueOnce(null);

        await expect(strategy.validate(context)).resolves.not.toThrow();
        expect(dbUtils.dbGet).toHaveBeenCalledTimes(1);
    });

    it('should throw error if there is a time overlap', async () => {
        const context: ClassRegistrationContext = { studentId: 1, classId: 1 };
        context.classSection = {
            id: 1,
            detail: JSON.stringify({ thu: 2, tiet_bd: 2, tiet_kt: 4, buoi: 'Sáng' })
        };
        
        // Mock dbGet to return an overlapping class
        vi.mocked(dbUtils.dbGet).mockResolvedValueOnce({
            course_code: 'INT1001',
            course_name: 'Nhập môn lập trình'
        });

        await expect(strategy.validate(context)).rejects.toThrow('Trùng lịch với lớp INT1001 (Nhập môn lập trình).');
        expect(dbUtils.dbGet).toHaveBeenCalledTimes(1);
    });

    it('should continue if slot periods list is empty', async () => {
        const context: ClassRegistrationContext = { studentId: 1, classId: 1 };
        context.classSection = {
            id: 1,
            detail: JSON.stringify({ slots: [{ day: 'Monday', periods: [] }] })
        };

        await expect(strategy.validate(context)).resolves.not.toThrow();
        expect(dbUtils.dbGet).not.toHaveBeenCalled();
    });

    it('should parse detail gracefully if detail is empty or invalid JSON', async () => {
        const context: ClassRegistrationContext = { studentId: 1, classId: 1 };
        context.classSection = {
            id: 1,
            detail: ''
        };

        await expect(strategy.validate(context)).resolves.not.toThrow();
        expect(dbUtils.dbGet).not.toHaveBeenCalled();
    });
});

