import type { DateKey, DayRecord } from '@/types';
import { addDays } from './date';

/** A day "counts" toward a streak if every goal that day was completed. */
function dayCleared(rec: DayRecord | undefined): boolean {
  return !!rec && rec.total > 0 && rec.completed >= rec.total;
}

export interface StreakInfo {
  current: number;
  longest: number;
  /** True if today is already cleared (the flame is "lit"). */
  todayCleared: boolean;
}

export interface StreakPeriod {
  start: DateKey;
  end: DateKey;
  length: number;
}

/** All historical streak runs (fully-cleared consecutive days), newest first. */
export function streakPeriods(history: Record<DateKey, DayRecord>): StreakPeriod[] {
  const keys = Object.keys(history).filter((k) => dayCleared(history[k])).sort();
  const periods: StreakPeriod[] = [];
  let start: DateKey | null = null;
  let prev: DateKey | null = null;
  for (const k of keys) {
    if (prev && addDays(prev, 1) === k) {
      // continue run
    } else {
      if (start && prev) periods.push({ start, end: prev, length: runLength(start, prev) });
      start = k;
    }
    prev = k;
  }
  if (start && prev) periods.push({ start, end: prev, length: runLength(start, prev) });
  return periods.reverse();
}

function runLength(start: DateKey, end: DateKey): number {
  let n = 1;
  let cur = start;
  while (cur !== end) {
    cur = addDays(cur, 1);
    n++;
  }
  return n;
}

export function computeStreak(
  history: Record<DateKey, DayRecord>,
  today: DateKey,
): StreakInfo {
  const todayCleared = dayCleared(history[today]);

  // Current streak: walk backwards from today (or yesterday if today's open).
  let current = 0;
  let cursor = todayCleared ? today : addDays(today, -1);
  while (dayCleared(history[cursor])) {
    current++;
    cursor = addDays(cursor, -1);
  }

  // Longest streak across all recorded history.
  const keys = Object.keys(history).filter((k) => dayCleared(history[k])).sort();
  let longest = 0;
  let run = 0;
  let prev: DateKey | null = null;
  for (const k of keys) {
    if (prev && addDays(prev, 1) === k) run++;
    else run = 1;
    longest = Math.max(longest, run);
    prev = k;
  }
  longest = Math.max(longest, current);

  return { current, longest, todayCleared };
}
