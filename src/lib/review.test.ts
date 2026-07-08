import { describe, it, expect } from 'vitest';
import type { ArchivedDay, DateKey, DayRecord } from '@/types';
import { startOfWeek, listCompletedWeeks, generateReview } from './review';

function historyFrom(entries: Record<DateKey, [number, number]>): Record<DateKey, DayRecord> {
  const out: Record<DateKey, DayRecord> = {};
  for (const [date, [total, completed]] of Object.entries(entries)) {
    out[date] = { date, total, completed };
  }
  return out;
}

describe('startOfWeek', () => {
  it('returns the same date when given a Monday', () => {
    // 2026-06-15 is a Monday.
    expect(startOfWeek('2026-06-15')).toBe('2026-06-15');
  });

  it('returns the preceding Monday for a mid-week date', () => {
    // 2026-06-19 is a Friday.
    expect(startOfWeek('2026-06-19')).toBe('2026-06-15');
  });

  it('returns the preceding Monday for a Sunday (end of week)', () => {
    // 2026-06-21 is a Sunday, belongs to the week starting 06-15.
    expect(startOfWeek('2026-06-21')).toBe('2026-06-15');
  });

  it('handles a week that spans a month boundary', () => {
    // 2026-07-01 is a Wednesday; the Monday is 2026-06-29.
    expect(startOfWeek('2026-07-01')).toBe('2026-06-29');
  });
});

describe('listCompletedWeeks', () => {
  it('excludes the current in-progress week even if it has data', () => {
    // Today is Friday 2026-06-19; its week starts Monday 2026-06-15 and is not finished.
    const history = historyFrom({ '2026-06-15': [2, 2], '2026-06-19': [1, 1] });
    const weeks = listCompletedWeeks(history, '2026-06-19');
    expect(weeks).not.toContain('2026-06-15');
  });

  it('includes a fully past week that has at least one active day', () => {
    const history = historyFrom({ '2026-06-08': [2, 1] }); // Monday of the prior week
    const weeks = listCompletedWeeks(history, '2026-06-19');
    expect(weeks).toContain('2026-06-08');
  });

  it('excludes past weeks with zero activity', () => {
    const weeks = listCompletedWeeks({}, '2026-06-19');
    expect(weeks).toEqual([]);
  });

  it('does not return duplicate week-start keys', () => {
    const history = historyFrom({
      '2026-06-08': [1, 1],
      '2026-06-09': [1, 1],
      '2026-06-10': [1, 1],
    });
    const weeks = listCompletedWeeks(history, '2026-06-19');
    expect(new Set(weeks).size).toBe(weeks.length);
  });

  it('respects the maxWeeks lookback window', () => {
    // 2026-06-01 is two weeks before today (2026-06-19); a lookback of just
    // 1 week (7 days) should never reach far enough back to see it.
    const twoWeeksBack = '2026-06-01';
    const history = historyFrom({ [twoWeeksBack]: [1, 1] });
    expect(listCompletedWeeks(history, '2026-06-19', 1)).not.toContain(startOfWeek(twoWeeksBack));
    expect(listCompletedWeeks(history, '2026-06-19', 26)).toContain(startOfWeek(twoWeeksBack));
  });
});

describe('generateReview', () => {
  it('returns null when no day in the week has any goals', () => {
    const review = generateReview('2026-06-08', {}, {});
    expect(review).toBeNull();
  });

  it('computes completion rate as the average over active days only', () => {
    const history = historyFrom({
      '2026-06-08': [2, 2], // rate 1.0
      '2026-06-09': [2, 0], // rate 0.0
      // remaining days inactive (total 0), excluded from the average
    });
    const review = generateReview('2026-06-08', history, {});
    expect(review).not.toBeNull();
    expect(review!.completionRate).toBeCloseTo(0.5, 5);
    expect(review!.goalsFinished).toBe(2);
  });

  it('picks the highest-rate day as bestDay', () => {
    const history = historyFrom({
      '2026-06-08': [4, 1], // 0.25
      '2026-06-09': [4, 4], // 1.0
      '2026-06-10': [4, 2], // 0.5
    });
    const review = generateReview('2026-06-08', history, {});
    expect(review!.bestDay).toBe('2026-06-09');
    expect(review!.bestDayRate).toBe(1);
  });

  it('tallies completed goals per category from the archive', () => {
    const history = historyFrom({ '2026-06-08': [2, 2] });
    const archive: Record<DateKey, ArchivedDay> = {
      '2026-06-08': {
        date: '2026-06-08',
        total: 2,
        completed: 2,
        categories: ['work', 'health'],
        goals: [
          { id: 'a', title: 'Ship it', done: true, category: 'work', order: 0 },
          { id: 'b', title: 'Run', done: true, category: 'health', order: 1 },
        ],
      },
    };
    const review = generateReview('2026-06-08', history, archive);
    expect(review!.categoryBreakdown).toEqual({ work: 1, health: 1 });
  });

  it('excludes incomplete goals from the category breakdown', () => {
    const history = historyFrom({ '2026-06-08': [2, 1] });
    const archive: Record<DateKey, ArchivedDay> = {
      '2026-06-08': {
        date: '2026-06-08',
        total: 2,
        completed: 1,
        categories: ['work'],
        goals: [
          { id: 'a', title: 'Ship it', done: true, category: 'work', order: 0 },
          { id: 'b', title: 'Unfinished', done: false, category: 'work', order: 1 },
        ],
      },
    };
    const review = generateReview('2026-06-08', history, archive);
    expect(review!.categoryBreakdown).toEqual({ work: 1 });
  });

  it('produces exactly 7 daily cells spanning weekStart..weekEnd', () => {
    const history = historyFrom({ '2026-06-08': [1, 1] });
    const review = generateReview('2026-06-08', history, {});
    expect(review!.weekStart).toBe('2026-06-08');
    expect(review!.weekEnd).toBe('2026-06-14');
    expect(review!.daily).toHaveLength(7);
    expect(review!.daily[0].date).toBe('2026-06-08');
    expect(review!.daily[6].date).toBe('2026-06-14');
  });
});
