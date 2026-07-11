import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useClock } from './useClock';

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-06-19T12:00:00'));
});

afterEach(() => {
  vi.useRealTimers();
});

describe('useClock', () => {
  it('returns the current time on first render', () => {
    const { result } = renderHook(() => useClock());
    expect(result.current.toISOString()).toBe(new Date('2026-06-19T12:00:00').toISOString());
  });

  it('updates after the default 30s interval elapses', () => {
    const { result } = renderHook(() => useClock());
    act(() => {
      vi.advanceTimersByTime(30_000);
    });
    expect(result.current.toISOString()).toBe(new Date('2026-06-19T12:00:30').toISOString());
  });

  it('honours a custom interval', () => {
    const { result } = renderHook(() => useClock(5_000));
    act(() => {
      vi.advanceTimersByTime(5_000);
    });
    expect(result.current.toISOString()).toBe(new Date('2026-06-19T12:00:05').toISOString());
  });

  it('does not update before the interval elapses', () => {
    const { result } = renderHook(() => useClock());
    const initial = result.current;
    act(() => {
      vi.advanceTimersByTime(10_000);
    });
    expect(result.current).toBe(initial);
  });

  it('refreshes on window focus', () => {
    const { result } = renderHook(() => useClock());
    act(() => {
      vi.setSystemTime(new Date('2026-06-19T13:00:00'));
      window.dispatchEvent(new Event('focus'));
    });
    expect(result.current.toISOString()).toBe(new Date('2026-06-19T13:00:00').toISOString());
  });

  it('refreshes on document visibilitychange', () => {
    const { result } = renderHook(() => useClock());
    act(() => {
      vi.setSystemTime(new Date('2026-06-19T14:00:00'));
      document.dispatchEvent(new Event('visibilitychange'));
    });
    expect(result.current.toISOString()).toBe(new Date('2026-06-19T14:00:00').toISOString());
  });

  it('cleans up its listeners and timer on unmount', () => {
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
    const clearIntervalSpy = vi.spyOn(window, 'clearInterval');
    const { unmount } = renderHook(() => useClock());

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith('focus', expect.any(Function));
    expect(clearIntervalSpy).toHaveBeenCalled();
  });
});
