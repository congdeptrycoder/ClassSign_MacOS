/**
 * @vitest-environment jsdom
 */
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  parseTimetableEvents,
  useTimetableViewModel,
} from '../../../../src/interface-adapters/viewmodels/StudentDashboard/useTimetableViewModel';
import { FrontendEventBus, FRONTEND_EVENTS } from '../../../../src/shared/utils/FrontendEventBus';
import { timetableController } from '../../../../src/di/student.di';

vi.mock('../../../../src/di/student.di', () => ({
  timetableController: {
    getTimetable: vi.fn(),
  },
}));

describe('useTimetableViewModel and parseTimetableEvents', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('parseTimetableEvents', () => {
    it('should return empty array for entry with no detail', () => {
      const entry = { id: 1, classId: 10, code: 'CS101', name: 'Intro' };
      expect(parseTimetableEvents([entry])).toEqual([]);
    });

    it('should return empty array for entry with invalid JSON detail', () => {
      const entry = { id: 1, classId: 10, code: 'CS101', name: 'Intro', detail: '{invalid}' };
      expect(parseTimetableEvents([entry])).toEqual([]);
    });

    it('should parse single day with start/end periods correctly (buoi Sáng)', () => {
      const detailStr = JSON.stringify({
        thu: 2,
        tiet_bd: '2',
        tiet_kt: '4',
        buoi: 'Sáng',
      });
      const entry = { id: 1, classId: 10, code: 'CS101', name: 'Intro', detail: detailStr };
      const events = parseTimetableEvents([entry]);
      expect(events).toEqual([
        { day: 'T2', period: 2, name: 'CS101' },
        { day: 'T2', period: 3, name: 'CS101' },
        { day: 'T2', period: 4, name: 'CS101' },
      ]);
    });

    it('should shift periods by 6 for (buoi Chiều)', () => {
      const detailStr = JSON.stringify({
        thu: 3,
        tiet_bd: '1',
        tiet_kt: '2',
        buoi: 'Chiều',
      });
      const entry = { id: 1, classId: 10, code: 'CS101', name: 'Intro', detail: detailStr };
      const events = parseTimetableEvents([entry]);
      expect(events).toEqual([
        { day: 'T3', period: 7, name: 'CS101' },
        { day: 'T3', period: 8, name: 'CS101' },
      ]);
    });

    it('should return empty if start or end are NaN', () => {
      const detailStr = JSON.stringify({
        thu: 3,
        tiet_bd: 'abc',
        tiet_kt: 'def',
      });
      const entry = { id: 1, classId: 10, code: 'CS101', name: 'Intro', detail: detailStr };
      expect(parseTimetableEvents([entry])).toEqual([]);
    });

    it('should parse slots array format detail correctly', () => {
      const detailStr = JSON.stringify({
        slots: [
          { day: 'T4', periods: [1, 2] },
          { day: 'T5', period: 5 },
        ],
      });
      const entry = { id: 1, classId: 10, code: 'CS101', name: 'Intro', detail: detailStr };
      const events = parseTimetableEvents([entry]);
      expect(events).toEqual([
        { day: 'T4', period: 1, name: 'CS101' },
        { day: 'T4', period: 2, name: 'CS101' },
        { day: 'T5', period: 5, name: 'CS101' },
      ]);
    });

    it('should parse raw array of slots correctly', () => {
      const detailStr = JSON.stringify([
        { day: 'T6', periods: [3] },
      ]);
      const entry = { id: 1, classId: 10, code: 'CS101', name: 'Intro', detail: detailStr };
      const events = parseTimetableEvents([entry]);
      expect(events).toEqual([
        { day: 'T6', period: 3, name: 'CS101' },
      ]);
    });

    it('should return empty if slots is not array-like', () => {
      const detailStr = JSON.stringify({
        slots: 'not an array',
      });
      const entry = { id: 1, classId: 10, code: 'CS101', name: 'Intro', detail: detailStr };
      expect(parseTimetableEvents([entry])).toEqual([]);
    });
  });

  describe('useTimetableViewModel hook', () => {
    it('should fetch timetable on mount', async () => {
      const mockTimetable = [
        { id: 1, classId: 10, code: 'CS101', name: 'Intro', detail: '{"thu":2,"tiet_bd":"1","tiet_kt":"2"}' },
      ];
      (timetableController.getTimetable as any).mockResolvedValue(mockTimetable);

      const { result } = renderHook(() => useTimetableViewModel(123));

      // Wait for useEffect / async load
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      expect(timetableController.getTimetable).toHaveBeenCalledWith(123);
      expect(result.current.registeredClasses).toEqual(mockTimetable);
      expect(result.current.timeGridEvents).toEqual([
        { day: 'T2', period: 1, name: 'CS101' },
        { day: 'T2', period: 2, name: 'CS101' },
      ]);
    });

    it('should log error on fetch failure', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      (timetableController.getTimetable as any).mockRejectedValue(new Error('DB Error'));

      const { result } = renderHook(() => useTimetableViewModel(123));

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      expect(consoleSpy).toHaveBeenCalledWith('Không thể tải thời khóa biểu', expect.any(Error));
      expect(result.current.registeredClasses).toEqual([]);
      consoleSpy.mockRestore();
    });

    it('should reload timetable on FRONTEND_EVENTS.TIMETABLE_CHANGED event', async () => {
      const mockTimetable1 = [
        { id: 1, classId: 10, code: 'CS101', name: 'Intro', detail: '{"thu":2,"tiet_bd":"1","tiet_kt":"1"}' },
      ];
      const mockTimetable2 = [
        { id: 1, classId: 10, code: 'CS101', name: 'Intro', detail: '{"thu":2,"tiet_bd":"1","tiet_kt":"1"}' },
        { id: 2, classId: 20, code: 'CS102', name: 'OOP', detail: '{"thu":3,"tiet_bd":"1","tiet_kt":"1"}' },
      ];

      (timetableController.getTimetable as any)
        .mockResolvedValueOnce(mockTimetable1)
        .mockResolvedValueOnce(mockTimetable2);

      const { result } = renderHook(() => useTimetableViewModel(123));

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      expect(result.current.registeredClasses).toEqual(mockTimetable1);

      // Trigger change event
      await act(async () => {
        FrontendEventBus.emit(FRONTEND_EVENTS.TIMETABLE_CHANGED);
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      expect(result.current.registeredClasses).toEqual(mockTimetable2);
    });
  });
});
