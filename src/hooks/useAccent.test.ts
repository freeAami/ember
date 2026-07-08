import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useStore } from '@/store/useStore';
import { ACCENTS } from '@/lib/accents';
import { useAccentColor } from './useAccent';

const initialState = useStore.getState();

beforeEach(() => {
  useStore.setState(initialState, true);
});

describe('useAccentColor', () => {
  it('returns the rgb() string for the current accent', () => {
    const { result } = renderHook(() => useAccentColor());
    expect(result.current).toBe(`rgb(${ACCENTS.ember.accent})`);
  });

  it('re-renders with a new color when the accent setting changes', () => {
    const { result } = renderHook(() => useAccentColor());
    act(() => {
      useStore.getState().setSettings({ accent: 'indigo' });
    });
    expect(result.current).toBe(`rgb(${ACCENTS.indigo.accent})`);
  });
});
