import type { DateKey } from '@/types';

/** Format a Date as a local YYYY-MM-DD key (never UTC-shifted). */
export function toKey(d: Date): DateKey {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function fromKey(key: DateKey): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/**
 * The "logical" today, honouring a configurable day-start hour.
 * If the clock is before dayStartHour, we still count it as yesterday —
 * so late-night work rolls into the right day.
 */
export function logicalToday(dayStartHour: number, now = new Date()): DateKey {
  const shifted = new Date(now);
  if (now.getHours() < dayStartHour) {
    shifted.setDate(shifted.getDate() - 1);
  }
  return toKey(shifted);
}

export function addDays(key: DateKey, n: number): DateKey {
  const d = fromKey(key);
  d.setDate(d.getDate() + n);
  return toKey(d);
}

export function tomorrowKey(dayStartHour: number, now = new Date()): DateKey {
  return addDays(logicalToday(dayStartHour, now), 1);
}

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export function prettyDate(key: DateKey): string {
  const d = fromKey(key);
  return `${WEEKDAYS[d.getDay()]}, ${MONTHS[d.getMonth()]} ${d.getDate()}`;
}

export function shortWeekday(key: DateKey): string {
  return WEEKDAYS[fromKey(key).getDay()].slice(0, 3);
}

export function weekdayName(key: DateKey): string {
  return WEEKDAYS[fromKey(key).getDay()];
}

/** Fraction (0–1) of the logical day elapsed, given a day-start hour. */
export function dayProgress(dayStartHour: number, now = new Date()): number {
  const minutesSinceStart =
    (now.getHours() - dayStartHour + 24) % 24 * 60 + now.getMinutes();
  return Math.min(1, Math.max(0, minutesSinceStart / (24 * 60)));
}

export function monthKey(key: DateKey): string {
  return key.slice(0, 7);
}

export function monthLabel(key: DateKey): string {
  const d = fromKey(key);
  return `${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

export function dayOfMonth(key: DateKey): number {
  return fromKey(key).getDate();
}

/** Compact label like "Jun 3" (year omitted). */
export function shortDate(key: DateKey): string {
  const d = fromKey(key);
  return `${MONTHS[d.getMonth()].slice(0, 3)} ${d.getDate()}`;
}

export function greetingFor(now = new Date()): string {
  const h = now.getHours();
  if (h < 5) return 'Still up';
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  if (h < 22) return 'Good evening';
  return 'Winding down';
}
