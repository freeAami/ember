/** Stable ISO date key, e.g. "2026-06-19". Local-day, not UTC. */
export type DateKey = string;

export interface Goal {
  id: string;
  title: string;
  notes?: string;
  /** Local day this goal belongs to. */
  date: DateKey;
  done: boolean;
  /** Optional category id. */
  category?: string;
  /** Manual ordering within a day. Lower = higher. */
  order: number;
  createdAt: number;
  completedAt?: number;
}

export type AccentName = 'ember' | 'indigo' | 'mint' | 'rose' | 'gold' | 'ice';

/** A user-facing grouping for goals. Built-ins plus custom. */
export interface Category {
  id: string;
  name: string;
  /** Key into the icon registry (see lib/categories). */
  icon: string;
  /** RGB channel triplet, e.g. "120 180 140". Kept muted by design. */
  color: string;
}

export interface Settings {
  accent: AccentName;
  /** Hour (0–23) at which a new "day" begins. Default 4am. */
  dayStartHour: number;
  /** Master switch for non-essential motion. */
  reduceMotion: boolean;
  /** Film grain overlay. */
  grain: boolean;
  /** Name used in the dashboard greeting. */
  name: string;
  /** Whether onboarding has been completed. */
  onboarded: boolean;
}

/** Lightweight per-day rollup used by analytics, streaks & the heatmap. */
export interface DayRecord {
  date: DateKey;
  total: number;
  completed: number;
}

/** A frozen snapshot of a goal as it was lived on an archived day. */
export interface ArchivedGoal {
  id: string;
  title: string;
  done: boolean;
  category?: string;
  order: number;
}

/** A full snapshot of a past day — powers the archive & search. */
export interface ArchivedDay {
  date: DateKey;
  goals: ArchivedGoal[];
  total: number;
  completed: number;
  /** Distinct category ids used that day. */
  categories: string[];
}

/** An automatically-generated, reflective weekly summary. */
export interface WeeklyReview {
  /** Monday of the week (local day key) — also the record key. */
  weekStart: DateKey;
  weekEnd: DateKey;
  completionRate: number; // 0–1, averaged over active days
  goalsFinished: number;
  bestDay: DateKey | null;
  bestDayRate: number;
  currentStreak: number;
  bestStreak: number;
  /** Net change in current streak across the week (can be negative). */
  streakDelta: number;
  /** Completed goals per category id. */
  categoryBreakdown: Record<string, number>;
  daily: Array<{ date: DateKey; rate: number; completed: number; total: number }>;
}

export interface EmberData {
  goals: Goal[];
  history: Record<DateKey, DayRecord>;
  archive: Record<DateKey, ArchivedDay>;
  reviews: Record<DateKey, WeeklyReview>;
  categories: Category[];
  settings: Settings;
  /** Schema version for safe migrations / imports. */
  version: number;
}
