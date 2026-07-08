import { describe, it, expect, beforeEach } from 'vitest';
import { useUI } from './useUI';

const initialState = useUI.getState();

beforeEach(() => {
  useUI.setState(initialState, true);
});

describe('view', () => {
  it('defaults to today and can be changed', () => {
    expect(useUI.getState().view).toBe('today');
    useUI.getState().setView('analytics');
    expect(useUI.getState().view).toBe('analytics');
  });
});

describe('command palette', () => {
  it('toggles open state', () => {
    expect(useUI.getState().commandOpen).toBe(false);
    useUI.getState().toggleCommand();
    expect(useUI.getState().commandOpen).toBe(true);
    useUI.getState().toggleCommand();
    expect(useUI.getState().commandOpen).toBe(false);
  });

  it('setCommandOpen sets an explicit value', () => {
    useUI.getState().setCommandOpen(true);
    expect(useUI.getState().commandOpen).toBe(true);
  });
});

describe('focus mode', () => {
  it('enters focus with an optional goal id and exits cleanly', () => {
    useUI.getState().enterFocus('goal-1');
    expect(useUI.getState().focusMode).toBe(true);
    expect(useUI.getState().focusGoalId).toBe('goal-1');

    useUI.getState().exitFocus();
    expect(useUI.getState().focusMode).toBe(false);
    expect(useUI.getState().focusGoalId).toBeNull();
  });

  it('defaults focusGoalId to null when none is given', () => {
    useUI.getState().enterFocus();
    expect(useUI.getState().focusGoalId).toBeNull();
  });
});

describe('review panel', () => {
  it('opens with a week key and closes to null', () => {
    useUI.getState().openReview('2026-06-08');
    expect(useUI.getState().reviewWeek).toBe('2026-06-08');
    useUI.getState().closeReview();
    expect(useUI.getState().reviewWeek).toBeNull();
  });
});

describe('toast', () => {
  it('notifies with a message and clears it', () => {
    useUI.getState().notify('Saved!');
    expect(useUI.getState().toast).toBe('Saved!');
    useUI.getState().clearToast();
    expect(useUI.getState().toast).toBeNull();
  });
});
