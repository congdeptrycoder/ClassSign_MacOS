/**
 * @vitest-environment jsdom
 */
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useAdminDashboardViewModel } from '../../../../src/interface-adapters/viewmodels/AdminDashboard/useAdminDashboardViewModel';
import { semesterController, academicPeriodController, adminClassController } from '../../../../src/di/admin.di';

vi.mock('../../../../src/di/admin.di', () => ({
    semesterController: {
        getAllSemesters: vi.fn(),
        createSemester: vi.fn(),
    },
    academicPeriodController: {
        getAll: vi.fn(),
        save: vi.fn(),
        delete: vi.fn(),
    },
    adminClassController: {
        getAllClassesBySemester: vi.fn(),
        deleteClassCourse: vi.fn()
    }
}));

describe('useAdminDashboardViewModel', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should coordinate loading of semesters, periods and default selection', async () => {
        const mockSemesters = [{ id: 20231, name: 1 }];
        const mockPeriods = [{ id: 1, semester: 20231, period_type: 'register_program', start_date: '2023-09-01T08:00', end_date: '2023-09-10T17:00', is_active: 1 }];
        
        (semesterController.getAllSemesters as any).mockResolvedValue(mockSemesters);
        (academicPeriodController.getAll as any).mockResolvedValue(mockPeriods);
        (adminClassController.getAllClassesBySemester as any).mockResolvedValue([]);

        const { result } = renderHook(() => useAdminDashboardViewModel());

        // Wait for coordinate loadData in useEffect
        await act(async () => {
            await new Promise(resolve => setTimeout(resolve, 0));
        });

        expect(semesterController.getAllSemesters).toHaveBeenCalled();
        expect(academicPeriodController.getAll).toHaveBeenCalled();
        expect(result.current.selectedSemester).toBe(20231);
        expect(result.current.selectedClassSemesterId).toBe(20231);
    });

    it('should handle profile toggle, logout and file upload', () => {
        const mockLogout = vi.fn();
        const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

        const { result } = renderHook(() => useAdminDashboardViewModel(undefined, mockLogout));

        expect(result.current.isProfileOpen).toBe(false);

        act(() => {
            result.current.toggleProfile();
        });
        expect(result.current.isProfileOpen).toBe(true);

        act(() => {
            result.current.handleUpload();
        });
        expect(alertSpy).toHaveBeenCalledWith('Upload: Chức năng upload file (.xlsx) sẽ được thực hiện.');

        act(() => {
            result.current.handleLogout();
        });
        expect(result.current.isProfileOpen).toBe(false);
        expect(mockLogout).toHaveBeenCalled();

        alertSpy.mockRestore();
    });

    it('should coordinate period save and delete', async () => {
        const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
        const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
        (semesterController.getAllSemesters as any).mockResolvedValue([]);
        (academicPeriodController.getAll as any).mockResolvedValue([]);
        (academicPeriodController.save as any).mockResolvedValue({});
        (academicPeriodController.delete as any).mockResolvedValue({});

        const { result } = renderHook(() => useAdminDashboardViewModel());

        // Fill period details to save
        act(() => {
            result.current.setSelectedSemester(20231);
            result.current.setRegPeriodStart('2023-09-01T08:00');
            result.current.setRegPeriodEnd('2023-09-10T08:00');
        });

        await act(async () => {
            await result.current.handleSaveRegistrationPeriod();
        });

        expect(academicPeriodController.save).toHaveBeenCalled();
        expect(semesterController.getAllSemesters).toHaveBeenCalled(); // verified it reloaded data!

        // Delete period
        await act(async () => {
            await result.current.handleDeleteRegistrationPeriod(1);
        });

        expect(academicPeriodController.delete).toHaveBeenCalledWith(1);

        alertSpy.mockRestore();
        confirmSpy.mockRestore();
    });

    it('should coordinate semester creation', async () => {
        const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
        (semesterController.getAllSemesters as any).mockResolvedValue([]);
        (semesterController.createSemester as any).mockResolvedValue({});

        const { result } = renderHook(() => useAdminDashboardViewModel());

        act(() => {
            result.current.setNewSemesterCode('20233');
        });

        await act(async () => {
            await result.current.handleCreateSemester();
        });

        expect(semesterController.createSemester).toHaveBeenCalledWith('20233');
        expect(semesterController.getAllSemesters).toHaveBeenCalled();

        alertSpy.mockRestore();
    });
});
