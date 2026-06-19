/**
 * @vitest-environment jsdom
 */
import { renderHook, act } from '@testing-library/react';
import { useCourseRegistrationViewModel } from '../../../../src/interface-adapters/viewmodels/StudentDashboard/useCourseRegistrationViewModel';
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../../../src/di/student.di', () => ({
    courseRegistrationController: {
        getRegisteredCourses: vi.fn(),
        registerCourse: vi.fn(),
        cancelCourseRegistration: vi.fn(),
    },
    curriculumController: {
        getCurriculum: vi.fn(),
    }
}));

import { courseRegistrationController, curriculumController } from '../../../../src/di/student.di';
import { Account } from '../../../../src/domain/entities/Account';

describe('useCourseRegistrationViewModel', () => {
    const mockSetAlarmMessage = vi.fn();
    const mockSetIsSubmitting = vi.fn();
    const mockAccount = new Account(1, 'student', 'Student Test', 'student', '123', 'study');

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should initialize and load courses', async () => {
        (courseRegistrationController.getRegisteredCourses as any).mockResolvedValue([
            { id: 1, courseId: 101, semester: 20231, code: 'IT101', name: 'Intro', credits: 3, status: 'registered' }
        ]);
        (curriculumController.getCurriculum as any).mockResolvedValue({
            courses: [
                { courseId: 101, code: 'IT101', name: 'Intro', credits: 3 }
            ]
        });

        const { result } = renderHook(() => useCourseRegistrationViewModel(
            1, mockAccount, 20231, 'register_program', mockSetAlarmMessage, mockSetIsSubmitting
        ));

        // Wait for reloadCourses to finish
        await act(async () => {
            await new Promise(resolve => setTimeout(resolve, 0));
        });

        expect(result.current.registeredSubjects.length).toBe(1);
        expect(result.current.totalCredits).toBe(3);
    });

    it('should register subject', async () => {
        (courseRegistrationController.getRegisteredCourses as any).mockResolvedValue([]);
        (curriculumController.getCurriculum as any).mockResolvedValue({
            courses: [
                { courseId: 101, code: 'IT101', name: 'Intro', credits: 3 }
            ]
        });
        (courseRegistrationController.registerCourse as any).mockResolvedValue({ message: 'Success' });

        const { result } = renderHook(() => useCourseRegistrationViewModel(
            1, mockAccount, 20231, 'register_program', mockSetAlarmMessage, mockSetIsSubmitting
        ));

        await act(async () => {
            await new Promise(resolve => setTimeout(resolve, 0));
        });

        act(() => {
            result.current.handleSearchQueryChange('IT101');
        });

        // wait for debounce
        await act(async () => {
            await new Promise(resolve => setTimeout(resolve, 300));
        });

        await act(async () => {
            await result.current.handleRegisterSubject();
        });

        expect(courseRegistrationController.registerCourse).toHaveBeenCalledWith(1, 101);
        expect(mockSetAlarmMessage).toHaveBeenCalledWith('Success');
    });

    it('should delete subject and handle cancel/confirm states', async () => {
        (courseRegistrationController.getRegisteredCourses as any).mockResolvedValue([]);
        (curriculumController.getCurriculum as any).mockResolvedValue({ courses: [] });
        (courseRegistrationController.cancelCourseRegistration as any).mockResolvedValue({});

        const { result } = renderHook(() => useCourseRegistrationViewModel(
            1, mockAccount, 20231, 'register_program', mockSetAlarmMessage, mockSetIsSubmitting
        ));

        // Prompt delete
        act(() => {
            result.current.promptDeleteCourse(101);
        });
        expect(result.current.courseIdToDelete).toBe(101);

        // Cancel delete
        act(() => {
            result.current.cancelDeleteCourse();
        });
        expect(result.current.courseIdToDelete).toBeNull();

        // Prompt again
        act(() => {
            result.current.promptDeleteCourse(102);
        });

        await act(async () => {
            await result.current.confirmDeleteCourse();
        });

        expect(courseRegistrationController.cancelCourseRegistration).toHaveBeenCalledWith(1, 102);
        expect(mockSetAlarmMessage).toHaveBeenCalledWith('Xoá đăng ký học phần thành công.');
        expect(result.current.courseIdToDelete).toBeNull();
    });

    it('should handle account null values for credits and notes fallback', async () => {
        (courseRegistrationController.getRegisteredCourses as any).mockResolvedValue([]);
        (curriculumController.getCurriculum as any).mockResolvedValue({ courses: [] });

        const { result } = renderHook(() => useCourseRegistrationViewModel(
            1, null, 20231, 'register_program', mockSetAlarmMessage, mockSetIsSubmitting
        ));

        await act(async () => {
            await new Promise(resolve => setTimeout(resolve, 0));
        });

        expect(result.current.maxCredits).toBe(24);
        expect(result.current.statusNote).toBe('Bạn được đăng ký tối đa 24 TC');
    });

    it('should prevent registration if currentRegPeriodType is not register_program', async () => {
        const { result } = renderHook(() => useCourseRegistrationViewModel(
            1, mockAccount, 20231, 'none', mockSetAlarmMessage, mockSetIsSubmitting
        ));

        await act(async () => {
            await new Promise(resolve => setTimeout(resolve, 0));
        });

        await act(async () => {
            await result.current.handleRegisterSubject();
        });

        expect(courseRegistrationController.registerCourse).not.toHaveBeenCalled();
    });

    it('should fail registration if query is empty or no suggestion is chosen', async () => {
        const { result } = renderHook(() => useCourseRegistrationViewModel(
            1, mockAccount, 20231, 'register_program', mockSetAlarmMessage, mockSetIsSubmitting
        ));

        await act(async () => {
            await new Promise(resolve => setTimeout(resolve, 0));
        });

        // Empty query
        await act(async () => {
            await result.current.handleRegisterSubject();
        });
        expect(mockSetAlarmMessage).toHaveBeenCalledWith('Vui lòng nhập mã hoặc tên học phần.');

        // No suggestion matched
        act(() => {
            result.current.handleSearchQueryChange('XYZ');
        });
        await act(async () => {
            await result.current.handleRegisterSubject();
        });
        expect(mockSetAlarmMessage).toHaveBeenCalledWith('Vui lòng chọn một gợi ý hợp lệ từ danh sách.');
    });

    it('should fail registration if credit limit is exceeded', async () => {
        // Mock account with low credits (e.g. status Warning 3 which allows 12 credits)
        const warningAccount = new Account(1, 'student', 'Student Test', 'student', '123', 'study_cc3');

        (courseRegistrationController.getRegisteredCourses as any).mockResolvedValue([
            { id: 1, courseId: 99, semester: 20231, code: 'IT99', name: 'Other', credits: 10, status: 'registered' }
        ]);
        (curriculumController.getCurriculum as any).mockResolvedValue({
            courses: [
                { courseId: 101, code: 'IT101', name: 'Intro', credits: 3 }
            ]
        });

        const { result } = renderHook(() => useCourseRegistrationViewModel(
            1, warningAccount, 20231, 'register_program', mockSetAlarmMessage, mockSetIsSubmitting
        ));

        await act(async () => {
            await new Promise(resolve => setTimeout(resolve, 0));
        });

        // Set search query
        act(() => {
            result.current.handleSearchQueryChange('IT101');
        });
        await act(async () => {
            await new Promise(resolve => setTimeout(resolve, 300));
        });

        // Register -> 10 + 3 = 13 > 12 (Warning 3 limit)
        await act(async () => {
            await result.current.handleRegisterSubject();
        });

        expect(mockSetAlarmMessage).toHaveBeenCalledWith('Tổng số TC vượt quá giới hạn. Số TC cho phép của bạn là 12 TC.');
    });

    it('should handle registration and cancel API failures', async () => {
        (courseRegistrationController.getRegisteredCourses as any).mockResolvedValue([]);
        (curriculumController.getCurriculum as any).mockResolvedValue({
            courses: [{ courseId: 101, code: 'IT101', name: 'Intro', credits: 3 }]
        });
        (courseRegistrationController.registerCourse as any).mockRejectedValue(new Error('Reg error'));

        const { result } = renderHook(() => useCourseRegistrationViewModel(
            1, mockAccount, 20231, 'register_program', mockSetAlarmMessage, mockSetIsSubmitting
        ));

        await act(async () => {
            await new Promise(resolve => setTimeout(resolve, 0));
        });

        act(() => {
            result.current.handleSearchQueryChange('IT101');
        });
        await act(async () => {
            await new Promise(resolve => setTimeout(resolve, 300));
        });

        await act(async () => {
            await result.current.handleRegisterSubject();
        });
        expect(mockSetAlarmMessage).toHaveBeenCalledWith('Reg error');

        // Reg failure without message
        (courseRegistrationController.registerCourse as any).mockRejectedValue({});
        await act(async () => {
            await result.current.handleRegisterSubject();
        });
        expect(mockSetAlarmMessage).toHaveBeenCalledWith('Đăng ký thất bại.');

        // Cancel failure
        (courseRegistrationController.cancelCourseRegistration as any).mockRejectedValue(new Error('Cancel error'));
        act(() => {
            result.current.promptDeleteCourse(101);
        });
        await act(async () => {
            await result.current.confirmDeleteCourse();
        });
        expect(mockSetAlarmMessage).toHaveBeenCalledWith('Cancel error');

        // Cancel failure without message
        (courseRegistrationController.cancelCourseRegistration as any).mockRejectedValue({});
        act(() => {
            result.current.promptDeleteCourse(101);
        });
        await act(async () => {
            await result.current.confirmDeleteCourse();
        });
        expect(mockSetAlarmMessage).toHaveBeenCalledWith('Xoá thất bại.');
    });

    it('should handle registering a course that is already registered', async () => {
        (courseRegistrationController.getRegisteredCourses as any).mockResolvedValue([
            { id: 1, courseId: 101, semester: 20231, code: 'IT101', name: 'Intro', credits: 3, status: 'registered' }
        ]);
        (curriculumController.getCurriculum as any).mockResolvedValue({
            courses: [
                { courseId: 101, code: 'IT101', name: 'Intro', credits: 3 }
            ]
        });
        (courseRegistrationController.registerCourse as any).mockResolvedValue({ message: 'Success' });

        const { result } = renderHook(() => useCourseRegistrationViewModel(
            1, mockAccount, 20231, 'register_program', mockSetAlarmMessage, mockSetIsSubmitting
        ));

        await act(async () => {
            await new Promise(resolve => setTimeout(resolve, 0));
        });

        act(() => {
            result.current.handleSearchQueryChange('IT101');
        });
        await act(async () => {
            await new Promise(resolve => setTimeout(resolve, 300));
        });

        await act(async () => {
            await result.current.handleRegisterSubject();
        });

        expect(courseRegistrationController.registerCourse).toHaveBeenCalledWith(1, 101);
    });

    it('should return early in confirmDeleteCourse if courseIdToDelete is null', async () => {
        const { result } = renderHook(() => useCourseRegistrationViewModel(
            1, mockAccount, 20231, 'register_program', mockSetAlarmMessage, mockSetIsSubmitting
        ));
        await act(async () => {
            await new Promise(resolve => setTimeout(resolve, 0));
        });
        await act(async () => {
            await result.current.confirmDeleteCourse();
        });
        expect(courseRegistrationController.cancelCourseRegistration).not.toHaveBeenCalled();
    });

    it('should match search query by name and register using name fallback', async () => {
        (courseRegistrationController.getRegisteredCourses as any).mockResolvedValue([]);
        (curriculumController.getCurriculum as any).mockResolvedValue({
            courses: [
                { courseId: 101, code: 'IT101', name: 'Intro', credits: 3 }
            ]
        });
        (courseRegistrationController.registerCourse as any).mockResolvedValue({ message: 'Success' });

        const { result } = renderHook(() => useCourseRegistrationViewModel(
            1, mockAccount, 20231, 'register_program', mockSetAlarmMessage, mockSetIsSubmitting
        ));

        await act(async () => {
            await new Promise(resolve => setTimeout(resolve, 0));
        });

        // Search by name "intro"
        act(() => {
            result.current.handleSearchQueryChange('intro');
        });
        await act(async () => {
            await new Promise(resolve => setTimeout(resolve, 300));
        });

        // Register (no selectedSuggestion, it will use fallbackSuggestion matching by name)
        await act(async () => {
            await result.current.handleRegisterSubject();
        });

        expect(courseRegistrationController.registerCourse).toHaveBeenCalledWith(1, 101);
    });

    it('should map various status labels', async () => {
        (courseRegistrationController.getRegisteredCourses as any).mockResolvedValue([
            { id: 1, courseId: 101, semester: 20231, code: 'IT101', name: 'Intro', credits: 3, status: 'completed' },
            { id: 2, courseId: 102, semester: 20231, code: 'IT102', name: 'OOP', credits: 3, status: 're_registered' },
            { id: 3, courseId: 103, semester: 20231, code: 'IT103', name: 'DB', credits: 3, status: 'cancelled' },
            { id: 4, courseId: 104, semester: 20231, code: 'IT104', name: 'OS', credits: 3, status: 'other_status' },
        ]);
        (curriculumController.getCurriculum as any).mockResolvedValue({ courses: [] });

        // Pass a plain JS object to test fallback instantiation of Account
        const plainAccount = { id: 1, username: 'student', name: 'Student Test', role: 'student', id_card: '123', status: 'study' };

        const { result } = renderHook(() => useCourseRegistrationViewModel(
            1, plainAccount as any, 20231, 'register_program', mockSetAlarmMessage, mockSetIsSubmitting
        ));

        await act(async () => {
            await new Promise(resolve => setTimeout(resolve, 0));
        });

        expect(result.current.registeredSubjects[0].status).toBe('Đã học');
        expect(result.current.registeredSubjects[1].status).toBe('Học cải thiện');
        expect(result.current.registeredSubjects[2].status).toBe('Đã hủy');
        expect(result.current.registeredSubjects[3].status).toBe('other_status');
        expect(result.current.maxCredits).toBe(24);
        expect(result.current.statusNote).toBe('Bạn được đăng ký tối đa 24 TC');
    });

    it('should handle load API failures in reloadCourses', async () => {
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        (courseRegistrationController.getRegisteredCourses as any).mockRejectedValue(new Error('Load Error'));

        renderHook(() => useCourseRegistrationViewModel(
            1, mockAccount, 20231, 'register_program', mockSetAlarmMessage, mockSetIsSubmitting
        ));

        await act(async () => {
            await new Promise(resolve => setTimeout(resolve, 0));
        });

        expect(consoleSpy).toHaveBeenCalledWith('Lỗi khi tải dữ liệu đăng ký học phần', expect.any(Error));
        consoleSpy.mockRestore();
    });

    it('should select suggestion', async () => {
        const { result } = renderHook(() => useCourseRegistrationViewModel(
            1, mockAccount, 20231, 'register_program', mockSetAlarmMessage, mockSetIsSubmitting
        ));

        await act(async () => {
            await new Promise(resolve => setTimeout(resolve, 0));
        });

        const item = { code: 'IT101', name: 'Intro' } as any;
        act(() => {
            result.current.handleSelectSuggestion(item);
        });

        expect(result.current.searchQuery).toBe('IT101');
        expect(result.current.isSuggestionVisible).toBe(false);
    });
});
