/**
 * @vitest-environment jsdom
 */
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useCurriculumViewModel } from '../../../../src/interface-adapters/viewmodels/Curriculum/useCurriculumViewModel';
import { curriculumController, courseRegistrationController } from '../../../../src/di/student.di';

vi.mock('../../../../src/di/student.di', () => ({
  curriculumController: {
    getCurriculum: vi.fn(),
  },
  courseRegistrationController: {
    registerCourse: vi.fn(),
  },
}));

describe('useCurriculumViewModel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockCurriculum = {
    student: { id: 1, name: 'Student', username: 'stud' },
    program: { id: 10, code: 'PROGRAM', name: 'Program Name' },
    courses: [
      {
        curriculumId: 1,
        courseId: 101,
        code: 'CS101',
        name: 'Intro to CS',
        credits: 3,
        status: 'available',
        statusLabel: 'Available',
        hasStudied: false,
        studyStatusLabel: 'Not Studied',
        canRegister: true,
      },
    ],
  } as any;

  it('should load curriculum on mount', async () => {
    (curriculumController.getCurriculum as any).mockResolvedValue(mockCurriculum);

    const { result } = renderHook(() => useCurriculumViewModel(1));

    expect(result.current.isLoading).toBe(true);

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(curriculumController.getCurriculum).toHaveBeenCalledWith(1);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.curriculum).toEqual(mockCurriculum);
    expect(result.current.error).toBeNull();
  });

  it('should set error on load failure with error message', async () => {
    (curriculumController.getCurriculum as any).mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useCurriculumViewModel(1));

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.curriculum).toBeNull();
    expect(result.current.error).toBe('Network error');
  });

  it('should set fallback error on load failure with no error message', async () => {
    (curriculumController.getCurriculum as any).mockRejectedValue({});

    const { result } = renderHook(() => useCurriculumViewModel(1));

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(result.current.error).toBe('Không thể tải chương trình đào tạo.');
  });

  it('should register course successfully and reload curriculum', async () => {
    (curriculumController.getCurriculum as any).mockResolvedValue(mockCurriculum);
    
    let resolveRegister: any;
    const registerPromise = new Promise((resolve) => {
      resolveRegister = resolve;
    });
    (courseRegistrationController.registerCourse as any).mockReturnValue(registerPromise);

    const { result } = renderHook(() => useCurriculumViewModel(1));

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    const courseToRegister = mockCurriculum.courses[0];

    let handlePromise: any;
    act(() => {
      handlePromise = result.current.handleRegisterCourse(courseToRegister);
    });

    // Verify it is in registering state before resolving
    expect(result.current.registeringCourseId).toBe(101);

    // Resolve the registration
    await act(async () => {
      resolveRegister({ success: true });
      await handlePromise;
    });

    expect(courseRegistrationController.registerCourse).toHaveBeenCalledWith(1, 101);
    expect(result.current.alarmMessage).toBe('Đã đăng ký học phần CS101.');
    expect(result.current.registeringCourseId).toBeNull();
    expect(curriculumController.getCurriculum).toHaveBeenCalledTimes(2);
  });

  it('should set failure alarm message on registration error', async () => {
    (curriculumController.getCurriculum as any).mockResolvedValue(mockCurriculum);
    (courseRegistrationController.registerCourse as any).mockRejectedValue(new Error('Prerequisite missing'));

    const { result } = renderHook(() => useCurriculumViewModel(1));

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    const courseToRegister = mockCurriculum.courses[0];

    await act(async () => {
      await result.current.handleRegisterCourse(courseToRegister);
    });

    expect(result.current.alarmMessage).toBe('Prerequisite missing');
    expect(result.current.registeringCourseId).toBeNull();
  });

  it('should set fallback alarm message on registration error without message', async () => {
    (curriculumController.getCurriculum as any).mockResolvedValue(mockCurriculum);
    (courseRegistrationController.registerCourse as any).mockRejectedValue({});

    const { result } = renderHook(() => useCurriculumViewModel(1));

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    const courseToRegister = mockCurriculum.courses[0];

    await act(async () => {
      await result.current.handleRegisterCourse(courseToRegister);
    });

    expect(result.current.alarmMessage).toBe('Đăng ký học phần thất bại.');
  });
});
