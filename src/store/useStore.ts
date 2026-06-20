import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ArchivedDay, Category, DateKey, EmberData, Goal, Settings } from '@/types';
import { logicalToday } from '@/lib/date';
import { uid } from '@/lib/id';
import { DEFAULT_CATEGORIES, makeCategory } from '@/lib/categories';
import { generateReview, listCompletedWeeks } from '@/lib/review';

const SCHEMA_VERSION = 2;

export const DEFAULT_SETTINGS: Settings = {
  accent: 'ember',
  dayStartHour: 4,
  reduceMotion: false,
  grain: true,
  name: '',
  onboarded: false,
};

interface StoreState extends EmberData {
  // ─── Goal actions ───────────────────────────────────────────
  addGoal: (title: string, date?: DateKey, category?: string) => string;
  updateGoal: (id: string, patch: Partial<Pick<Goal, 'title' | 'notes' | 'category'>>) => void;
  deleteGoal: (id: string) => void;
  toggleGoal: (id: string) => void;
  setGoalCategory: (id: string, category?: string) => void;
  reorderForDate: (date: DateKey, orderedIds: string[]) => void;
  moveGoalToDate: (id: string, date: DateKey) => void;
  clearCompleted: (date: DateKey) => void;

  // ─── Categories ─────────────────────────────────────────────
  addCategory: (name: string, icon?: string, color?: string) => string;
  updateCategory: (id: string, patch: Partial<Pick<Category, 'name' | 'icon' | 'color'>>) => void;
  deleteCategory: (id: string) => void;

  // ─── Settings ───────────────────────────────────────────────
  setSettings: (patch: Partial<Settings>) => void;
  completeOnboarding: (name: string) => void;

  // ─── Lifecycle / data ───────────────────────────────────────
  reconcile: () => void;
  generateReviews: () => void;
  exportData: () => EmberData;
  importData: (data: Partial<EmberData>) => void;
  resetAll: () => void;
}

function todayKey(settings: Settings): DateKey {
  return logicalToday(settings.dayStartHour);
}

function snapshotDay(date: DateKey, goals: Goal[]): ArchivedDay {
  const dayGoals = goals.filter((g) => g.date === date);
  return {
    date,
    goals: dayGoals
      .slice()
      .sort((a, b) => a.order - b.order)
      .map((g) => ({ id: g.id, title: g.title, done: g.done, category: g.category, order: g.order })),
    total: dayGoals.length,
    completed: dayGoals.filter((g) => g.done).length,
    categories: [...new Set(dayGoals.map((g) => g.category).filter((c): c is string => !!c))],
  };
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      goals: [],
      history: {},
      archive: {},
      reviews: {},
      categories: DEFAULT_CATEGORIES,
      settings: DEFAULT_SETTINGS,
      version: SCHEMA_VERSION,

      addGoal: (title, date, category) => {
        const trimmed = title.trim();
        const id = uid();
        if (!trimmed) return id;
        const day = date ?? todayKey(get().settings);
        const siblings = get().goals.filter((g) => g.date === day);
        const order = siblings.length ? Math.max(...siblings.map((g) => g.order)) + 1 : 0;
        const goal: Goal = {
          id,
          title: trimmed,
          date: day,
          done: false,
          category,
          order,
          createdAt: Date.now(),
        };
        set((s) => ({ goals: [...s.goals, goal] }));
        return id;
      },

      updateGoal: (id, patch) =>
        set((s) => ({ goals: s.goals.map((g) => (g.id === id ? { ...g, ...patch } : g)) })),

      deleteGoal: (id) => set((s) => ({ goals: s.goals.filter((g) => g.id !== id) })),

      toggleGoal: (id) =>
        set((s) => ({
          goals: s.goals.map((g) =>
            g.id === id
              ? { ...g, done: !g.done, completedAt: !g.done ? Date.now() : undefined }
              : g,
          ),
        })),

      setGoalCategory: (id, category) =>
        set((s) => ({ goals: s.goals.map((g) => (g.id === id ? { ...g, category } : g)) })),

      reorderForDate: (date, orderedIds) =>
        set((s) => ({
          goals: s.goals.map((g) => {
            if (g.date !== date) return g;
            const idx = orderedIds.indexOf(g.id);
            return idx === -1 ? g : { ...g, order: idx };
          }),
        })),

      moveGoalToDate: (id, date) =>
        set((s) => ({ goals: s.goals.map((g) => (g.id === id ? { ...g, date } : g)) })),

      clearCompleted: (date) =>
        set((s) => ({ goals: s.goals.filter((g) => !(g.date === date && g.done)) })),

      addCategory: (name, icon, color) => {
        const cat = makeCategory(name, icon, color);
        if (!cat.name) return cat.id;
        set((s) => ({ categories: [...s.categories, cat] }));
        return cat.id;
      },

      updateCategory: (id, patch) =>
        set((s) => ({ categories: s.categories.map((c) => (c.id === id ? { ...c, ...patch } : c)) })),

      deleteCategory: (id) =>
        set((s) => ({
          categories: s.categories.filter((c) => c.id !== id),
          // Detach the category from any live goals; archived snapshots keep history.
          goals: s.goals.map((g) => (g.category === id ? { ...g, category: undefined } : g)),
        })),

      setSettings: (patch) => set((s) => ({ settings: { ...s.settings, ...patch } })),

      completeOnboarding: (name) =>
        set((s) => ({ settings: { ...s.settings, name: name.trim(), onboarded: true } })),

      /**
       * Seal past days into history + the archive, then roll incomplete goals
       * into today. Idempotent — safe to call on launch, focus, and at midnight.
       */
      reconcile: () => {
        const { goals, history, archive, settings } = get();
        const today = todayKey(settings);
        const pastDates = [...new Set(goals.filter((g) => g.date < today).map((g) => g.date))];
        if (pastDates.length === 0) {
          get().generateReviews();
          return;
        }

        const nextHistory = { ...history };
        const nextArchive = { ...archive };
        for (const d of pastDates) {
          const snap = snapshotDay(d, goals);
          nextArchive[d] = snap;
          nextHistory[d] = { date: d, total: snap.total, completed: snap.completed };
        }

        const survivors = goals.filter((g) => g.date >= today);
        const baseOrder = survivors.filter((g) => g.date === today).length;
        const rolled = goals
          .filter((g) => g.date < today && !g.done)
          .map((g, i) => ({ ...g, date: today, done: false, order: baseOrder + i }));

        set({ history: nextHistory, archive: nextArchive, goals: [...survivors, ...rolled] });
        get().generateReviews();
      },

      /** Build reviews for any completed week that doesn't yet have one. */
      generateReviews: () => {
        const { history, archive, reviews, settings } = get();
        const today = todayKey(settings);
        const weeks = listCompletedWeeks(history, today);
        const missing = weeks.filter((w) => !reviews[w]);
        if (missing.length === 0) return;

        const next = { ...reviews };
        let changed = false;
        for (const w of missing) {
          const review = generateReview(w, history, archive);
          if (review) {
            next[w] = review;
            changed = true;
          }
        }
        if (changed) set({ reviews: next });
      },

      exportData: () => {
        const { goals, history, archive, reviews, categories, settings } = get();
        return { goals, history, archive, reviews, categories, settings, version: SCHEMA_VERSION };
      },

      importData: (data) => {
        if (!data || !Array.isArray(data.goals)) return;
        set({
          goals: data.goals,
          history: data.history ?? {},
          archive: data.archive ?? {},
          reviews: data.reviews ?? {},
          categories: data.categories?.length ? data.categories : DEFAULT_CATEGORIES,
          settings: { ...DEFAULT_SETTINGS, ...(data.settings ?? {}) },
          version: SCHEMA_VERSION,
        });
      },

      resetAll: () =>
        set({
          goals: [],
          history: {},
          archive: {},
          reviews: {},
          categories: DEFAULT_CATEGORIES,
          settings: { ...DEFAULT_SETTINGS, onboarded: true },
          version: SCHEMA_VERSION,
        }),
    }),
    {
      name: 'ember.store.v1',
      version: SCHEMA_VERSION,
      migrate: (persisted, fromVersion) => {
        const state = (persisted ?? {}) as Partial<EmberData>;
        if (fromVersion < 2) {
          state.archive ??= {};
          state.reviews ??= {};
          state.categories = state.categories?.length ? state.categories : DEFAULT_CATEGORIES;
        }
        return state as EmberData;
      },
      partialize: (s) => ({
        goals: s.goals,
        history: s.history,
        archive: s.archive,
        reviews: s.reviews,
        categories: s.categories,
        settings: s.settings,
        version: s.version,
      }),
    },
  ),
);
