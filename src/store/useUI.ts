import { create } from 'zustand';

export type View = 'today' | 'analytics' | 'archive' | 'settings';

interface UIState {
  view: View;
  setView: (v: View) => void;

  commandOpen: boolean;
  setCommandOpen: (open: boolean) => void;
  toggleCommand: () => void;

  focusMode: boolean;
  focusGoalId: string | null;
  enterFocus: (goalId?: string | null) => void;
  exitFocus: () => void;

  planningOpen: boolean;
  setPlanningOpen: (open: boolean) => void;

  /** Week-start key of the review being viewed, or null. */
  reviewWeek: string | null;
  openReview: (weekStart: string) => void;
  closeReview: () => void;

  /** Transient toast message. */
  toast: string | null;
  notify: (msg: string) => void;
  clearToast: () => void;
}

export const useUI = create<UIState>((set) => ({
  view: 'today',
  setView: (view) => set({ view }),

  commandOpen: false,
  setCommandOpen: (commandOpen) => set({ commandOpen }),
  toggleCommand: () => set((s) => ({ commandOpen: !s.commandOpen })),

  focusMode: false,
  focusGoalId: null,
  enterFocus: (goalId = null) => set({ focusMode: true, focusGoalId: goalId }),
  exitFocus: () => set({ focusMode: false, focusGoalId: null }),

  planningOpen: false,
  setPlanningOpen: (planningOpen) => set({ planningOpen }),

  reviewWeek: null,
  openReview: (reviewWeek) => set({ reviewWeek }),
  closeReview: () => set({ reviewWeek: null }),

  toast: null,
  notify: (toast) => set({ toast }),
  clearToast: () => set({ toast: null }),
}));
