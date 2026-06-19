import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ClassCapacityStrategy } from '../../../../server/strategies/class-registration/ClassCapacityStrategy';
import { ClassRegistrationContext } from '../../../../server/strategies/class-registration/ClassRegistrationContext';
import * as dbUtils from '../../../../server/utils/db.utils';

// Mock dbUtils
vi.mock('../../../../server/utils/db.utils', () => ({
    dbGet: vi.fn(),
}));

describe('ClassCapacityStrategy', () => {
    let strategy: ClassCapacityStrategy;

    beforeEach(() => {
        strategy = new ClassCapacityStrategy();
        vi.clearAllMocks();
    });

    it('should throw error if class section does not exist', async () => {
        const context: ClassRegistrationContext = { studentId: 1, classId: 1 };
        vi.mocked(dbUtils.dbGet).mockResolvedValueOnce(null);

        await expect(strategy.validate(context)).rejects.toThrow('Lớp học phần không tồn tại.');
    });

    it('should throw error if class section is full', async () => {
        const context: ClassRegistrationContext = { studentId: 1, classId: 1 };
        vi.mocked(dbUtils.dbGet).mockResolvedValueOnce({
            id: 1,
            courseId: 1,
            totalSlots: 40,
            occupiedSlots: 40,
            detail: '{}'
        });

        await expect(strategy.validate(context)).rejects.toThrow('Lớp học phần đã hết chỗ.');
    });

    it('should pass if class section has available slots', async () => {
        const context: ClassRegistrationContext = { studentId: 1, classId: 1 };
        vi.mocked(dbUtils.dbGet).mockResolvedValueOnce({
            id: 1,
            courseId: 1,
            totalSlots: 40,
            occupiedSlots: 39,
            detail: '{}'
        });

        await expect(strategy.validate(context)).resolves.not.toThrow();
        expect(context.classSection).toBeDefined();
        expect(context.classSection?.id).toBe(1);
    });
});
