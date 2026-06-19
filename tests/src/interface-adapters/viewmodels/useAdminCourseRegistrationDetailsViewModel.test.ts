/**
 * @vitest-environment jsdom
 */
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useAdminCourseRegistrationDetailsViewModel } from '../../../../src/interface-adapters/viewmodels/AdminCourseRegistrationDetails/useAdminCourseRegistrationDetailsViewModel';
import { adminController, adminClassController } from '../../../../src/di/admin.di';

vi.mock('../../../../src/di/admin.di', () => ({
    adminController: {
        getCourseRegistrationStats: vi.fn(),
    },
    adminClassController: {
        getClassesByCourse: vi.fn(),
        deleteClassCourse: vi.fn(),
    },
}));

describe('useAdminCourseRegistrationDetailsViewModel', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should initialize and load stats when semester is provided', async () => {
        const mockStats = [
            { id: 1, ma_hp: 'IT101', ten_hp: 'Intro', truong_khoa: 'SoICT', so_luong_dang_ky: 45 },
            { id: 2, ma_hp: 'IT102', ten_hp: 'OOP', truong_khoa: null as any, so_luong_dang_ky: 30 },
        ];
        (adminController.getCourseRegistrationStats as any).mockResolvedValue(mockStats);

        const { result } = renderHook(() => useAdminCourseRegistrationDetailsViewModel(20231));

        expect(result.current.loading).toBe(true);

        await act(async () => {
            await new Promise(resolve => setTimeout(resolve, 0));
        });

        expect(result.current.loading).toBe(false);
        expect(result.current.stats).toEqual(mockStats);
        expect(adminController.getCourseRegistrationStats).toHaveBeenCalledWith(20231);
    });

    it('should handle load stats failure', async () => {
        (adminController.getCourseRegistrationStats as any).mockRejectedValue(new Error('Fetch failed'));

        const { result } = renderHook(() => useAdminCourseRegistrationDetailsViewModel(20231));

        await act(async () => {
            await new Promise(resolve => setTimeout(resolve, 0));
        });

        expect(result.current.loading).toBe(false);
        expect(result.current.error).toBe('Fetch failed');
        expect(result.current.stats).toEqual([]);
    });

    it('should filter stats correctly', async () => {
        const mockStats = [
            { id: 1, ma_hp: 'IT101', ten_hp: 'Intro', truong_khoa: 'SoICT', so_luong_dang_ky: 45 },
            { id: 2, ma_hp: 'PH102', ten_hp: 'Physics', truong_khoa: 'SAMI', so_luong_dang_ky: 30 },
        ];
        (adminController.getCourseRegistrationStats as any).mockResolvedValue(mockStats);

        const { result } = renderHook(() => useAdminCourseRegistrationDetailsViewModel(20231));

        await act(async () => {
            await new Promise(resolve => setTimeout(resolve, 0));
        });

        // Filter by ma_hp
        act(() => {
            result.current.setFilterMaHp('IT');
        });
        expect(result.current.stats.length).toBe(1);
        expect(result.current.stats[0].ma_hp).toBe('IT101');

        // Filter by ten_hp
        act(() => {
            result.current.setFilterMaHp('');
            result.current.setFilterTenHp('Phys');
        });
        expect(result.current.stats.length).toBe(1);
        expect(result.current.stats[0].ten_hp).toBe('Physics');

        // Filter by truong_khoa
        act(() => {
            result.current.setFilterTenHp('');
            result.current.setFilterTruongKhoa('SoI');
        });
        expect(result.current.stats.length).toBe(1);
        expect(result.current.stats[0].truong_khoa).toBe('SoICT');

        // Filter by so_luong
        act(() => {
            result.current.setFilterTruongKhoa('');
            result.current.setFilterSoLuong('30');
        });
        expect(result.current.stats.length).toBe(1);
        expect(result.current.stats[0].so_luong_dang_ky).toBe(30);
    });

    it('should expand and collapse course to load classes', async () => {
        const mockClasses = [{ id: 101, ma_lop: 'L01' }];
        (adminClassController.getClassesByCourse as any).mockResolvedValue(mockClasses);

        const { result } = renderHook(() => useAdminCourseRegistrationDetailsViewModel(20231));

        // Toggle Expand - Load
        await act(async () => {
            await result.current.toggleExpandCourse(1, 20231);
        });

        expect(result.current.expandedCourseId).toBe(1);
        expect(adminClassController.getClassesByCourse).toHaveBeenCalledWith(20231, 1);
        expect(result.current.courseClasses[1]).toEqual(mockClasses);

        // Toggle Expand again - Collapse
        act(() => {
            result.current.toggleExpandCourse(1, 20231);
        });
        expect(result.current.expandedCourseId).toBeNull();
    });

    it('should handle load classes failure', async () => {
        const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
        (adminClassController.getClassesByCourse as any).mockRejectedValue(new Error('Load classes failed'));

        const { result } = renderHook(() => useAdminCourseRegistrationDetailsViewModel(20231));

        await act(async () => {
            await result.current.toggleExpandCourse(1, 20231);
        });

        expect(alertSpy).toHaveBeenCalledWith('Lỗi khi tải danh sách lớp: Load classes failed');
        expect(result.current.courseClasses[1]).toBeUndefined();

        alertSpy.mockRestore();
    });

    it('should delete class when confirmed and reload classes list', async () => {
        const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
        const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
        (adminClassController.deleteClassCourse as any).mockResolvedValue({});
        (adminClassController.getClassesByCourse as any).mockResolvedValue([{ id: 102 }]);

        const { result } = renderHook(() => useAdminCourseRegistrationDetailsViewModel(20231));

        await act(async () => {
            await result.current.handleDeleteClass(101, 1, 20231);
        });

        expect(confirmSpy).toHaveBeenCalledWith('Bạn có chắc chắn muốn xoá lớp học này?');
        expect(adminClassController.deleteClassCourse).toHaveBeenCalledWith(101);
        expect(adminClassController.getClassesByCourse).toHaveBeenCalledWith(20231, 1);
        expect(alertSpy).toHaveBeenCalledWith('Xoá lớp thành công!');

        confirmSpy.mockRestore();
        alertSpy.mockRestore();
    });

    it('should not delete class when cancelled', async () => {
        const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);

        const { result } = renderHook(() => useAdminCourseRegistrationDetailsViewModel(20231));

        await act(async () => {
            await result.current.handleDeleteClass(101, 1, 20231);
        });

        expect(adminClassController.deleteClassCourse).not.toHaveBeenCalled();
        confirmSpy.mockRestore();
    });

    it('should handle delete class failure', async () => {
        const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
        const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
        (adminClassController.deleteClassCourse as any).mockRejectedValue(new Error('Delete failed'));

        const { result } = renderHook(() => useAdminCourseRegistrationDetailsViewModel(20231));

        await act(async () => {
            await result.current.handleDeleteClass(101, 1, 20231);
        });

        expect(alertSpy).toHaveBeenCalledWith('Lỗi khi xoá lớp: Delete failed');

        confirmSpy.mockRestore();
        alertSpy.mockRestore();
    });

    it('should trigger handleEditClass alert', () => {
        const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

        const { result } = renderHook(() => useAdminCourseRegistrationDetailsViewModel(20231));

        act(() => {
            result.current.handleEditClass({ id: 1 });
        });

        expect(alertSpy).toHaveBeenCalledWith('Chuyển hướng: Sẽ chuyển sang màn hình sửa với thông tin tương ứng. (Tính năng đang phát triển)');
        alertSpy.mockRestore();
    });

    it('should do nothing when semester is null', async () => {
        const { result } = renderHook(() => useAdminCourseRegistrationDetailsViewModel(null));

        await act(async () => {
            await new Promise(resolve => setTimeout(resolve, 0));
        });

        expect(adminController.getCourseRegistrationStats).not.toHaveBeenCalled();
        expect(result.current.loading).toBe(false);
    });

    it('should not load classes again if already cached', async () => {
        const mockClasses = [{ id: 101, ma_lop: 'L01' }];
        (adminClassController.getClassesByCourse as any).mockResolvedValue(mockClasses);

        const { result } = renderHook(() => useAdminCourseRegistrationDetailsViewModel(20231));

        // First expand: loads
        await act(async () => {
            await result.current.toggleExpandCourse(1, 20231);
        });
        expect(adminClassController.getClassesByCourse).toHaveBeenCalledTimes(1);

        // Collapse
        act(() => {
            result.current.toggleExpandCourse(1, 20231);
        });

        // Second expand: doesn't load again
        await act(async () => {
            await result.current.toggleExpandCourse(1, 20231);
        });
        expect(adminClassController.getClassesByCourse).toHaveBeenCalledTimes(1);
    });

    it('should handle load classes failure without error message', async () => {
        const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
        (adminClassController.getClassesByCourse as any).mockRejectedValue({});

        const { result } = renderHook(() => useAdminCourseRegistrationDetailsViewModel(20231));

        await act(async () => {
            await result.current.toggleExpandCourse(1, 20231);
        });

        expect(alertSpy).toHaveBeenCalledWith('Lỗi khi tải danh sách lớp: ');
        alertSpy.mockRestore();
    });

    it('should handle delete class failure without error message', async () => {
        const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
        const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
        (adminClassController.deleteClassCourse as any).mockRejectedValue({});

        const { result } = renderHook(() => useAdminCourseRegistrationDetailsViewModel(20231));

        await act(async () => {
            await result.current.handleDeleteClass(101, 1, 20231);
        });

        expect(alertSpy).toHaveBeenCalledWith('Lỗi khi xoá lớp: ');

        confirmSpy.mockRestore();
        alertSpy.mockRestore();
    });
});

