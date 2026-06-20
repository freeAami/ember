import { useMemo } from 'react';
import { useStore } from '@/store/useStore';
import { logicalToday, tomorrowKey } from '@/lib/date';
import { buildHistory } from '@/lib/analytics';
import { computeStreak, type StreakInfo } from '@/lib/streak';
import { findCategory } from '@/lib/categories';
import type { ArchivedDay, Category, DateKey, Goal, WeeklyReview } from '@/types';

export function useTodayKey(): DateKey {
  return useStore((s) => logicalToday(s.settings.dayStartHour));
}

export function useTomorrowKey(): DateKey {
  return useStore((s) => tomorrowKey(s.settings.dayStartHour));
}

/** Goals for a given day, sorted by manual order. */
export function useGoalsForDate(date: DateKey): Goal[] {
  const goals = useStore((s) => s.goals);
  return useMemo(
    () =>
      goals
        .filter((g) => g.date === date)
        .sort((a, b) => a.order - b.order),
    [goals, date],
  );
}

export interface DayProgress {
  total: number;
  done: number;
  pct: number; // 0–1
}

export function useDayProgress(date: DateKey): DayProgress {
  const goals = useGoalsForDate(date);
  return useMemo(() => {
    const total = goals.length;
    const done = goals.filter((g) => g.done).length;
    return { total, done, pct: total ? done / total : 0 };
  }, [goals]);
}

/** History merged with the live state of today's goals. */
export function useMergedHistory() {
  const history = useStore((s) => s.history);
  const goals = useStore((s) => s.goals);
  const today = useTodayKey();
  return useMemo(() => buildHistory(history, goals, today), [history, goals, today]);
}

export function useStreak(): StreakInfo {
  const merged = useMergedHistory();
  const today = useTodayKey();
  return useMemo(() => computeStreak(merged, today), [merged, today]);
}

export function useCategories(): Category[] {
  return useStore((s) => s.categories);
}

export function useCategory(id?: string): Category | undefined {
  const categories = useStore((s) => s.categories);
  return useMemo(() => findCategory(categories, id), [categories, id]);
}

/** Archived past days, newest first. */
export function useArchiveDays(): ArchivedDay[] {
  const archive = useStore((s) => s.archive);
  return useMemo(
    () => Object.values(archive).sort((a, b) => (a.date < b.date ? 1 : -1)),
    [archive],
  );
}

/** Weekly reviews, newest first. */
export function useReviews(): WeeklyReview[] {
  const reviews = useStore((s) => s.reviews);
  return useMemo(
    () => Object.values(reviews).sort((a, b) => (a.weekStart < b.weekStart ? 1 : -1)),
    [reviews],
  );
}

export function useLatestReview(): WeeklyReview | null {
  const reviews = useReviews();
  return reviews[0] ?? null;
}
