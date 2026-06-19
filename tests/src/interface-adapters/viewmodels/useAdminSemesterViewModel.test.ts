/**
 * @vitest-environment jsdom
 */
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useAdminSemesterViewModel } from '../../../../src/interface-adapters/viewmodels/AdminDashboard/useAdminSemesterViewModel';
import { semesterController } from '../../../../src/di/admin.di';

vi.mock('../../../../src/di/admin.di', () => ({
    semesterController: {
        getAllSemesters: vi.fn(),
        createSemester: vi.fn(),
    },
}));

describe('useAdminSemesterViewModel', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should load semesters', async () => {
        const mockSemesters = [{ id: 20231, name: 1 }, { id: 20232, name: 2 }];
        (semesterController.getAllSemesters as any).mockResolvedValue(mockSemesters);

        const { result } = renderHook(() => useAdminSemesterViewModel());

        let loaded;
        await act(async () => {
            loaded = await result.current.loadSemesters();
        });

        expect(semesterController.getAllSemesters).toHaveBeenCalled();
        expect(result.current.semestersData).toEqual(mockSemesters);
        expect(loaded).toEqual(mockSemesters);
    });

    it('should handle load semesters error', async () => {
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        (semesterController.getAllSemesters as any).mockRejectedValue(new Error('Load error'));

        const { result } = renderHook(() => useAdminSemesterViewModel());

        let loaded;
        await act(async () => {
            loaded = await result.current.loadSemesters();
        });

        expect(consoleSpy).toHaveBeenCalledWith('Failed to load semesters data', expect.any(Error));
        expect(result.current.semestersData).toEqual([]);
        expect(loaded).toEqual([]);
        consoleSpy.mockRestore();
    });

    it('should validate inputs before creating semester', async () => {
        const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
        const { result } = renderHook(() => useAdminSemesterViewModel());

        await act(async () => {
            await result.current.handleCreateSemester();
        });
        expect(alertSpy).toHaveBeenCalledWith('Vui lòng nhập mã kỳ!');
        expect(semesterController.createSemester).not.toHaveBeenCalled();

        alertSpy.mockRestore();
    });

    it('should create semester successfully', async () => {
        const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
        (semesterController.createSemester as any).mockResolvedValue({});
        (semesterController.getAllSemesters as any).mockResolvedValue([]);

        const { result } = renderHook(() => useAdminSemesterViewModel());

        act(() => {
            result.current.setNewSemesterCode('20233');
        });

        await act(async () => {
            await result.current.handleCreateSemester();
        });

        expect(semesterController.createSemester).toHaveBeenCalledWith('20233');
        expect(alertSpy).toHaveBeenCalledWith('Thêm học kỳ mới thành công!');
        expect(result.current.isCreateSemesterModalOpen).toBe(false);
        expect(result.current.newSemesterCode).toBe('');
        expect(semesterController.getAllSemesters).toHaveBeenCalled();

        alertSpy.mockRestore();
    });

    it('should handle create semester error', async () => {
        const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
        (semesterController.createSemester as any).mockRejectedValue(new Error('Create failed'));

        const { result } = renderHook(() => useAdminSemesterViewModel());

        act(() => {
            result.current.setNewSemesterCode('20233');
        });

        await act(async () => {
            await result.current.handleCreateSemester();
        });

        expect(alertSpy).toHaveBeenCalledWith('Create failed');

        // Error with no message
        (semesterController.createSemester as any).mockRejectedValue({});
        await act(async () => {
            await result.current.handleCreateSemester();
        });
        expect(alertSpy).toHaveBeenCalledWith('Lỗi thêm học kỳ.');

        alertSpy.mockRestore();
    });
});
