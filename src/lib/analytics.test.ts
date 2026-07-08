import { describe, it, expect } from 'vitest';
import type { ArchivedDay, DateKey, DayRecord, Goal } from '@/types';
import {
  buildHistory,
  rangeCells,
  averageRate,
  totalCompleted,
  mostProductiveWeekday,
  categoryStats,
  heatmapWeeks,
} from './analytics';

function goal(date: DateKey, done: boolean, id = date + Math.random()): Goal {
  return { id, title: 't', date, done, order: 0, createdAt: 0 };
}

describe('buildHistory', () => {
  it('overlays live goals for today onto persisted history', () => {
    const history: Record<DateKey, DayRecord> = { '2026-06-18': { date: '2026-06-18', total: 1, completed: 1 } };
    const goals: Goal[] = [goal('2026-06-19', true, 'a'), goal('2026-06-19', false, 'b')];
    const merged = buildHistory(history, goals, '2026-06-19');
    expect(merged['2026-06-19']).toEqual({ date: '2026-06-19', total: 2, completed: 1 });
    expect(merged['2026-06-18']).toEqual({ date: '2026-06-18', total: 1, completed: 1 });
  });

  it('leaves history untouched when there are no live goals for today', () => {
    const history: Record<DateKey, DayRecord> = { '2026-06-18': { date: '2026-06-18', total: 1, completed: 1 } };
    const merged = buildHistory(history, [], '2026-06-19');
    expect(merged).toEqual(history);
    expect(merged['2026-06-19']).toBeUndefined();
  });

  it('does not mutate the input history object', () => {
    const history: Record<DateKey, DayRecord> = {};
    const goals: Goal[] = [goal('2026-06-19', true, 'a')];
    buildHistory(history, goals, '2026-06-19');
    expect(history).toEqual({});
  });
});

describe('rangeCells', () => {
  it('produces `days` cells ending at (and including) `end`', () => {
    const cells = rangeCells({}, '2026-06-19', 5);
    expect(cells).toHaveLength(5);
    expect(cells[0].date).toBe('2026-06-15');
    expect(cells[4].date).toBe('2026-06-19');
  });

  it('fills gaps with zeroed cells for missing history', () => {
    const cells = rangeCells({}, '2026-06-19', 1);
    expect(cells[0]).toEqual({ date: '2026-06-19', total: 0, completed: 0, rate: 0 });
  });

  it('computes rate as completed/total', () => {
    const history: Record<DateKey, DayRecord> = { '2026-06-19': { date: '2026-06-19', total: 4, completed: 3 } };
    const cells = rangeCells(history, '2026-06-19', 1);
    expect(cells[0].rate).toBe(0.75);
  });

  it('spans a month boundary without gaps or duplicates', () => {
    const cells = rangeCells({}, '2026-07-02', 5);
    expect(cells.map((c) => c.date)).toEqual([
      '2026-06-28',
      '2026-06-29',
      '2026-06-30',
      '2026-07-01',
      '2026-07-02',
    ]);
  });
});

describe('averageRate / totalCompleted', () => {
  it('averages only over days with at least one goal', () => {
    const cells = rangeCells(
      {
        '2026-06-18': { date: '2026-06-18', total: 2, completed: 1 }, // rate 0.5
        '2026-06-19': { date: '2026-06-19', total: 2, completed: 2 }, // rate 1.0
      },
      '2026-06-19',
      3, // includes an empty 06-17 that must not drag the average down
    );
    expect(averageRate(cells)).toBeCloseTo(0.75, 5);
  });

  it('returns 0 for an all-empty range', () => {
    expect(averageRate(rangeCells({}, '2026-06-19', 3))).toBe(0);
  });

  it('sums completed goals across the range', () => {
    const cells = rangeCells(
      {
        '2026-06-18': { date: '2026-06-18', total: 2, completed: 1 },
        '2026-06-19': { date: '2026-06-19', total: 2, completed: 2 },
      },
      '2026-06-19',
      2,
    );
    expect(totalCompleted(cells)).toBe(3);
  });
});

describe('mostProductiveWeekday', () => {
  it('returns null when no cell has any goals', () => {
    expect(mostProductiveWeekday(rangeCells({}, '2026-06-19', 7))).toBeNull();
  });

  it('picks the weekday with the highest average rate', () => {
    // 2026-06-15 (Mon) rate 0.0, 2026-06-16 (Tue) rate 1.0
    const history: Record<DateKey, DayRecord> = {
      '2026-06-15': { date: '2026-06-15', total: 2, completed: 0 },
      '2026-06-16': { date: '2026-06-16', total: 2, completed: 2 },
    };
    const cells = rangeCells(history, '2026-06-16', 2);
    expect(mostProductiveWeekday(cells)).toBe('Tuesday');
  });
});

describe('categoryStats', () => {
  const archive: Record<DateKey, ArchivedDay> = {
    '2026-06-19': {
      date: '2026-06-19',
      total: 2,
      completed: 1,
      categories: ['work'],
      goals: [
        { id: 'a', title: 'x', done: true, category: 'work', order: 0 },
        { id: 'b', title: 'y', done: false, category: 'work', order: 1 },
      ],
    },
    '2026-06-18': {
      date: '2026-06-18',
      total: 1,
      completed: 1,
      categories: ['health'],
      goals: [{ id: 'c', title: 'z', done: true, category: 'health', order: 0 }],
    },
  };

  it('tallies totals and completions per category over the window', () => {
    const stats = categoryStats(archive, '2026-06-19', 2);
    const work = stats.find((s) => s.id === 'work');
    expect(work).toEqual({ id: 'work', total: 2, completed: 1, rate: 0.5 });
  });

  it('excludes goals with no category', () => {
    const archiveWithUncategorized: Record<DateKey, ArchivedDay> = {
      '2026-06-19': {
        date: '2026-06-19',
        total: 1,
        completed: 1,
        categories: [],
        goals: [{ id: 'a', title: 'x', done: true, order: 0 }],
      },
    };
    expect(categoryStats(archiveWithUncategorized, '2026-06-19', 1)).toEqual([]);
  });

  it('sorts by completed count descending', () => {
    const stats = categoryStats(archive, '2026-06-19', 2);
    expect(stats.map((s) => s.id)).toEqual(['work', 'health']);
  });

  it('only looks back `days` days from `end`', () => {
    const stats = categoryStats(archive, '2026-06-19', 1); // excludes 06-18
    expect(stats.find((s) => s.id === 'health')).toBeUndefined();
  });
});

describe('heatmapWeeks', () => {
  it('returns `weeks` columns of 7 cells each', () => {
    const cols = heatmapWeeks({}, '2026-06-19', 4);
    expect(cols).toHaveLength(4);
    for (const col of cols) expect(col).toHaveLength(7);
  });

  it('anchors the final column to end on the Saturday on/after `end`', () => {
    // 2026-06-19 is a Friday; the anchor Saturday is 2026-06-20.
    const cols = heatmapWeeks({}, '2026-06-19', 1);
    expect(cols[0][6].date).toBe('2026-06-20');
  });

  it('produces a contiguous, non-overlapping day sequence across all columns', () => {
    const cols = heatmapWeeks({}, '2026-06-19', 3);
    const flat = cols.flat().map((c) => c.date);
    for (let i = 1; i < flat.length; i++) {
      expect(flat[i]).not.toBe(flat[i - 1]);
    }
    expect(new Set(flat).size).toBe(flat.length);
  });
});
