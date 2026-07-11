import { describe, it, expect } from 'vitest';
import type { ArchivedDay } from '@/types';
import { EMPTY_FILTERS, hasActiveFilters, searchDays, countMatches, type SearchFilters } from './search';

function day(date: string, goals: ArchivedDay['goals']): ArchivedDay {
  return {
    date,
    goals,
    total: goals.length,
    completed: goals.filter((g) => g.done).length,
    categories: [...new Set(goals.map((g) => g.category).filter((c): c is string => !!c))],
  };
}

const DAYS: ArchivedDay[] = [
  day('2026-06-01', [
    { id: '1', title: 'Write report', done: true, category: 'work', order: 0 },
    { id: '2', title: 'Go for a run', done: false, category: 'health', order: 1 },
  ]),
  day('2026-06-02', [
    { id: '3', title: 'Read a book', done: false, category: 'personal', order: 0 },
  ]),
];

describe('hasActiveFilters', () => {
  it('is false for the empty filter set', () => {
    expect(hasActiveFilters(EMPTY_FILTERS)).toBe(false);
  });

  it('is false when query is only whitespace', () => {
    expect(hasActiveFilters({ query: '   ', category: 'all', status: 'all' })).toBe(false);
  });

  it('is true when a query is set', () => {
    expect(hasActiveFilters({ query: 'run', category: 'all', status: 'all' })).toBe(true);
  });

  it('is true when a category filter is set', () => {
    expect(hasActiveFilters({ query: '', category: 'work', status: 'all' })).toBe(true);
  });

  it('is true when a status filter is set', () => {
    expect(hasActiveFilters({ query: '', category: 'all', status: 'done' })).toBe(true);
  });
});

describe('searchDays', () => {
  it('returns days untouched when no filters are active (browse mode)', () => {
    expect(searchDays(DAYS, EMPTY_FILTERS)).toEqual(DAYS);
  });

  it('filters goals by case-insensitive substring query', () => {
    const filters: SearchFilters = { query: 'RUN', category: 'all', status: 'all' };
    const result = searchDays(DAYS, filters);
    expect(result).toHaveLength(1);
    expect(result[0].goals).toEqual([DAYS[0].goals[1]]);
  });

  it('filters goals by category', () => {
    const filters: SearchFilters = { query: '', category: 'health', status: 'all' };
    const result = searchDays(DAYS, filters);
    expect(result).toHaveLength(1);
    expect(result[0].goals.map((g) => g.id)).toEqual(['2']);
  });

  it('filters goals by done status', () => {
    const filters: SearchFilters = { query: '', category: 'all', status: 'done' };
    const result = searchDays(DAYS, filters);
    expect(result).toHaveLength(1);
    expect(result[0].goals.map((g) => g.id)).toEqual(['1']);
  });

  it('filters goals by open status', () => {
    const filters: SearchFilters = { query: '', category: 'all', status: 'open' };
    const result = searchDays(DAYS, filters);
    expect(result.flatMap((d) => d.goals.map((g) => g.id))).toEqual(['2', '3']);
  });

  it('drops days that have no matching goals after filtering', () => {
    const filters: SearchFilters = { query: 'nonexistent goal', category: 'all', status: 'all' };
    expect(searchDays(DAYS, filters)).toEqual([]);
  });

  it('combines query, category, and status filters', () => {
    const filters: SearchFilters = { query: 'report', category: 'work', status: 'done' };
    const result = searchDays(DAYS, filters);
    expect(result).toHaveLength(1);
    expect(result[0].goals.map((g) => g.id)).toEqual(['1']);
  });

  it('preserves day metadata (date) while narrowing goals', () => {
    const filters: SearchFilters = { query: 'run', category: 'all', status: 'all' };
    const result = searchDays(DAYS, filters);
    expect(result[0].date).toBe('2026-06-01');
  });
});

describe('countMatches', () => {
  it('sums goals across all days', () => {
    expect(countMatches(DAYS)).toBe(3);
  });

  it('is 0 for an empty list', () => {
    expect(countMatches([])).toBe(0);
  });
});
