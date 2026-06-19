/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FrontendEventBus, FRONTEND_EVENTS } from '../../../../src/shared/utils/FrontendEventBus';

describe('FrontendEventBus', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should register a listener, emit an event, and receive details', () => {
    const listener = vi.fn();
    
    FrontendEventBus.on(FRONTEND_EVENTS.TIMETABLE_CHANGED, listener);
    
    const mockDetail = { classId: 101, status: 'registered' };
    FrontendEventBus.emit(FRONTEND_EVENTS.TIMETABLE_CHANGED, mockDetail);
    
    expect(listener).toHaveBeenCalledTimes(1);
    
    const eventArg = listener.mock.calls[0][0] as CustomEvent;
    expect(eventArg.detail).toEqual(mockDetail);
    
    // Clean up
    FrontendEventBus.off(FRONTEND_EVENTS.TIMETABLE_CHANGED, listener);
  });

  it('should stop receiving events after calling off', () => {
    const listener = vi.fn();
    
    FrontendEventBus.on(FRONTEND_EVENTS.TIMETABLE_CHANGED, listener);
    FrontendEventBus.off(FRONTEND_EVENTS.TIMETABLE_CHANGED, listener);
    
    FrontendEventBus.emit(FRONTEND_EVENTS.TIMETABLE_CHANGED, { id: 1 });
    
    expect(listener).not.toHaveBeenCalled();
  });

  it('should handle emit without details parameter', () => {
    const listener = vi.fn();
    
    FrontendEventBus.on('TEST_EVENT', listener);
    FrontendEventBus.emit('TEST_EVENT');
    
    expect(listener).toHaveBeenCalledTimes(1);
    const eventArg = listener.mock.calls[0][0] as CustomEvent;
    expect(eventArg.detail).toBeNull();
    
    FrontendEventBus.off('TEST_EVENT', listener);
  });
});
