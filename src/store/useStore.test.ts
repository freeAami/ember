import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useStore, DEFAULT_SETTINGS } from './useStore';
import { DEFAULT_CATEGORIES } from '@/lib/categories';

// Capture the pristine store shape (data + actions) once, before any test
// mutates it, so we can do a full-replace reset between tests without losing
// the action references.
const initialState = useStore.getState();

beforeEach(() => {
  useStore.setState(initialState, true);
  window.localStorage.clear();
});

afterEach(() => {
  vi.useRealTimers();
});

function setNow(iso: string) {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(iso));
}

describe('addGoal', () => {
  it('adds a trimmed goal to today by default', () => {
    setNow('2026-06-19T12:00:00');
    useStore.getState().addGoal('  Write tests  ');
    const goals = useStore.getState().goals;
    expect(goals).toHaveLength(1);
    expect(goals[0].title).toBe('Write tests');
    expect(goals[0].date).toBe('2026-06-19');
    expect(goals[0].done).toBe(false);
    expect(goals[0].order).toBe(0);
  });

  it('does not add a goal for a blank/whitespace-only title', () => {
    useStore.getState().addGoal('   ');
    expect(useStore.getState().goals).toHaveLength(0);
  });

  it('assigns to an explicit date when provided', () => {
    useStore.getState().addGoal('Future thing', '2026-07-01');
    expect(useStore.getState().goals[0].date).toBe('2026-07-01');
  });

  it('increments order per day, independent of other days', () => {
    useStore.getState().addGoal('A', '2026-06-19');
    useStore.getState().addGoal('B', '2026-06-19');
    useStore.getState().addGoal('C', '2026-06-20');
    const goals = useStore.getState().goals;
    expect(goals.filter((g) => g.date === '2026-06-19').map((g) => g.order)).toEqual([0, 1]);
    expect(goals.find((g) => g.date === '2026-06-20')!.order).toBe(0);
  });

  it('honours the configured dayStartHour when no explicit date is given', () => {
    useStore.getState().setSettings({ dayStartHour: 4 });
    setNow('2026-06-19T03:00:00'); // before the 4am boundary
    useStore.getState().addGoal('Late night task');
    expect(useStore.getState().goals[0].date).toBe('2026-06-18');
  });
});

describe('toggleGoal', () => {
  it('marks a goal done and stamps completedAt', () => {
    setNow('2026-06-19T12:00:00');
    const id = useStore.getState().addGoal('Task');
    useStore.getState().toggleGoal(id);
    const g = useStore.getState().goals.find((x) => x.id === id)!;
    expect(g.done).toBe(true);
    expect(g.completedAt).toBeTypeOf('number');
  });

  it('un-marks a goal and clears completedAt', () => {
    const id = useStore.getState().addGoal('Task');
    useStore.getState().toggleGoal(id);
    useStore.getState().toggleGoal(id);
    const g = useStore.getState().goals.find((x) => x.id === id)!;
    expect(g.done).toBe(false);
    expect(g.completedAt).toBeUndefined();
  });

  it('is a no-op for an unknown id', () => {
    useStore.getState().addGoal('Task');
    const before = useStore.getState().goals;
    useStore.getState().toggleGoal('nonexistent');
    expect(useStore.getState().goals).toEqual(before);
  });
});

describe('updateGoal / deleteGoal / setGoalCategory', () => {
  it('patches only the provided fields', () => {
    const id = useStore.getState().addGoal('Task', '2026-06-19');
    useStore.getState().updateGoal(id, { title: 'Renamed', notes: 'note' });
    const g = useStore.getState().goals.find((x) => x.id === id)!;
    expect(g.title).toBe('Renamed');
    expect(g.notes).toBe('note');
    expect(g.date).toBe('2026-06-19');
  });

  it('removes the goal on delete', () => {
    const id = useStore.getState().addGoal('Task');
    useStore.getState().deleteGoal(id);
    expect(useStore.getState().goals.find((x) => x.id === id)).toBeUndefined();
  });

  it('sets or clears a goal category', () => {
    const id = useStore.getState().addGoal('Task');
    useStore.getState().setGoalCategory(id, 'work');
    expect(useStore.getState().goals.find((x) => x.id === id)!.category).toBe('work');
    useStore.getState().setGoalCategory(id, undefined);
    expect(useStore.getState().goals.find((x) => x.id === id)!.category).toBeUndefined();
  });
});

describe('reorderForDate / moveGoalToDate / clearCompleted', () => {
  it('reorders only goals matching the given date', () => {
    const a = useStore.getState().addGoal('A', '2026-06-19');
    const b = useStore.getState().addGoal('B', '2026-06-19');
    const c = useStore.getState().addGoal('C', '2026-06-20');
    useStore.getState().reorderForDate('2026-06-19', [b, a]);
    const goals = useStore.getState().goals;
    expect(goals.find((g) => g.id === a)!.order).toBe(1);
    expect(goals.find((g) => g.id === b)!.order).toBe(0);
    expect(goals.find((g) => g.id === c)!.order).toBe(0); // untouched, different date
  });

  it('moves a goal to a new date without altering others', () => {
    const id = useStore.getState().addGoal('A', '2026-06-19');
    useStore.getState().moveGoalToDate(id, '2026-07-04');
    expect(useStore.getState().goals.find((g) => g.id === id)!.date).toBe('2026-07-04');
  });

  it('clears only completed goals for the given date', () => {
    const a = useStore.getState().addGoal('A', '2026-06-19');
    const b = useStore.getState().addGoal('B', '2026-06-19');
    useStore.getState().addGoal('C', '2026-06-20');
    useStore.getState().toggleGoal(a);
    useStore.getState().clearCompleted('2026-06-19');
    const goals = useStore.getState().goals;
    expect(goals.find((g) => g.id === a)).toBeUndefined();
    expect(goals.find((g) => g.id === b)).toBeDefined();
    expect(goals).toHaveLength(2);
  });
});

describe('categories', () => {
  it('adds a category and lists it', () => {
    const id = useStore.getState().addCategory('Reading');
    expect(useStore.getState().categories.find((c) => c.id === id)?.name).toBe('Reading');
  });

  it('detaches deleted category from live goals but keeps the goal', () => {
    const catId = useStore.getState().addCategory('Reading');
    const goalId = useStore.getState().addGoal('Book', '2026-06-19', catId);
    useStore.getState().deleteCategory(catId);
    expect(useStore.getState().categories.find((c) => c.id === catId)).toBeUndefined();
    const g = useStore.getState().goals.find((x) => x.id === goalId)!;
    expect(g).toBeDefined();
    expect(g.category).toBeUndefined();
  });
});

describe('settings', () => {
  it('merges partial settings patches', () => {
    useStore.getState().setSettings({ accent: 'mint' });
    expect(useStore.getState().settings.accent).toBe('mint');
    expect(useStore.getState().settings.dayStartHour).toBe(DEFAULT_SETTINGS.dayStartHour);
  });

  it('completeOnboarding trims the name and flips the flag', () => {
    useStore.getState().completeOnboarding('  Ada  ');
    expect(useStore.getState().settings.name).toBe('Ada');
    expect(useStore.getState().settings.onboarded).toBe(true);
  });
});

describe('reconcile — day rollover', () => {
  it('is a no-op when no goals are dated before today', () => {
    setNow('2026-06-19T12:00:00');
    useStore.getState().addGoal('Today task');
    const before = useStore.getState();
    useStore.getState().reconcile();
    const after = useStore.getState();
    expect(after.goals).toEqual(before.goals);
    expect(after.archive).toEqual({});
    expect(after.history).toEqual({});
  });

  it('archives a past day, records history, and rolls only incomplete goals into today', () => {
    setNow('2026-06-19T12:00:00');
    const doneA = useStore.getState().addGoal('Done A', '2026-06-18');
    useStore.getState().addGoal('Done B', '2026-06-18');
    const openC = useStore.getState().addGoal('Open C', '2026-06-18');
    useStore.getState().toggleGoal(doneA);
    const doneBId = useStore.getState().goals.find((g) => g.title === 'Done B')!.id;
    useStore.getState().toggleGoal(doneBId);

    useStore.getState().reconcile();

    const state = useStore.getState();
    // History + archive captured for the sealed day.
    expect(state.history['2026-06-18']).toEqual({ date: '2026-06-18', total: 3, completed: 2 });
    expect(state.archive['2026-06-18'].total).toBe(3);
    expect(state.archive['2026-06-18'].completed).toBe(2);
    expect(state.archive['2026-06-18'].goals.map((g) => g.id).sort()).toEqual(
      [doneA, doneBId, openC].sort(),
    );

    // Only the incomplete goal survives, rolled onto today.
    expect(state.goals).toHaveLength(1);
    expect(state.goals[0].id).toBe(openC);
    expect(state.goals[0].date).toBe('2026-06-19');
    expect(state.goals[0].done).toBe(false);
  });

  it('appends rolled goals after any goals already scheduled for today', () => {
    setNow('2026-06-19T12:00:00');
    useStore.getState().addGoal('Already today', '2026-06-19');
    const openYesterday = useStore.getState().addGoal('Carried over', '2026-06-18');

    useStore.getState().reconcile();

    const goals = useStore.getState().goals;
    const todayGoal = goals.find((g) => g.title === 'Already today')!;
    const rolled = goals.find((g) => g.id === openYesterday)!;
    expect(todayGoal.order).toBe(0);
    expect(rolled.order).toBe(1);
  });

  it('is idempotent — a second call does not re-archive or duplicate goals', () => {
    setNow('2026-06-19T12:00:00');
    useStore.getState().addGoal('Open', '2026-06-18');
    useStore.getState().reconcile();
    const afterFirst = useStore.getState();

    useStore.getState().reconcile();
    const afterSecond = useStore.getState();

    expect(afterSecond.goals).toEqual(afterFirst.goals);
    expect(afterSecond.archive).toEqual(afterFirst.archive);
    expect(afterSecond.history).toEqual(afterFirst.history);
  });

  it('seals multiple distinct past days in one pass', () => {
    setNow('2026-06-19T12:00:00');
    useStore.getState().addGoal('Two days ago', '2026-06-17');
    useStore.getState().addGoal('Yesterday', '2026-06-18');

    useStore.getState().reconcile();

    const state = useStore.getState();
    expect(Object.keys(state.archive).sort()).toEqual(['2026-06-17', '2026-06-18']);
    expect(state.goals).toHaveLength(2);
    expect(state.goals.every((g) => g.date === '2026-06-19')).toBe(true);
  });

  it('respects dayStartHour: a goal dated "logical yesterday" does not roll early', () => {
    useStore.getState().setSettings({ dayStartHour: 4 });
    setNow('2026-06-19T03:00:00'); // clock says 06-19, but logical today is still 06-18
    useStore.getState().addGoal('Still open', '2026-06-18');

    useStore.getState().reconcile();

    const state = useStore.getState();
    expect(state.archive).toEqual({});
    expect(state.goals).toHaveLength(1);
    expect(state.goals[0].date).toBe('2026-06-18');
  });

  it('rolls a goal forward once the logical day-start boundary is crossed', () => {
    useStore.getState().setSettings({ dayStartHour: 4 });
    setNow('2026-06-18T23:00:00');
    useStore.getState().addGoal('Late task', '2026-06-18');

    // Clock advances past midnight but before the 4am boundary — logical
    // today is still 06-18, so nothing should roll yet.
    vi.setSystemTime(new Date('2026-06-19T03:30:00'));
    useStore.getState().reconcile();
    expect(useStore.getState().archive).toEqual({});

    // Now cross the 4am boundary — logical today becomes 06-19.
    vi.setSystemTime(new Date('2026-06-19T04:30:00'));
    useStore.getState().reconcile();
    const state = useStore.getState();
    expect(state.archive['2026-06-18']).toBeDefined();
    expect(state.goals[0].date).toBe('2026-06-19');
  });

  it('generates a weekly review once its week is fully sealed', () => {
    setNow('2026-06-19T12:00:00'); // Friday
    // Seed a fully past week (Mon 06-08 .. Sun 06-14) with one completed goal.
    const id = useStore.getState().addGoal('Past week goal', '2026-06-08');
    useStore.getState().toggleGoal(id);

    useStore.getState().reconcile();

    const state = useStore.getState();
    expect(state.reviews['2026-06-08']).toBeDefined();
    expect(state.reviews['2026-06-08'].goalsFinished).toBe(1);
  });
});

describe('exportData / importData', () => {
  it('round-trips the full data shape', () => {
    useStore.getState().addGoal('A', '2026-06-19');
    useStore.getState().setSettings({ accent: 'gold' });
    const exported = useStore.getState().exportData();

    useStore.getState().resetAll();
    expect(useStore.getState().goals).toHaveLength(0);

    useStore.getState().importData(exported);
    const state = useStore.getState();
    expect(state.goals).toHaveLength(1);
    expect(state.goals[0].title).toBe('A');
    expect(state.settings.accent).toBe('gold');
  });

  it('ignores an import with a malformed goals field', () => {
    useStore.getState().addGoal('Keep me', '2026-06-19');
    const before = useStore.getState().goals;
    // @ts-expect-error deliberately malformed input to test the guard
    useStore.getState().importData({ goals: 'not-an-array' });
    expect(useStore.getState().goals).toEqual(before);
  });

  it('falls back to default categories when imported categories are empty', () => {
    useStore.getState().importData({ goals: [], categories: [] });
    expect(useStore.getState().categories).toEqual(DEFAULT_CATEGORIES);
  });
});

describe('resetAll', () => {
  it('clears data but marks onboarding complete', () => {
    useStore.getState().addGoal('A', '2026-06-19');
    useStore.getState().resetAll();
    const state = useStore.getState();
    expect(state.goals).toEqual([]);
    expect(state.history).toEqual({});
    expect(state.archive).toEqual({});
    expect(state.reviews).toEqual({});
    expect(state.categories).toEqual(DEFAULT_CATEGORIES);
    expect(state.settings.onboarded).toBe(true);
  });
});

describe('React integration', () => {
  it('re-renders subscribers when a goal is toggled', () => {
    setNow('2026-06-19T12:00:00');
    const id = useStore.getState().addGoal('Renders?');
    const { result } = renderHook(() => useStore((s) => s.goals.find((g) => g.id === id)?.done));

    expect(result.current).toBe(false);
    act(() => {
      useStore.getState().toggleGoal(id);
    });
    expect(result.current).toBe(true);
  });
});
