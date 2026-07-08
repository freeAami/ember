import { describe, it, expect } from 'vitest';
import {
  toKey,
  fromKey,
  logicalToday,
  addDays,
  tomorrowKey,
  prettyDate,
  shortWeekday,
  weekdayName,
  dayProgress,
  monthKey,
  monthLabel,
  dayOfMonth,
  shortDate,
  greetingFor,
} from './date';

describe('toKey', () => {
  it('formats a local date as YYYY-MM-DD', () => {
    expect(toKey(new Date(2026, 5, 19))).toBe('2026-06-19');
  });

  it('zero-pads single-digit months and days', () => {
    expect(toKey(new Date(2026, 0, 5))).toBe('2026-01-05');
  });

  it('round-trips through fromKey', () => {
    const key = '2026-12-31';
    expect(toKey(fromKey(key))).toBe(key);
  });
});

describe('fromKey', () => {
  it('parses as a local date, not UTC', () => {
    const d = fromKey('2026-06-19');
    expect(d.getFullYear()).toBe(2026);
    expect(d.getMonth()).toBe(5);
    expect(d.getDate()).toBe(19);
  });
});

describe('logicalToday', () => {
  it('returns the calendar date when the clock is at/after dayStartHour', () => {
    const now = new Date(2026, 5, 19, 4, 0, 0);
    expect(logicalToday(4, now)).toBe('2026-06-19');
  });

  it('returns the calendar date well after dayStartHour', () => {
    const now = new Date(2026, 5, 19, 23, 59, 0);
    expect(logicalToday(4, now)).toBe('2026-06-19');
  });

  it('rolls back to the previous day when before dayStartHour', () => {
    const now = new Date(2026, 5, 19, 3, 59, 0);
    expect(logicalToday(4, now)).toBe('2026-06-18');
  });

  it('rolls back at exactly one minute before dayStartHour', () => {
    const now = new Date(2026, 5, 19, 3, 0, 0);
    expect(logicalToday(4, now)).toBe('2026-06-18');
  });

  it('handles a dayStartHour of 0 (midnight) as always "today"', () => {
    const now = new Date(2026, 5, 19, 0, 0, 0);
    expect(logicalToday(0, now)).toBe('2026-06-19');
  });

  it('rolls across a month boundary', () => {
    const now = new Date(2026, 6, 1, 2, 0, 0); // July 1st, 2am
    expect(logicalToday(4, now)).toBe('2026-06-30');
  });

  it('rolls across a year boundary', () => {
    const now = new Date(2027, 0, 1, 1, 0, 0); // Jan 1st, 1am
    expect(logicalToday(4, now)).toBe('2026-12-31');
  });

  it('rolls correctly across a leap-day boundary', () => {
    const now = new Date(2028, 1, 29, 1, 0, 0); // Feb 29 2028 (leap year), 1am
    expect(logicalToday(4, now)).toBe('2028-02-28');
  });

  it('defaults `now` to the current time when omitted', () => {
    const key = logicalToday(4);
    expect(key).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe('addDays', () => {
  it('adds positive days', () => {
    expect(addDays('2026-06-19', 3)).toBe('2026-06-22');
  });

  it('subtracts with negative days', () => {
    expect(addDays('2026-06-19', -3)).toBe('2026-06-16');
  });

  it('rolls forward across a month boundary', () => {
    expect(addDays('2026-06-30', 1)).toBe('2026-07-01');
  });

  it('rolls backward across a month boundary', () => {
    expect(addDays('2026-07-01', -1)).toBe('2026-06-30');
  });

  it('rolls across a year boundary', () => {
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
  });

  it('handles Feb 29 on a leap year correctly', () => {
    expect(addDays('2028-02-28', 1)).toBe('2028-02-29');
    expect(addDays('2028-02-29', 1)).toBe('2028-03-01');
  });

  it('skips Feb 29 on a non-leap year', () => {
    expect(addDays('2026-02-28', 1)).toBe('2026-03-01');
  });

  it('is a no-op for n=0', () => {
    expect(addDays('2026-06-19', 0)).toBe('2026-06-19');
  });
});

describe('tomorrowKey', () => {
  it('is one day after the logical today', () => {
    const now = new Date(2026, 5, 19, 12, 0, 0);
    expect(tomorrowKey(4, now)).toBe('2026-06-20');
  });

  it('accounts for the day-start-hour shift before computing tomorrow', () => {
    const now = new Date(2026, 5, 19, 3, 0, 0); // logical today is 06-18
    expect(tomorrowKey(4, now)).toBe('2026-06-19');
  });
});

describe('prettyDate / shortWeekday / weekdayName / shortDate', () => {
  it('formats a known Friday consistently across helpers', () => {
    // 2026-06-19 is a Friday.
    expect(weekdayName('2026-06-19')).toBe('Friday');
    expect(shortWeekday('2026-06-19')).toBe('Fri');
    expect(prettyDate('2026-06-19')).toBe('Friday, June 19');
    expect(shortDate('2026-06-19')).toBe('Jun 19');
  });
});

describe('dayProgress', () => {
  it('is 0 right at the day start hour', () => {
    const now = new Date(2026, 5, 19, 4, 0, 0);
    expect(dayProgress(4, now)).toBe(0);
  });

  it('is 0.5 halfway through the logical day', () => {
    const now = new Date(2026, 5, 19, 16, 0, 0); // 12h after a 4am start
    expect(dayProgress(4, now)).toBeCloseTo(0.5, 5);
  });

  it('wraps and stays just under 1 right before the next day start', () => {
    const now = new Date(2026, 5, 19, 3, 59, 0); // 1 minute before 4am start
    expect(dayProgress(4, now)).toBeCloseTo(1 - 1 / (24 * 60), 5);
  });

  it('never exceeds 1 or drops below 0', () => {
    for (let h = 0; h < 24; h++) {
      const p = dayProgress(4, new Date(2026, 5, 19, h, 0, 0));
      expect(p).toBeGreaterThanOrEqual(0);
      expect(p).toBeLessThanOrEqual(1);
    }
  });
});

describe('monthKey / monthLabel / dayOfMonth', () => {
  it('extracts the YYYY-MM prefix', () => {
    expect(monthKey('2026-06-19')).toBe('2026-06');
  });

  it('builds a human month label', () => {
    expect(monthLabel('2026-06-19')).toBe('June 2026');
  });

  it('extracts the day-of-month number', () => {
    expect(dayOfMonth('2026-06-05')).toBe(5);
  });
});

describe('greetingFor', () => {
  it('greets late night as "Still up"', () => {
    expect(greetingFor(new Date(2026, 5, 19, 2, 0, 0))).toBe('Still up');
  });

  it('greets morning', () => {
    expect(greetingFor(new Date(2026, 5, 19, 8, 0, 0))).toBe('Good morning');
  });

  it('greets afternoon', () => {
    expect(greetingFor(new Date(2026, 5, 19, 14, 0, 0))).toBe('Good afternoon');
  });

  it('greets evening', () => {
    expect(greetingFor(new Date(2026, 5, 19, 19, 0, 0))).toBe('Good evening');
  });

  it('greets late as "Winding down"', () => {
    expect(greetingFor(new Date(2026, 5, 19, 23, 0, 0))).toBe('Winding down');
  });
});
