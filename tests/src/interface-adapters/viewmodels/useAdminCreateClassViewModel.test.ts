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
            semester: '20231',
            courseCode: 'IT101',
            courseName: 'Intro',
        };
        const mockNavigateBack = vi.fn();

        const { result } = renderHook(() => useAdminCreateClassViewModel(initialState, mockNavigateBack));

        expect(result.current.formData.semester).toBe('20231');
        expect(result.current.formData.courseCode).toBe('IT101');
        expect(result.current.formData.courseName).toBe('Intro');
        expect(result.current.formData.daySession).toBe('Sáng'); // default value

        act(() => {
            result.current.handleChange('classCode', 'L01');
        });

        expect(result.current.formData.classCode).toBe('L01');
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
            classCode: 'L01',
            dayOfWeek: '2',
            startPeriod: '1',
            endPeriod: '3',
            daySession: 'Sáng',
            room: 'D3-301',
            maxSlots: '50',
        }, mockNavigateBack));

        await act(async () => {
            await result.current.handleSave();
        });

        expect(adminClassController.createClassCourse).toHaveBeenCalledWith(expect.objectContaining({
            classCode: 'L01',
            dayOfWeek: '2',
            startPeriod: '1',
            endPeriod: '3',
            daySession: 'Sáng',
            room: 'D3-301',
            maxSlots: '50',
            subClassCode: 'NULL', // fallback
            notes: 'NULL',    // fallback
            requiresExperiment: 'NULL',     // fallback
            teachingType: 'NULL' // fallback
        }));
        expect(alertSpy).toHaveBeenCalledWith('Thành công: Đã lưu lớp học mới!');
        expect(mockNavigateBack).toHaveBeenCalled();

        alertSpy.mockRestore();
    });

    it('should handle missing ID when editing class', async () => {
        const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
        const mockNavigateBack = vi.fn();

        const { result } = renderHook(() => useAdminCreateClassViewModel({
            classCode: 'L01',
            dayOfWeek: '2',
            startPeriod: '1',
            endPeriod: '3',
            daySession: 'Sáng',
            room: 'D3-301',
            maxSlots: '50',
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
            classCode: 'L01',
            dayOfWeek: '2',
            startPeriod: '1',
            endPeriod: '3',
            daySession: 'Sáng',
            room: 'D3-301',
            maxSlots: '50',
        }, mockNavigateBack, true)); // isEdit = true

        await act(async () => {
            await result.current.handleSave();
        });

        expect(adminClassController.updateClassCourse).toHaveBeenCalledWith(99, expect.objectContaining({
            id: 99,
            classCode: 'L01',
            dayOfWeek: '2',
            startPeriod: '1',
            endPeriod: '3',
            daySession: 'Sáng',
            room: 'D3-301',
            maxSlots: '50',
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
            classCode: 'L01',
            dayOfWeek: '2',
            startPeriod: '1',
            endPeriod: '3',
            daySession: 'Sáng',
            room: 'D3-301',
            maxSlots: '50',
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
