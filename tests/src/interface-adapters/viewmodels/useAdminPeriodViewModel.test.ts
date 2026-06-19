/**
 * @vitest-environment jsdom
 */
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useAdminPeriodViewModel } from '../../../../src/interface-adapters/viewmodels/AdminDashboard/useAdminPeriodViewModel';
import { academicPeriodController } from '../../../../src/di/admin.di';

vi.mock('../../../../src/di/admin.di', () => ({
    academicPeriodController: {
        getAll: vi.fn(),
        save: vi.fn(),
        delete: vi.fn(),
    },
}));

describe('useAdminPeriodViewModel', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should load academic periods', async () => {
        const mockPeriods = [
            { id: 1, semester: 20231, period_type: 'register_program', start_date: '2023-09-01T08:00', end_date: '2023-09-10T17:00', is_active: 1 }
        ];
        (academicPeriodController.getAll as any).mockResolvedValue(mockPeriods);

        const { result } = renderHook(() => useAdminPeriodViewModel());

        let loaded;
        await act(async () => {
            loaded = await result.current.loadPeriods();
        });

        expect(academicPeriodController.getAll).toHaveBeenCalled();
        expect(result.current.periodsData).toEqual(mockPeriods);
        expect(loaded).toEqual(mockPeriods);
    });

    it('should handle load academic periods error', async () => {
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        (academicPeriodController.getAll as any).mockRejectedValue(new Error('Fetch failed'));

        const { result } = renderHook(() => useAdminPeriodViewModel());

        let loaded;
        await act(async () => {
            loaded = await result.current.loadPeriods();
        });

        expect(consoleSpy).toHaveBeenCalledWith('Failed to load periods data', expect.any(Error));
        expect(result.current.periodsData).toEqual([]);
        expect(loaded).toEqual([]);
        consoleSpy.mockRestore();
    });

    it('should validate inputs before saving academic period', async () => {
        const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
        const mockReload = vi.fn();
        const { result } = renderHook(() => useAdminPeriodViewModel());

        // Test missing fields
        await act(async () => {
            await result.current.handleSaveRegistrationPeriod(mockReload);
        });
        expect(alertSpy).toHaveBeenCalledWith('Vui lòng chọn đầy đủ kỳ học và thời gian bắt đầu, kết thúc!');
        expect(academicPeriodController.save).not.toHaveBeenCalled();

        // Fill fields, but start date is after end date
        act(() => {
            result.current.setSelectedSemester(20231);
            result.current.setRegPeriodStart('2023-09-10T08:00');
            result.current.setRegPeriodEnd('2023-09-01T08:00');
        });

        await act(async () => {
            await result.current.handleSaveRegistrationPeriod(mockReload);
        });
        expect(alertSpy).toHaveBeenCalledWith('Thời gian bắt đầu phải trước thời gian kết thúc!');
        expect(academicPeriodController.save).not.toHaveBeenCalled();

        alertSpy.mockRestore();
    });

    it('should save academic period successfully', async () => {
        const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
        const mockReload = vi.fn();
        (academicPeriodController.save as any).mockResolvedValue({});

        const { result } = renderHook(() => useAdminPeriodViewModel());

        act(() => {
            result.current.setSelectedSemester(20231);
            result.current.setRegPeriodStart('2023-09-01T08:00');
            result.current.setRegPeriodEnd('2023-09-10T08:00');
            result.current.setRegPeriodType('register_class');
        });

        await act(async () => {
            await result.current.handleSaveRegistrationPeriod(mockReload);
        });

        expect(academicPeriodController.save).toHaveBeenCalledWith({
            id: undefined,
            semester: 20231,
            period_type: 'register_class',
            start_date: '2023-09-01T08:00',
            end_date: '2023-09-10T08:00'
        });
        expect(alertSpy).toHaveBeenCalledWith('Lưu cấu hình Giai đoạn đăng ký thành công!');
        expect(result.current.isEditingPeriod).toBe(false);
        expect(result.current.editPeriodId).toBeNull();
        expect(result.current.regPeriodStart).toBe('');
        expect(result.current.regPeriodEnd).toBe('');
        expect(mockReload).toHaveBeenCalled();

        alertSpy.mockRestore();
    });

    it('should handle save error', async () => {
        const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
        const mockReload = vi.fn();
        (academicPeriodController.save as any).mockRejectedValue(new Error('Save failed'));

        const { result } = renderHook(() => useAdminPeriodViewModel());

        act(() => {
            result.current.setSelectedSemester(20231);
            result.current.setRegPeriodStart('2023-09-01T08:00');
            result.current.setRegPeriodEnd('2023-09-10T08:00');
        });

        await act(async () => {
            await result.current.handleSaveRegistrationPeriod(mockReload);
        });

        expect(alertSpy).toHaveBeenCalledWith('Save failed');
        expect(mockReload).not.toHaveBeenCalled();

        // Error with no message
        (academicPeriodController.save as any).mockRejectedValue({});
        await act(async () => {
            await result.current.handleSaveRegistrationPeriod(mockReload);
        });
        expect(alertSpy).toHaveBeenCalledWith('Có lỗi xảy ra.');

        alertSpy.mockRestore();
    });

    it('should delete academic period when confirmed', async () => {
        const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
        const mockReload = vi.fn();
        (academicPeriodController.delete as any).mockResolvedValue({});

        const { result } = renderHook(() => useAdminPeriodViewModel());

        await act(async () => {
            await result.current.handleDeleteRegistrationPeriod(1, mockReload);
        });

        expect(confirmSpy).toHaveBeenCalledWith('Bạn có chắc chắn muốn xóa thiết lập đợt đăng ký này?');
        expect(academicPeriodController.delete).toHaveBeenCalledWith(1);
        expect(mockReload).toHaveBeenCalled();

        confirmSpy.mockRestore();
    });

    it('should not delete if cancel is clicked', async () => {
        const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);
        const mockReload = vi.fn();

        const { result } = renderHook(() => useAdminPeriodViewModel());

        await act(async () => {
            await result.current.handleDeleteRegistrationPeriod(1, mockReload);
        });

        expect(academicPeriodController.delete).not.toHaveBeenCalled();
        expect(mockReload).not.toHaveBeenCalled();

        confirmSpy.mockRestore();
    });

    it('should handle delete error', async () => {
        const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
        const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
        const mockReload = vi.fn();
        (academicPeriodController.delete as any).mockRejectedValue(new Error('Delete error'));

        const { result } = renderHook(() => useAdminPeriodViewModel());

        await act(async () => {
            await result.current.handleDeleteRegistrationPeriod(1, mockReload);
        });

        expect(alertSpy).toHaveBeenCalledWith('Delete error');
        expect(mockReload).not.toHaveBeenCalled();

        // Error with no message
        (academicPeriodController.delete as any).mockRejectedValue({});
        await act(async () => {
            await result.current.handleDeleteRegistrationPeriod(1, mockReload);
        });
        expect(alertSpy).toHaveBeenCalledWith('Xoá thất bại.');

        confirmSpy.mockRestore();
        alertSpy.mockRestore();
    });

    it('should handle edit modes correctly', () => {
        const { result } = renderHook(() => useAdminPeriodViewModel());

        // Edit existing period
        act(() => {
            result.current.handleEditRegistrationPeriod({
                id: 123,
                semester: 20232,
                period_type: 'register_class',
                start_date: '2023-09-01T08:00:00.000Z',
                end_date: '2023-09-10T17:00:00.000Z',
                is_active: 1
            });
        });

        expect(result.current.editPeriodId).toBe(123);
        expect(result.current.selectedSemester).toBe(20232);
        expect(result.current.regPeriodType).toBe('register_class');
        expect(result.current.regPeriodStart).toBe('2023-09-01T08:00');
        expect(result.current.regPeriodEnd).toBe('2023-09-10T17:00');
        expect(result.current.isEditingPeriod).toBe(true);

        // Edit new period (resetting form)
        act(() => {
            result.current.handleEditRegistrationPeriod();
        });

        expect(result.current.editPeriodId).toBeNull();
        expect(result.current.selectedSemester).toBe('');
        expect(result.current.regPeriodType).toBe('register_program');
        expect(result.current.regPeriodStart).toBe('');
        expect(result.current.regPeriodEnd).toBe('');
        expect(result.current.isEditingPeriod).toBe(true);
    });
});
