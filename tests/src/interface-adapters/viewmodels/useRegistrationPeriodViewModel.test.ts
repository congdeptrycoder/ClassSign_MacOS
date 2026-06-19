/**
 * @vitest-environment jsdom
 */
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useRegistrationPeriodViewModel } from '../../../../src/interface-adapters/viewmodels/StudentDashboard/useRegistrationPeriodViewModel';
import { academicPeriodController } from '../../../../src/di/admin.di';

vi.mock('../../../../src/di/admin.di', () => ({
  academicPeriodController: {
    getAll: vi.fn(),
  },
}));

describe('useRegistrationPeriodViewModel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should initialize with "none" and fetch registration periods', async () => {
    (academicPeriodController.getAll as any).mockResolvedValue([]);

    const { result } = renderHook(() => useRegistrationPeriodViewModel());

    expect(result.current.currentRegPeriodType).toBe('none');
    expect(result.current.activeSemesterId).toBeNull();
    expect(result.current.activeSemesterName).toBeNull();

    await act(async () => {
      await Promise.resolve(); // Flush microtasks
    });

    expect(academicPeriodController.getAll).toHaveBeenCalled();
  });

  it('should set status to active period type if current time is within period range', async () => {
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();

    (academicPeriodController.getAll as any).mockResolvedValue([
      {
        id: 1,
        semester: 20231,
        semester_name: 1,
        period_type: 'register_program',
        start_date: yesterday,
        end_date: tomorrow,
        is_active: 1,
      },
    ]);

    const { result } = renderHook(() => useRegistrationPeriodViewModel());

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.currentRegPeriodType).toBe('register_program');
    expect(result.current.activeSemesterId).toBe(20231);
    expect(result.current.activeSemesterName).toBe(1);
  });

  it('should set status to none if active period range is outside current time', async () => {
    const now = new Date();
    const lastWeekStart = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString();
    const lastWeekEnd = new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000).toISOString();

    (academicPeriodController.getAll as any).mockResolvedValue([
      {
        id: 1,
        semester: 20231,
        semester_name: 1,
        period_type: 'register_class',
        start_date: lastWeekStart,
        end_date: lastWeekEnd,
        is_active: 1,
      },
    ]);

    const { result } = renderHook(() => useRegistrationPeriodViewModel());

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.currentRegPeriodType).toBe('none');
    expect(result.current.activeSemesterId).toBe(20231);
    expect(result.current.activeSemesterName).toBe(1);
  });

  it('should default to "none" and null fields if no period is active', async () => {
    (academicPeriodController.getAll as any).mockResolvedValue([
      {
        id: 1,
        semester: 20231,
        semester_name: 1,
        period_type: 'register_class',
        start_date: '2023-01-01',
        end_date: '2023-02-01',
        is_active: 0,
      },
    ]);

    const { result } = renderHook(() => useRegistrationPeriodViewModel());

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.currentRegPeriodType).toBe('none');
    expect(result.current.activeSemesterId).toBeNull();
    expect(result.current.activeSemesterName).toBeNull();
  });

  it('should log error and fallback to none on catch block', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    (academicPeriodController.getAll as any).mockRejectedValue(new Error('Failed to get periods'));

    const { result } = renderHook(() => useRegistrationPeriodViewModel());

    await act(async () => {
      await Promise.resolve();
    });

    expect(consoleSpy).toHaveBeenCalledWith('Lỗi khi kiểm tra đợt đăng ký từ server', expect.any(Error));
    expect(result.current.currentRegPeriodType).toBe('none');
    consoleSpy.mockRestore();
  });

  it('should run periodically using setInterval', async () => {
    (academicPeriodController.getAll as any).mockResolvedValue([]);

    renderHook(() => useRegistrationPeriodViewModel());

    await act(async () => {
      await Promise.resolve();
    });

    expect(academicPeriodController.getAll).toHaveBeenCalledTimes(1);

    await act(async () => {
      vi.advanceTimersByTime(60000);
    });

    expect(academicPeriodController.getAll).toHaveBeenCalledTimes(2);
  });
});
