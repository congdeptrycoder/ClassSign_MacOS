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

// Mock logger to suppress log output during tests
vi.mock('../../../../src/shared/utils/logger', () => ({
  Logger: { info: vi.fn(), error: vi.fn(), warn: vi.fn() },
}));

describe('useClassRegistrationViewModel', () => {
  const setAlarmMessage = vi.fn();
  const setIsSubmitting = vi.fn();
  /** courseId used in all tests */
  const COURSE_ID = 101;
  /** classId used in all tests */
  const CLASS_ID = 201;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockClasses = [
    { id: CLASS_ID, courseId: COURSE_ID, code: 'CS101-A', name: 'CS Class', credits: 3, totalSlots: 40, occupiedSlots: 10 },
  ];

  // ── toggleCourseExpansion ────────────────────────────────────
  it('should toggle expansion and fetch classes when expanding for the first time', async () => {
    (classRegistrationController.getClassesForCourse as any).mockResolvedValue(mockClasses);

    const { result } = renderHook(() =>
      useClassRegistrationViewModel(1, 'register_class', setAlarmMessage, setIsSubmitting)
    );

    // Expand
    await act(async () => {
      await result.current.toggleCourseExpansion(COURSE_ID);
    });

    expect(result.current.expandedCourseIds.has(COURSE_ID)).toBe(true);
    expect(classRegistrationController.getClassesForCourse).toHaveBeenCalledWith(1, COURSE_ID);
    expect(result.current.courseClassesData[COURSE_ID]).toEqual(mockClasses);

    // Collapse
    await act(async () => {
      await result.current.toggleCourseExpansion(COURSE_ID);
    });

    expect(result.current.expandedCourseIds.has(COURSE_ID)).toBe(false);
    // Should not call API again (cache hit)
    expect(classRegistrationController.getClassesForCourse).toHaveBeenCalledTimes(1);
  });

  it('should handle expansion loading error', async () => {
    (classRegistrationController.getClassesForCourse as any).mockRejectedValue(new Error('Fetch failed'));

    const { result } = renderHook(() =>
      useClassRegistrationViewModel(1, 'register_class', setAlarmMessage, setIsSubmitting)
    );

    await act(async () => {
      await result.current.toggleCourseExpansion(COURSE_ID);
    });

    expect(result.current.isLoadingClasses[COURSE_ID]).toBe(false);
  });

  // ── handleRegisterClassSection ────────────────────────────────
  it('should register class successfully when period is valid', async () => {
    (classRegistrationController.registerClass as any).mockResolvedValue({ success: true });
    (classRegistrationController.getClassesForCourse as any).mockResolvedValue(mockClasses);
    const emitSpy = vi.spyOn(FrontendEventBus, 'emit');

    const { result } = renderHook(() =>
      useClassRegistrationViewModel(1, 'register_class', setAlarmMessage, setIsSubmitting)
    );

    await act(async () => {
      await result.current.handleRegisterClassSection(CLASS_ID, COURSE_ID, 'CS101-A');
    });

    expect(setIsSubmitting).toHaveBeenCalledWith(true);
    expect(classRegistrationController.registerClass).toHaveBeenCalledWith(1, CLASS_ID);
    expect(setAlarmMessage).toHaveBeenCalledWith('Đã đăng ký lớp học phần CS101-A thành công.');

    // Must emit both events so both cache and timetable refresh
    expect(emitSpy).toHaveBeenCalledWith(FRONTEND_EVENTS.CLASS_SLOTS_CHANGED, { courseId: COURSE_ID });
    expect(emitSpy).toHaveBeenCalledWith(FRONTEND_EVENTS.TIMETABLE_CHANGED);
    expect(setIsSubmitting).toHaveBeenCalledWith(false);
  });

  it('should prevent registration if period type is not register_class', async () => {
    const { result } = renderHook(() =>
      useClassRegistrationViewModel(1, 'register_program', setAlarmMessage, setIsSubmitting)
    );

    await act(async () => {
      await result.current.handleRegisterClassSection(CLASS_ID, COURSE_ID, 'CS101-A');
    });

    expect(classRegistrationController.registerClass).not.toHaveBeenCalled();
    expect(setAlarmMessage).toHaveBeenCalledWith('Hiện không trong giai đoạn đăng ký lớp học.');
  });

  it('should handle registration failure with api message', async () => {
    (classRegistrationController.registerClass as any).mockRejectedValue(new Error('Class full'));

    const { result } = renderHook(() =>
      useClassRegistrationViewModel(1, 'register_class', setAlarmMessage, setIsSubmitting)
    );

    await act(async () => {
      await result.current.handleRegisterClassSection(CLASS_ID, COURSE_ID, 'CS101-A');
    });

    expect(setAlarmMessage).toHaveBeenCalledWith('Class full');
  });

  it('should handle registration failure with fallback message', async () => {
    (classRegistrationController.registerClass as any).mockRejectedValue({});

    const { result } = renderHook(() =>
      useClassRegistrationViewModel(1, 'register_class', setAlarmMessage, setIsSubmitting)
    );

    await act(async () => {
      await result.current.handleRegisterClassSection(CLASS_ID, COURSE_ID, 'CS101-A');
    });

    expect(setAlarmMessage).toHaveBeenCalledWith('Đăng ký thất bại.');
  });

  // ── handleCancelClassSection ──────────────────────────────────
  it('should cancel registration successfully when confirmed', async () => {
    (classRegistrationController.cancelClassRegistration as any).mockResolvedValue({ success: true });
    (classRegistrationController.getClassesForCourse as any).mockResolvedValue(mockClasses);
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    const emitSpy = vi.spyOn(FrontendEventBus, 'emit');

    const { result } = renderHook(() =>
      useClassRegistrationViewModel(1, 'register_class', setAlarmMessage, setIsSubmitting)
    );

    await act(async () => {
      await result.current.handleCancelClassSection(CLASS_ID, COURSE_ID, 'CS101-A');
    });

    expect(classRegistrationController.cancelClassRegistration).toHaveBeenCalledWith(1, CLASS_ID);
    expect(setAlarmMessage).toHaveBeenCalledWith('Đã huỷ lớp học phần CS101-A thành công.');

    // Must emit CLASS_SLOTS_CHANGED with courseId so occupied_slots refreshes
    expect(emitSpy).toHaveBeenCalledWith(FRONTEND_EVENTS.CLASS_SLOTS_CHANGED, { courseId: COURSE_ID });
    expect(emitSpy).toHaveBeenCalledWith(FRONTEND_EVENTS.TIMETABLE_CHANGED);
  });

  it('should prevent cancel registration if period type is not register_class', async () => {
    const { result } = renderHook(() =>
      useClassRegistrationViewModel(1, 'register_program', setAlarmMessage, setIsSubmitting)
    );

    await act(async () => {
      await result.current.handleCancelClassSection(CLASS_ID, COURSE_ID, 'CS101-A');
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
      await result.current.handleCancelClassSection(CLASS_ID, COURSE_ID, 'CS101-A');
    });

    expect(classRegistrationController.cancelClassRegistration).not.toHaveBeenCalled();
  });

  it('should handle cancel failure with error message', async () => {
    (classRegistrationController.cancelClassRegistration as any).mockRejectedValue(new Error('Cancel error'));
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    const { result } = renderHook(() =>
      useClassRegistrationViewModel(1, 'register_class', setAlarmMessage, setIsSubmitting)
    );

    await act(async () => {
      await result.current.handleCancelClassSection(CLASS_ID, COURSE_ID, 'CS101-A');
    });

    expect(setAlarmMessage).toHaveBeenCalledWith('Cancel error');
  });

  it('should handle cancel failure with fallback message', async () => {
    (classRegistrationController.cancelClassRegistration as any).mockRejectedValue({});
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    const { result } = renderHook(() =>
      useClassRegistrationViewModel(1, 'register_class', setAlarmMessage, setIsSubmitting)
    );

    await act(async () => {
      await result.current.handleCancelClassSection(CLASS_ID, COURSE_ID, 'CS101-A');
    });

    expect(setAlarmMessage).toHaveBeenCalledWith('Huỷ thất bại.');
  });

  // ── CLASS_SLOTS_CHANGED Observer ──────────────────────────────
  it('should refresh course classes when CLASS_SLOTS_CHANGED event fires', async () => {
    const updatedClasses = [
      { ...mockClasses[0], occupiedSlots: 9 }, // after cancel: -1
    ];
    (classRegistrationController.getClassesForCourse as any)
      .mockResolvedValueOnce(mockClasses)         // initial fetch via toggleCourseExpansion
      .mockResolvedValueOnce(updatedClasses);      // refresh triggered by event

    const { result } = renderHook(() =>
      useClassRegistrationViewModel(1, 'register_class', setAlarmMessage, setIsSubmitting)
    );

    // First expansion → initial fetch
    await act(async () => {
      await result.current.toggleCourseExpansion(COURSE_ID);
    });
    expect(result.current.courseClassesData[COURSE_ID][0].occupiedSlots).toBe(10);

    // Simulate another component emitting CLASS_SLOTS_CHANGED (e.g. after cancel)
    await act(async () => {
      FrontendEventBus.emit(FRONTEND_EVENTS.CLASS_SLOTS_CHANGED, { courseId: COURSE_ID });
      // Wait for the async fetch inside the listener
      await new Promise(r => setTimeout(r, 0));
    });

    expect(classRegistrationController.getClassesForCourse).toHaveBeenCalledTimes(2);
    expect(result.current.courseClassesData[COURSE_ID][0].occupiedSlots).toBe(9);
  });

  // ── handleRegisterClassFromSearch ────────────────────────────
  it('should register class from search when period is valid', async () => {
    (classRegistrationController.registerClass as any).mockResolvedValue({ success: true });
    (classRegistrationController.getClassesForCourse as any).mockResolvedValue(mockClasses);

    const { result } = renderHook(() =>
      useClassRegistrationViewModel(1, 'register_class', setAlarmMessage, setIsSubmitting)
    );

    await act(async () => {
      await result.current.handleRegisterClassFromSearch(CLASS_ID, COURSE_ID, 'CS101-A');
    });

    expect(classRegistrationController.registerClass).toHaveBeenCalledWith(1, CLASS_ID);
  });

  it('should exit early for register class from search when period is invalid', async () => {
    const { result } = renderHook(() =>
      useClassRegistrationViewModel(1, 'none', setAlarmMessage, setIsSubmitting)
    );

    await act(async () => {
      await result.current.handleRegisterClassFromSearch(CLASS_ID, COURSE_ID, 'CS101-A');
    });

    expect(classRegistrationController.registerClass).not.toHaveBeenCalled();
  });

  it('should handle register class from search failures with error message', async () => {
    (classRegistrationController.registerClass as any).mockRejectedValue(new Error('Failed search reg'));

    const { result } = renderHook(() =>
      useClassRegistrationViewModel(1, 'register_class', setAlarmMessage, setIsSubmitting)
    );

    await act(async () => {
      await result.current.handleRegisterClassFromSearch(CLASS_ID, COURSE_ID, 'CS101-A');
    });

    expect(setAlarmMessage).toHaveBeenCalledWith('Failed search reg');
  });

  it('should handle register class from search failure with fallback message', async () => {
    (classRegistrationController.registerClass as any).mockRejectedValue({});

    const { result } = renderHook(() =>
      useClassRegistrationViewModel(1, 'register_class', setAlarmMessage, setIsSubmitting)
    );

    await act(async () => {
      await result.current.handleRegisterClassFromSearch(CLASS_ID, COURSE_ID, 'CS101-A');
    });

    expect(setAlarmMessage).toHaveBeenCalledWith('Đăng ký thất bại.');
  });
});
