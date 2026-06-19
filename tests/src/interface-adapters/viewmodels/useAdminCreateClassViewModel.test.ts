/**
 * @vitest-environment jsdom
 */
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useAdminCreateClassViewModel } from '../../../../src/interface-adapters/viewmodels/AdminCreateClass/useAdminCreateClassViewModel';
import { adminClassController } from '../../../../src/di/admin.di';

vi.mock('../../../../src/di/admin.di', () => ({
    adminClassController: {
        createClassCourse: vi.fn(),
        updateClassCourse: vi.fn(),
    },
}));

describe('useAdminCreateClassViewModel', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should initialize with initial state and handle change', () => {
        const initialState = {
            ky: '20231',
            ma_hp: 'IT101',
            ten_hp: 'Intro',
        };
        const mockNavigateBack = vi.fn();

        const { result } = renderHook(() => useAdminCreateClassViewModel(initialState, mockNavigateBack));

        expect(result.current.formData.ky).toBe('20231');
        expect(result.current.formData.ma_hp).toBe('IT101');
        expect(result.current.formData.ten_hp).toBe('Intro');
        expect(result.current.formData.buoi).toBe('Sáng'); // default value

        act(() => {
            result.current.handleChange('ma_lop', 'L01');
        });

        expect(result.current.formData.ma_lop).toBe('L01');
    });

    it('should validate form fields before saving', async () => {
        const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
        const mockNavigateBack = vi.fn();

        const { result } = renderHook(() => useAdminCreateClassViewModel({}, mockNavigateBack));

        await act(async () => {
            await result.current.handleSave();
        });

        expect(alertSpy).toHaveBeenCalledWith('Vui lòng điền đầy đủ các thông tin bắt buộc (có dấu *)');
        expect(adminClassController.createClassCourse).not.toHaveBeenCalled();

        alertSpy.mockRestore();
    });

    it('should create class successfully when form is valid', async () => {
        const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
        const mockNavigateBack = vi.fn();
        (adminClassController.createClassCourse as any).mockResolvedValue({});

        const { result } = renderHook(() => useAdminCreateClassViewModel({
            ma_lop: 'L01',
            thu: '2',
            tiet_bd: '1',
            tiet_kt: '3',
            buoi: 'Sáng',
            phong_hoc: 'D3-301',
            sl_max: '50',
        }, mockNavigateBack));

        await act(async () => {
            await result.current.handleSave();
        });

        expect(adminClassController.createClassCourse).toHaveBeenCalledWith(expect.objectContaining({
            ma_lop: 'L01',
            thu: '2',
            tiet_bd: '1',
            tiet_kt: '3',
            buoi: 'Sáng',
            phong_hoc: 'D3-301',
            sl_max: '50',
            ma_lop_kem: 'NULL', // fallback
            ghi_chu: 'NULL',    // fallback
            can_tn: 'NULL',     // fallback
            teaching_type: 'NULL' // fallback
        }));
        expect(alertSpy).toHaveBeenCalledWith('Thành công: Đã lưu lớp học mới!');
        expect(mockNavigateBack).toHaveBeenCalled();

        alertSpy.mockRestore();
    });

    it('should handle missing ID when editing class', async () => {
        const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
        const mockNavigateBack = vi.fn();

        const { result } = renderHook(() => useAdminCreateClassViewModel({
            ma_lop: 'L01',
            thu: '2',
            tiet_bd: '1',
            tiet_kt: '3',
            buoi: 'Sáng',
            phong_hoc: 'D3-301',
            sl_max: '50',
        }, mockNavigateBack, true)); // isEdit = true

        await act(async () => {
            await result.current.handleSave();
        });

        expect(alertSpy).toHaveBeenCalledWith('Lỗi: Không tìm thấy ID lớp học để cập nhật');
        expect(adminClassController.updateClassCourse).not.toHaveBeenCalled();

        alertSpy.mockRestore();
    });

    it('should update class successfully when isEdit is true and id is provided', async () => {
        const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
        const mockNavigateBack = vi.fn();
        (adminClassController.updateClassCourse as any).mockResolvedValue({});

        const { result } = renderHook(() => useAdminCreateClassViewModel({
            id: 99,
            ma_lop: 'L01',
            thu: '2',
            tiet_bd: '1',
            tiet_kt: '3',
            buoi: 'Sáng',
            phong_hoc: 'D3-301',
            sl_max: '50',
        }, mockNavigateBack, true)); // isEdit = true

        await act(async () => {
            await result.current.handleSave();
        });

        expect(adminClassController.updateClassCourse).toHaveBeenCalledWith(99, expect.objectContaining({
            id: 99,
            ma_lop: 'L01',
            thu: '2',
            tiet_bd: '1',
            tiet_kt: '3',
            buoi: 'Sáng',
            phong_hoc: 'D3-301',
            sl_max: '50',
        }));
        expect(alertSpy).toHaveBeenCalledWith('Thành công: Đã cập nhật thông tin lớp học!');
        expect(mockNavigateBack).toHaveBeenCalled();

        alertSpy.mockRestore();
    });

    it('should handle save error', async () => {
        const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
        const mockNavigateBack = vi.fn();
        (adminClassController.createClassCourse as any).mockRejectedValue(new Error('Save failed'));

        const { result } = renderHook(() => useAdminCreateClassViewModel({
            ma_lop: 'L01',
            thu: '2',
            tiet_bd: '1',
            tiet_kt: '3',
            buoi: 'Sáng',
            phong_hoc: 'D3-301',
            sl_max: '50',
        }, mockNavigateBack));

        await act(async () => {
            await result.current.handleSave();
        });

        expect(alertSpy).toHaveBeenCalledWith('Lỗi khi lưu lớp học: Save failed');
        expect(mockNavigateBack).not.toHaveBeenCalled();

        // Error with no message
        (adminClassController.createClassCourse as any).mockRejectedValue({});
        await act(async () => {
            await result.current.handleSave();
        });
        expect(alertSpy).toHaveBeenCalledWith('Lỗi khi lưu lớp học: Lỗi hệ thống');

        alertSpy.mockRestore();
    });
});
