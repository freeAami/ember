import type { ArchivedDay } from '@/types';

export type StatusFilter = 'all' | 'done' | 'open';

export interface SearchFilters {
  query: string;
  category: string | 'all';
  status: StatusFilter;
}

export const EMPTY_FILTERS: SearchFilters = { query: '', category: 'all', status: 'all' };

export function hasActiveFilters(f: SearchFilters): boolean {
  return f.query.trim() !== '' || f.category !== 'all' || f.status !== 'all';
}

/**
 * Filter archived days by text, category, and completion status — instantly,
 * entirely in memory. When no filters are active, days pass through untouched
 * (browse mode); otherwise each day is narrowed to its matching goals and
 * empty days are dropped.
 */
export function searchDays(days: ArchivedDay[], filters: SearchFilters): ArchivedDay[] {
  if (!hasActiveFilters(filters)) return days;
  const q = filters.query.trim().toLowerCase();

  const result: ArchivedDay[] = [];
  for (const day of days) {
    const goals = day.goals.filter((g) => {
      if (q && !g.title.toLowerCase().includes(q)) return false;
      if (filters.category !== 'all' && g.category !== filters.category) return false;
      if (filters.status === 'done' && !g.done) return false;
      if (filters.status === 'open' && g.done) return false;
      return true;
    });
    if (goals.length === 0) continue;
    result.push({ ...day, goals });
  }
  return result;
}

export function countMatches(days: ArchivedDay[]): number {
  return days.reduce((sum, d) => sum + d.goals.length, 0);
}
