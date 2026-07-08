import { describe, it, expect } from 'vitest';
import type { DateKey, DayRecord } from '@/types';
import { computeStreak, streakPeriods } from './streak';

function historyFrom(entries: Record<DateKey, [number, number]>): Record<DateKey, DayRecord> {
  const out: Record<DateKey, DayRecord> = {};
  for (const [date, [total, completed]] of Object.entries(entries)) {
    out[date] = { date, total, completed };
  }
  return out;
}

describe('computeStreak', () => {
  it('is 0 with no history', () => {
    const info = computeStreak({}, '2026-06-19');
    expect(info).toEqual({ current: 0, longest: 0, todayCleared: false });
  });

  it('counts today when today is fully cleared', () => {
    const history = historyFrom({ '2026-06-19': [3, 3] });
    const info = computeStreak(history, '2026-06-19');
    expect(info.todayCleared).toBe(true);
    expect(info.current).toBe(1);
  });

  it('does not count today toward "cleared" when goals remain open', () => {
    const history = historyFrom({ '2026-06-19': [3, 2] });
    const info = computeStreak(history, '2026-06-19');
    expect(info.todayCleared).toBe(false);
  });

  it('walks backward from yesterday when today is still open, without breaking the streak', () => {
    const history = historyFrom({
      '2026-06-17': [2, 2],
      '2026-06-18': [2, 2],
      '2026-06-19': [2, 1], // today, open
    });
    const info = computeStreak(history, '2026-06-19');
    expect(info.todayCleared).toBe(false);
    expect(info.current).toBe(2);
  });

  it('breaks the streak on a day with zero goals (not just incomplete ones)', () => {
    const history = historyFrom({
      '2026-06-16': [2, 2],
      '2026-06-17': [2, 2],
      // 06-18 has no record at all — a gap
      '2026-06-19': [2, 2],
    });
    const info = computeStreak(history, '2026-06-19');
    expect(info.current).toBe(1);
  });

  it('breaks the streak on a day recorded with total 0', () => {
    const history = historyFrom({
      '2026-06-17': [2, 2],
      '2026-06-18': [0, 0],
      '2026-06-19': [2, 2],
    });
    const info = computeStreak(history, '2026-06-19');
    expect(info.current).toBe(1);
  });

  it('computes the longest streak across all history, even if the current streak is shorter', () => {
    const history = historyFrom({
      '2026-06-01': [1, 1],
      '2026-06-02': [1, 1],
      '2026-06-03': [1, 1],
      '2026-06-04': [1, 1],
      // gap
      '2026-06-10': [1, 1],
    });
    const info = computeStreak(history, '2026-06-10');
    expect(info.current).toBe(1);
    expect(info.longest).toBe(4);
  });

  it('longest reflects current when current itself is the longest run', () => {
    const history = historyFrom({
      '2026-06-01': [1, 1],
      '2026-06-17': [1, 1],
      '2026-06-18': [1, 1],
      '2026-06-19': [1, 1],
    });
    const info = computeStreak(history, '2026-06-19');
    expect(info.current).toBe(3);
    expect(info.longest).toBe(3);
  });
});

describe('streakPeriods', () => {
  it('returns no periods for empty history', () => {
    expect(streakPeriods({})).toEqual([]);
  });

  it('finds a single contiguous run', () => {
    const history = historyFrom({
      '2026-06-01': [1, 1],
      '2026-06-02': [1, 1],
      '2026-06-03': [1, 1],
    });
    expect(streakPeriods(history)).toEqual([{ start: '2026-06-01', end: '2026-06-03', length: 3 }]);
  });

  it('splits runs across a gap and orders newest first', () => {
    const history = historyFrom({
      '2026-06-01': [1, 1],
      '2026-06-02': [1, 1],
      '2026-06-10': [1, 1],
    });
    expect(streakPeriods(history)).toEqual([
      { start: '2026-06-10', end: '2026-06-10', length: 1 },
      { start: '2026-06-01', end: '2026-06-02', length: 2 },
    ]);
  });

  it('ignores days that are not fully cleared', () => {
    const history = historyFrom({
      '2026-06-01': [1, 1],
      '2026-06-02': [3, 2], // incomplete
      '2026-06-03': [1, 1],
    });
    expect(streakPeriods(history)).toEqual([
      { start: '2026-06-03', end: '2026-06-03', length: 1 },
      { start: '2026-06-01', end: '2026-06-01', length: 1 },
    ]);
  });

  it('handles a run spanning a month boundary', () => {
    const history = historyFrom({
      '2026-06-29': [1, 1],
      '2026-06-30': [1, 1],
      '2026-07-01': [1, 1],
    });
    expect(streakPeriods(history)).toEqual([{ start: '2026-06-29', end: '2026-07-01', length: 3 }]);
  });
});
