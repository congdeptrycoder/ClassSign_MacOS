/**
 * @vitest-environment jsdom
 */
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useClassRegistrationViewModel } from '../../../../src/interface-adapters/viewmodels/StudentDashboard/useClassRegistrationViewModel';
import { classRegistrationController } from '../../../../src/di/student.di';
import { FrontendEventBus, FRONTEND_EVENTS } from '../../../../src/shared/utils/FrontendEventBus';

vi.mock('../../../../src/di/student.di', () => ({
  classRegistrationController: {
    getClassesForCourse: vi.fn(),
    registerClass: vi.fn(),
    cancelClassRegistration: vi.fn(),
  },
}));

describe('useClassRegistrationViewModel', () => {
  const setAlarmMessage = vi.fn();
  const setIsSubmitting = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockClasses = [
    { id: 201, courseId: 101, code: 'CS101-A', name: 'CS Class', credits: 3, totalSlots: 40, occupiedSlots: 10 },
  ];

  it('should toggle expansion and fetch classes when expanding for the first time', async () => {
    (classRegistrationController.getClassesForCourse as any).mockResolvedValue(mockClasses);

    const { result } = renderHook(() =>
      useClassRegistrationViewModel(1, 'register_class', setAlarmMessage, setIsSubmitting)
    );

    // Expand
    await act(async () => {
      await result.current.toggleCourseExpansion(101);
    });

    expect(result.current.expandedCourseIds.has(101)).toBe(true);
    expect(classRegistrationController.getClassesForCourse).toHaveBeenCalledWith(1, 101);
    expect(result.current.courseClassesData[101]).toEqual(mockClasses);

    // Collapse
    await act(async () => {
      await result.current.toggleCourseExpansion(101);
    });

    expect(result.current.expandedCourseIds.has(101)).toBe(false);
    // Should not call API again
    expect(classRegistrationController.getClassesForCourse).toHaveBeenCalledTimes(1);
  });

  it('should handle expansion loading error', async () => {
    (classRegistrationController.getClassesForCourse as any).mockRejectedValue(new Error('Fetch failed'));

    const { result } = renderHook(() =>
      useClassRegistrationViewModel(1, 'register_class', setAlarmMessage, setIsSubmitting)
    );

    await act(async () => {
      await result.current.toggleCourseExpansion(101);
    });

    expect(setAlarmMessage).toHaveBeenCalledWith('Không thể tải danh sách lớp học phần này.');
    expect(result.current.isLoadingClasses[101]).toBe(false);
  });

  it('should register class successfully when period is valid', async () => {
    (classRegistrationController.registerClass as any).mockResolvedValue({ success: true });
    const emitSpy = vi.spyOn(FrontendEventBus, 'emit');

    const { result } = renderHook(() =>
      useClassRegistrationViewModel(1, 'register_class', setAlarmMessage, setIsSubmitting)
    );

    await act(async () => {
      await result.current.handleRegisterClassSection(201, 'CS101-A');
    });

    expect(setIsSubmitting).toHaveBeenCalledWith(true);
    expect(classRegistrationController.registerClass).toHaveBeenCalledWith(1, 201);
    expect(setAlarmMessage).toHaveBeenCalledWith('Đã đăng ký lớp học phần CS101-A thành công.');
    expect(emitSpy).toHaveBeenCalledWith(FRONTEND_EVENTS.TIMETABLE_CHANGED);
    expect(setIsSubmitting).toHaveBeenCalledWith(false);
  });

  it('should prevent registration if period type is not register_class', async () => {
    const { result } = renderHook(() =>
      useClassRegistrationViewModel(1, 'register_program', setAlarmMessage, setIsSubmitting)
    );

    await act(async () => {
      await result.current.handleRegisterClassSection(201, 'CS101-A');
    });

    expect(classRegistrationController.registerClass).not.toHaveBeenCalled();
    expect(setAlarmMessage).toHaveBeenCalledWith('Hiện không trong giai đoạn đăng ký lớp học.');
  });

  it('should handle registration failure with fallback message', async () => {
    (classRegistrationController.registerClass as any).mockRejectedValue({});

    const { result } = renderHook(() =>
      useClassRegistrationViewModel(1, 'register_class', setAlarmMessage, setIsSubmitting)
    );

    await act(async () => {
      await result.current.handleRegisterClassSection(201, 'CS101-A');
    });

    expect(setAlarmMessage).toHaveBeenCalledWith('Đăng ký thất bại.');
  });

  it('should handle registration failure with api message', async () => {
    (classRegistrationController.registerClass as any).mockRejectedValue(new Error('Class full'));

    const { result } = renderHook(() =>
      useClassRegistrationViewModel(1, 'register_class', setAlarmMessage, setIsSubmitting)
    );

    await act(async () => {
      await result.current.handleRegisterClassSection(201, 'CS101-A');
    });

    expect(setAlarmMessage).toHaveBeenCalledWith('Class full');
  });

  it('should cancel registration successfully when confirmed', async () => {
    (classRegistrationController.cancelClassRegistration as any).mockResolvedValue({ success: true });
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    const emitSpy = vi.spyOn(FrontendEventBus, 'emit');

    const { result } = renderHook(() =>
      useClassRegistrationViewModel(1, 'register_class', setAlarmMessage, setIsSubmitting)
    );

    await act(async () => {
      await result.current.handleCancelClassSection(201, 'CS101-A');
    });

    expect(classRegistrationController.cancelClassRegistration).toHaveBeenCalledWith(1, 201);
    expect(setAlarmMessage).toHaveBeenCalledWith('Đã huỷ lớp học phần CS101-A thành công.');
    expect(emitSpy).toHaveBeenCalledWith(FRONTEND_EVENTS.TIMETABLE_CHANGED);
  });

  it('should prevent cancel registration if period type is not register_class', async () => {
    const { result } = renderHook(() =>
      useClassRegistrationViewModel(1, 'register_program', setAlarmMessage, setIsSubmitting)
    );

    await act(async () => {
      await result.current.handleCancelClassSection(201, 'CS101-A');
    });

    expect(classRegistrationController.cancelClassRegistration).not.toHaveBeenCalled();
    expect(setAlarmMessage).toHaveBeenCalledWith('Hiện không trong giai đoạn đăng ký lớp học.');
  });

  it('should not cancel if user rejects confirm dialog', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false);

    const { result } = renderHook(() =>
      useClassRegistrationViewModel(1, 'register_class', setAlarmMessage, setIsSubmitting)
    );

    await act(async () => {
      await result.current.handleCancelClassSection(201, 'CS101-A');
    });

    expect(classRegistrationController.cancelClassRegistration).not.toHaveBeenCalled();
  });

  it('should handle cancel failure with error message and fallback message', async () => {
    (classRegistrationController.cancelClassRegistration as any).mockRejectedValue(new Error('Cancel error'));
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    const { result } = renderHook(() =>
      useClassRegistrationViewModel(1, 'register_class', setAlarmMessage, setIsSubmitting)
    );

    await act(async () => {
      await result.current.handleCancelClassSection(201, 'CS101-A');
    });

    expect(setAlarmMessage).toHaveBeenCalledWith('Cancel error');

    // Test fallback
    (classRegistrationController.cancelClassRegistration as any).mockRejectedValue({});
    await act(async () => {
      await result.current.handleCancelClassSection(201, 'CS101-A');
    });
    expect(setAlarmMessage).toHaveBeenCalledWith('Huỷ thất bại.');
  });

  it('should register class from search when period is valid', async () => {
    (classRegistrationController.registerClass as any).mockResolvedValue({ success: true });

    const { result } = renderHook(() =>
      useClassRegistrationViewModel(1, 'register_class', setAlarmMessage, setIsSubmitting)
    );

    await act(async () => {
      await result.current.handleRegisterClassFromSearch(201, 'CS101-A');
    });

    expect(classRegistrationController.registerClass).toHaveBeenCalledWith(1, 201);
  });

  it('should exit early for register class from search when period is invalid', async () => {
    const { result } = renderHook(() =>
      useClassRegistrationViewModel(1, 'none', setAlarmMessage, setIsSubmitting)
    );

    await act(async () => {
      await result.current.handleRegisterClassFromSearch(201, 'CS101-A');
    });

    expect(classRegistrationController.registerClass).not.toHaveBeenCalled();
  });

  it('should handle register class from search failures with error message and fallback', async () => {
    (classRegistrationController.registerClass as any).mockRejectedValue(new Error('Failed search reg'));

    const { result } = renderHook(() =>
      useClassRegistrationViewModel(1, 'register_class', setAlarmMessage, setIsSubmitting)
    );

    await act(async () => {
      await result.current.handleRegisterClassFromSearch(201, 'CS101-A');
    });

    expect(setAlarmMessage).toHaveBeenCalledWith('Failed search reg');

    // Fallback
    (classRegistrationController.registerClass as any).mockRejectedValue({});
    await act(async () => {
      await result.current.handleRegisterClassFromSearch(201, 'CS101-A');
    });
    expect(setAlarmMessage).toHaveBeenCalledWith('Đăng ký thất bại.');
  });
});
