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
                ma_hp: 'IT101',
                ten_hp: 'Intro',
                ma_lop: 'A1',
                sl_max: 50,
                sl_dk: 0,
                ma_lop_kem: 'NULL',
                ghi_chu: 'NULL',
                can_tn: 'NULL',
                teaching_type: 'NULL',
            },
            {
                id: 2,
                ma_hp: 'IT102',
                ten_hp: 'OOP',
                ma_lop: 'A2',
                sl_max: 30,
                sl_dk: 30, // Full
                ma_lop_kem: 'B1',
                ghi_chu: 'Note',
                can_tn: 'TN',
                teaching_type: 'Lecture',
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
        expect(result.current.classesData[0].trang_thai).toBe('Mở ĐK');
        expect(result.current.classesData[1].trang_thai).toBe('Đã đầy');
        expect(result.current.classesData[2].trang_thai).toBe('Mở ĐK');
        expect(result.current.classesData[0].ma_lop_kem).toBe('');
        expect(result.current.classesData[1].ma_lop_kem).toBe('B1');
        expect(result.current.classesData[2].ma_lop).toBe('');

        // Search
        act(() => {
            result.current.handleFilterChange('ma_lop', 'NOT_FOUND');
        });

        expect(result.current.filteredClassesData.length).toBe(0);
    });

    it('should delete class', async () => {
        (adminClassController.getAllClassesBySemester as any).mockResolvedValue([]);
        (adminClassController.deleteClassCourse as any).mockResolvedValue({});

        const { result } = renderHook(() => useAdminClassViewModel(undefined));

        vi.spyOn(window, 'confirm').mockReturnValue(true);

        await act(async () => {
            await result.current.handleDelete({ id: 1, ma_lop: 'A' } as any);
        });

        expect(adminClassController.deleteClassCourse).toHaveBeenCalledWith(1);
    });

    it('should handle edit options', () => {
        const mockNavigate = vi.fn();
        const { result: withNav } = renderHook(() => useAdminClassViewModel(mockNavigate));
        
        act(() => {
            withNav.current.handleEdit({ ma_lop: 'A' } as any);
        });
        expect(mockNavigate).toHaveBeenCalledWith({ ma_lop: 'A' });

        // Without navigate
        const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
        const { result: withoutNav } = renderHook(() => useAdminClassViewModel(undefined));
        
        act(() => {
            withoutNav.current.handleEdit({ ma_lop: 'A' } as any);
        });
        expect(alertSpy).toHaveBeenCalledWith('Chuyển hướng: Sẽ chuyển sang màn hình sửa với thông tin tương ứng.');
        alertSpy.mockRestore();
    });

    it('should not delete if confirm is rejected or ID is missing or delete fails', async () => {
        const { result } = renderHook(() => useAdminClassViewModel(undefined));
        
        // Cancel confirm
        const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);
        await act(async () => {
            await result.current.handleDelete({ id: 1, ma_lop: 'A' } as any);
        });
        expect(adminClassController.deleteClassCourse).not.toHaveBeenCalled();
        confirmSpy.mockRestore();

        // Missing ID
        vi.spyOn(window, 'confirm').mockReturnValue(true);
        const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
        await act(async () => {
            await result.current.handleDelete({ ma_lop: 'A' } as any);
        });
        expect(alertSpy).toHaveBeenCalledWith('Lỗi: Không tìm thấy ID của lớp học');

        // Delete failure
        (adminClassController.deleteClassCourse as any).mockRejectedValue(new Error('Delete error'));
        await act(async () => {
            await result.current.handleDelete({ id: 1, ma_lop: 'A' } as any);
        });
        expect(alertSpy).toHaveBeenCalledWith('Xoá lớp học thất bại: Delete error');

        // Delete failure without message
        (adminClassController.deleteClassCourse as any).mockRejectedValue({});
        await act(async () => {
            await result.current.handleDelete({ id: 1, ma_lop: 'A' } as any);
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
