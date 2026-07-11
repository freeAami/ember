import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useStore } from '@/store/useStore';
import { DEFAULT_CATEGORIES } from '@/lib/categories';
import type { ArchivedDay, WeeklyReview } from '@/types';
import {
  useTodayKey,
  useTomorrowKey,
  useGoalsForDate,
  useDayProgress,
  useMergedHistory,
  useStreak,
  useCategories,
  useCategory,
  useArchiveDays,
  useReviews,
  useLatestReview,
} from './useSelectors';

const initialState = useStore.getState();

beforeEach(() => {
  useStore.setState(initialState, true);
  window.localStorage.clear();
});

afterEach(() => {
  vi.useRealTimers();
});

function setNow(iso: string) {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(iso));
}

describe('useTodayKey / useTomorrowKey', () => {
  it('derive from the store dayStartHour setting', () => {
    setNow('2026-06-19T12:00:00');
    const { result: today } = renderHook(() => useTodayKey());
    const { result: tomorrow } = renderHook(() => useTomorrowKey());
    expect(today.current).toBe('2026-06-19');
    expect(tomorrow.current).toBe('2026-06-20');
  });

  it('honours dayStartHour before the boundary', () => {
    useStore.getState().setSettings({ dayStartHour: 4 });
    setNow('2026-06-19T02:00:00');
    const { result } = renderHook(() => useTodayKey());
    expect(result.current).toBe('2026-06-18');
  });
});

describe('useGoalsForDate', () => {
  it('returns only goals for the given date, sorted by manual order', () => {
    const a = useStore.getState().addGoal('A', '2026-06-19');
    const b = useStore.getState().addGoal('B', '2026-06-19');
    useStore.getState().addGoal('Other day', '2026-06-20');
    useStore.getState().reorderForDate('2026-06-19', [b, a]);

    const { result } = renderHook(() => useGoalsForDate('2026-06-19'));
    expect(result.current.map((g) => g.id)).toEqual([b, a]);
  });

  it('returns an empty array when nothing is scheduled for the date', () => {
    const { result } = renderHook(() => useGoalsForDate('2026-06-19'));
    expect(result.current).toEqual([]);
  });
});

describe('useDayProgress', () => {
  it('is 0/0/0 with no goals', () => {
    const { result } = renderHook(() => useDayProgress('2026-06-19'));
    expect(result.current).toEqual({ total: 0, done: 0, pct: 0 });
  });

  it('computes completion fraction', () => {
    const a = useStore.getState().addGoal('A', '2026-06-19');
    useStore.getState().addGoal('B', '2026-06-19');
    useStore.getState().toggleGoal(a);

    const { result } = renderHook(() => useDayProgress('2026-06-19'));
    expect(result.current).toEqual({ total: 2, done: 1, pct: 0.5 });
  });
});

describe('useMergedHistory', () => {
  it("merges today's live goals into persisted history", () => {
    setNow('2026-06-19T12:00:00');
    useStore.setState({ history: { '2026-06-01': { date: '2026-06-01', total: 2, completed: 2 } } });
    const id = useStore.getState().addGoal('Task', '2026-06-19');
    useStore.getState().toggleGoal(id);

    const { result } = renderHook(() => useMergedHistory());
    expect(result.current['2026-06-01']).toEqual({ date: '2026-06-01', total: 2, completed: 2 });
    expect(result.current['2026-06-19']).toEqual({ date: '2026-06-19', total: 1, completed: 1 });
  });
});

describe('useStreak', () => {
  it('reflects a fully cleared today as a 1-day streak', () => {
    setNow('2026-06-19T12:00:00');
    const id = useStore.getState().addGoal('Task', '2026-06-19');
    useStore.getState().toggleGoal(id);

    const { result } = renderHook(() => useStreak());
    expect(result.current.current).toBe(1);
    expect(result.current.todayCleared).toBe(true);
  });
});

describe('useCategories / useCategory', () => {
  it('lists the default categories', () => {
    const { result } = renderHook(() => useCategories());
    expect(result.current).toEqual(DEFAULT_CATEGORIES);
  });

  it('finds a category by id and returns undefined when missing/omitted', () => {
    const { result: found } = renderHook(() => useCategory('work'));
    expect(found.current?.name).toBe('Work');

    const { result: missing } = renderHook(() => useCategory('nonexistent'));
    expect(missing.current).toBeUndefined();

    const { result: omitted } = renderHook(() => useCategory(undefined));
    expect(omitted.current).toBeUndefined();
  });
});

describe('useArchiveDays', () => {
  function archiveDay(date: string): ArchivedDay {
    return { date, goals: [], total: 0, completed: 0, categories: [] };
  }

  it('returns archived days newest first', () => {
    useStore.setState({
      archive: {
        '2026-06-01': archiveDay('2026-06-01'),
        '2026-06-10': archiveDay('2026-06-10'),
        '2026-06-05': archiveDay('2026-06-05'),
      },
    });

    const { result } = renderHook(() => useArchiveDays());
    expect(result.current.map((d) => d.date)).toEqual(['2026-06-10', '2026-06-05', '2026-06-01']);
  });

  it('is empty when nothing has been archived', () => {
    const { result } = renderHook(() => useArchiveDays());
    expect(result.current).toEqual([]);
  });
});

describe('useReviews / useLatestReview', () => {
  function review(weekStart: string): WeeklyReview {
    return {
      weekStart,
      weekEnd: weekStart,
      completionRate: 1,
      goalsFinished: 1,
      bestDay: null,
      bestDayRate: 0,
      currentStreak: 0,
      bestStreak: 0,
      streakDelta: 0,
      categoryBreakdown: {},
      daily: [],
    };
  }

  it('returns reviews newest first, with useLatestReview as the head', () => {
    useStore.setState({
      reviews: {
        '2026-06-01': review('2026-06-01'),
        '2026-06-15': review('2026-06-15'),
      },
    });

    const { result: reviews } = renderHook(() => useReviews());
    expect(reviews.current.map((r) => r.weekStart)).toEqual(['2026-06-15', '2026-06-01']);

    const { result: latest } = renderHook(() => useLatestReview());
    expect(latest.current?.weekStart).toBe('2026-06-15');
  });

  it('useLatestReview is null when there are no reviews', () => {
    const { result } = renderHook(() => useLatestReview());
    expect(result.current).toBeNull();
  });
});

describe('React integration', () => {
  it('useGoalsForDate re-renders when a goal is added for that date', () => {
    const { result } = renderHook(() => useGoalsForDate('2026-06-19'));
    expect(result.current).toHaveLength(0);
    act(() => {
      useStore.getState().addGoal('New', '2026-06-19');
    });
    expect(result.current).toHaveLength(1);
  });
});
