import type { DateKey, DayRecord, Goal } from '@/types';
import { addDays, toKey, weekdayName } from './date';

export interface DayCell {
  date: DateKey;
  total: number;
  completed: number;
  /** 0–1 completion ratio (0 when no goals). */
  rate: number;
}

/** Merge live goals for `today` into the persisted history. */
export function buildHistory(
  history: Record<DateKey, DayRecord>,
  goals: Goal[],
  today: DateKey,
): Record<DateKey, DayRecord> {
  const merged: Record<DateKey, DayRecord> = { ...history };
  const todays = goals.filter((g) => g.date === today);
  if (todays.length) {
    merged[today] = {
      date: today,
      total: todays.length,
      completed: todays.filter((g) => g.done).length,
    };
  }
  return merged;
}

/** A contiguous range of day cells ending at `end`, going back `days`. */
export function rangeCells(
  history: Record<DateKey, DayRecord>,
  end: DateKey,
  days: number,
): DayCell[] {
  const cells: DayCell[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = addDays(end, -i);
    const rec = history[date];
    const total = rec?.total ?? 0;
    const completed = rec?.completed ?? 0;
    cells.push({ date, total, completed, rate: total ? completed / total : 0 });
  }
  return cells;
}

/** Average completion rate over days that had at least one goal. */
export function averageRate(cells: DayCell[]): number {
  const active = cells.filter((c) => c.total > 0);
  if (!active.length) return 0;
  return active.reduce((s, c) => s + c.rate, 0) / active.length;
}

/** Total goals completed across the range. */
export function totalCompleted(cells: DayCell[]): number {
  return cells.reduce((s, c) => s + c.completed, 0);
}

/** The weekday with the highest average completion rate. */
export function mostProductiveWeekday(cells: DayCell[]): string | null {
  const buckets: Record<string, { sum: number; n: number }> = {};
  for (const c of cells) {
    if (c.total === 0) continue;
    const wd = weekdayName(c.date);
    buckets[wd] ??= { sum: 0, n: 0 };
    buckets[wd].sum += c.rate;
    buckets[wd].n += 1;
  }
  let best: string | null = null;
  let bestAvg = -1;
  for (const [wd, b] of Object.entries(buckets)) {
    const avg = b.sum / b.n;
    if (avg > bestAvg) {
      bestAvg = avg;
      best = wd;
    }
  }
  return best;
}

export interface CategoryStat {
  id: string;
  total: number;
  completed: number;
  rate: number;
}

/** Per-category totals over the last `days`, drawn from archived snapshots. */
export function categoryStats(
  archive: Record<DateKey, import('@/types').ArchivedDay>,
  end: DateKey,
  days: number,
): CategoryStat[] {
  const tally = new Map<string, { total: number; completed: number }>();
  for (let i = 0; i < days; i++) {
    const day = archive[addDays(end, -i)];
    if (!day) continue;
    for (const g of day.goals) {
      if (!g.category) continue;
      const t = tally.get(g.category) ?? { total: 0, completed: 0 };
      t.total += 1;
      if (g.done) t.completed += 1;
      tally.set(g.category, t);
    }
  }
  return [...tally.entries()]
    .map(([id, t]) => ({ id, total: t.total, completed: t.completed, rate: t.total ? t.completed / t.total : 0 }))
    .sort((a, b) => b.completed - a.completed);
}

/** Build a GitHub-style heatmap matrix (weeks × 7), aligned to weeks. */
export function heatmapWeeks(
  history: Record<DateKey, DayRecord>,
  end: DateKey,
  weeks: number,
): DayCell[][] {
  // Anchor to the Saturday on/after `end` so the final column is complete.
  const endDate = new Date(end);
  const endWeekday = endDate.getDay();
  const anchor = toKey(new Date(endDate.getTime() + (6 - endWeekday) * 86400000));
  const cells = rangeCells(history, anchor, weeks * 7);
  const cols: DayCell[][] = [];
  for (let w = 0; w < weeks; w++) {
    cols.push(cells.slice(w * 7, w * 7 + 7));
  }
  return cols;
}
