/**
 * @vitest-environment jsdom
 */
import { renderHook, act } from '@testing-library/react';
import { useAdminClassViewModel } from '../../../../src/interface-adapters/viewmodels/AdminDashboard/useAdminClassViewModel';
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../../../src/di/admin.di', () => ({
    adminClassController: {
        getAllClassesBySemester: vi.fn(),
        deleteClassCourse: vi.fn()
    }
}));

import { adminClassController } from '../../../../src/di/admin.di';

describe('useAdminClassViewModel', () => {
    const mockSetAlarmMessage = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should load classes and handle search', async () => {
        (adminClassController.getAllClassesBySemester as any).mockResolvedValue([
            {
                id: 1,
                courseCode: 'IT101',
                courseName: 'Intro',
                classCode: 'A1',
                maxSlots: 50,
                occupiedSlots: 0,
                subClassCode: 'NULL',
                notes: 'NULL',
                requiresExperiment: 'NULL',
                teachingType: 'NULL',
            },
            {
                id: 2,
                courseCode: 'IT102',
                courseName: 'OOP',
                classCode: 'A2',
                maxSlots: 30,
                occupiedSlots: 30, // Full
                subClassCode: 'B1',
                notes: 'Note',
                requiresExperiment: 'TN',
                teachingType: 'Lecture',
            },
            {
                id: 3,
                // empty to test fallbacks
            }
        ]);

        const { result } = renderHook(() => useAdminClassViewModel());

        act(() => {
            result.current.setSelectedClassSemesterId(20231);
        });

        await act(async () => {
            await new Promise(resolve => setTimeout(resolve, 0));
        });

        expect(result.current.classesData.length).toBe(3);
        expect(result.current.classesData[0].status).toBe('Mở ĐK');
        expect(result.current.classesData[1].status).toBe('Đã đầy');
        expect(result.current.classesData[2].status).toBe('Mở ĐK');
        expect(result.current.classesData[0].subClassCode).toBe('');
        expect(result.current.classesData[1].subClassCode).toBe('B1');
        expect(result.current.classesData[2].classCode).toBe('');

        // Search
        act(() => {
            result.current.handleFilterChange('classCode', 'NOT_FOUND');
        });

        expect(result.current.filteredClassesData.length).toBe(0);
    });

    it('should delete class', async () => {
        (adminClassController.getAllClassesBySemester as any).mockResolvedValue([]);
        (adminClassController.deleteClassCourse as any).mockResolvedValue({});

        const { result } = renderHook(() => useAdminClassViewModel(undefined));

        vi.spyOn(window, 'confirm').mockReturnValue(true);

        await act(async () => {
            await result.current.handleDelete({ id: 1, classCode: 'A' } as any);
        });

        expect(adminClassController.deleteClassCourse).toHaveBeenCalledWith(1);
    });

    it('should handle edit options', () => {
        const mockNavigate = vi.fn();
        const { result: withNav } = renderHook(() => useAdminClassViewModel(mockNavigate));
        
        act(() => {
            withNav.current.handleEdit({ classCode: 'A' } as any);
        });
        expect(mockNavigate).toHaveBeenCalledWith({ classCode: 'A' });

        // Without navigate
        const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
        const { result: withoutNav } = renderHook(() => useAdminClassViewModel(undefined));
        
        act(() => {
            withoutNav.current.handleEdit({ classCode: 'A' } as any);
        });
        expect(alertSpy).toHaveBeenCalledWith('Chuyển hướng: Sẽ chuyển sang màn hình sửa với thông tin tương ứng.');
        alertSpy.mockRestore();
    });

    it('should not delete if confirm is rejected or ID is missing or delete fails', async () => {
        const { result } = renderHook(() => useAdminClassViewModel(undefined));
        
        // Cancel confirm
        const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);
        await act(async () => {
            await result.current.handleDelete({ id: 1, classCode: 'A' } as any);
        });
        expect(adminClassController.deleteClassCourse).not.toHaveBeenCalled();
        confirmSpy.mockRestore();

        // Missing ID
        vi.spyOn(window, 'confirm').mockReturnValue(true);
        const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
        await act(async () => {
            await result.current.handleDelete({ classCode: 'A' } as any);
        });
        expect(alertSpy).toHaveBeenCalledWith('Lỗi: Không tìm thấy ID của lớp học');

        // Delete failure
        (adminClassController.deleteClassCourse as any).mockRejectedValue(new Error('Delete error'));
        await act(async () => {
            await result.current.handleDelete({ id: 1, classCode: 'A' } as any);
        });
        expect(alertSpy).toHaveBeenCalledWith('Xoá lớp học thất bại: Delete error');

        // Delete failure without message
        (adminClassController.deleteClassCourse as any).mockRejectedValue({});
        await act(async () => {
            await result.current.handleDelete({ id: 1, classCode: 'A' } as any);
        });
        expect(alertSpy).toHaveBeenCalledWith('Xoá lớp học thất bại: ');
        alertSpy.mockRestore();
    });

    it('should handle class loading failure', async () => {
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        (adminClassController.getAllClassesBySemester as any).mockRejectedValue(new Error('Load error'));

        const { result } = renderHook(() => useAdminClassViewModel());

        act(() => {
            result.current.setSelectedClassSemesterId(20231);
        });

        await act(async () => {
            await new Promise(resolve => setTimeout(resolve, 0));
        });

        expect(result.current.classesData).toEqual([]);
        expect(consoleSpy).toHaveBeenCalledWith("Failed to load classes data", expect.any(Error));
        consoleSpy.mockRestore();
    });
});
