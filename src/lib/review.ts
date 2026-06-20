import type { ArchivedDay, DateKey, DayRecord, WeeklyReview } from '@/types';
import { addDays, fromKey } from './date';
import { rangeCells } from './analytics';
import { computeStreak } from './streak';

/** Monday of the week containing `key`. */
export function startOfWeek(key: DateKey): DateKey {
  const offset = (fromKey(key).getDay() + 6) % 7; // 0 = Monday
  return addDays(key, -offset);
}

/** Week starts (Mondays) for fully-completed weeks that have any activity. */
export function listCompletedWeeks(
  history: Record<DateKey, DayRecord>,
  today: DateKey,
  maxWeeks = 26,
): DateKey[] {
  const seen = new Set<DateKey>();
  const result: DateKey[] = [];
  for (let i = 1; i <= maxWeeks * 7; i++) {
    const day = addDays(today, -i);
    const ws = startOfWeek(day);
    if (seen.has(ws)) continue;
    seen.add(ws);
    const we = addDays(ws, 6);
    if (we >= today) continue; // not finished yet
    const hasData = Array.from({ length: 7 }).some((_, k) => (history[addDays(ws, k)]?.total ?? 0) > 0);
    if (hasData) result.push(ws);
  }
  return result;
}

export function generateReview(
  weekStart: DateKey,
  history: Record<DateKey, DayRecord>,
  archive: Record<DateKey, ArchivedDay>,
): WeeklyReview | null {
  const weekEnd = addDays(weekStart, 6);
  const cells = rangeCells(history, weekEnd, 7); // weekStart … weekEnd
  const active = cells.filter((c) => c.total > 0);
  if (active.length === 0) return null;

  const completionRate = active.reduce((s, c) => s + c.rate, 0) / active.length;
  const goalsFinished = cells.reduce((s, c) => s + c.completed, 0);

  let bestDay: DateKey | null = null;
  let bestDayRate = -1;
  for (const c of active) {
    if (c.rate > bestDayRate) {
      bestDayRate = c.rate;
      bestDay = c.date;
    }
  }

  const endStreak = computeStreak(history, weekEnd);
  const startStreak = computeStreak(history, addDays(weekStart, -1));
  const streakDelta = endStreak.current - startStreak.current;

  const categoryBreakdown: Record<string, number> = {};
  for (let k = 0; k < 7; k++) {
    const day = archive[addDays(weekStart, k)];
    if (!day) continue;
    for (const g of day.goals) {
      if (g.done && g.category) {
        categoryBreakdown[g.category] = (categoryBreakdown[g.category] ?? 0) + 1;
      }
    }
  }

  return {
    weekStart,
    weekEnd,
    completionRate,
    goalsFinished,
    bestDay,
    bestDayRate: Math.max(0, bestDayRate),
    currentStreak: endStreak.current,
    bestStreak: endStreak.longest,
    streakDelta,
    categoryBreakdown,
    daily: cells.map((c) => ({ date: c.date, rate: c.rate, completed: c.completed, total: c.total })),
  };
}
