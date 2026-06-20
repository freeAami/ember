import type { WeeklyReview } from '@/types';
import { shortDate, weekdayName } from '@/lib/date';

export function weekLabel(r: Pick<WeeklyReview, 'weekStart' | 'weekEnd'>): string {
  return `${shortDate(r.weekStart)} – ${shortDate(r.weekEnd)}`;
}

export function bestDayLabel(r: WeeklyReview): string | null {
  if (!r.bestDay) return null;
  return weekdayName(r.bestDay);
}

export function streakDeltaLabel(delta: number): string {
  if (delta > 0) return `+${delta} this week`;
  if (delta < 0) return `${delta} this week`;
  return 'held steady';
}
