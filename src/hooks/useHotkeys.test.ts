import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useUI } from '@/store/useUI';
import { useHotkeys } from './useHotkeys';

const initialState = useUI.getState();

beforeEach(() => {
  useUI.setState(initialState, true);
});

function press(key: string, opts: Partial<KeyboardEventInit> = {}, target: EventTarget = window) {
  const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...opts });
  target.dispatchEvent(event);
  return event;
}

describe('useHotkeys', () => {
  it('toggles the command palette on Cmd/Ctrl+K', () => {
    renderHook(() => useHotkeys());
    expect(useUI.getState().commandOpen).toBe(false);
    press('k', { metaKey: true });
    expect(useUI.getState().commandOpen).toBe(true);
    press('k', { ctrlKey: true });
    expect(useUI.getState().commandOpen).toBe(false);
  });

  it('closes the command palette on Escape', () => {
    useUI.getState().setCommandOpen(true);
    renderHook(() => useHotkeys());
    press('Escape');
    expect(useUI.getState().commandOpen).toBe(false);
  });

  it('dispatches an ember:newgoal event on "n"', () => {
    renderHook(() => useHotkeys());
    const handler = vi.fn();
    window.addEventListener('ember:newgoal', handler);
    press('n');
    expect(handler).toHaveBeenCalledTimes(1);
    window.removeEventListener('ember:newgoal', handler);
  });

  it('enters focus mode on "f" when not already focused, and exits when pressed again', () => {
    renderHook(() => useHotkeys());
    expect(useUI.getState().focusMode).toBe(false);
    press('f');
    expect(useUI.getState().focusMode).toBe(true);
    press('f');
    expect(useUI.getState().focusMode).toBe(false);
  });

  it('switches views on t/a/s', () => {
    renderHook(() => useHotkeys());
    press('a');
    expect(useUI.getState().view).toBe('analytics');
    press('s');
    expect(useUI.getState().view).toBe('settings');
    press('t');
    expect(useUI.getState().view).toBe('today');
  });

  it('ignores navigation keys while typing in an input', () => {
    renderHook(() => useHotkeys());
    const input = document.createElement('input');
    document.body.appendChild(input);
    press('a', {}, input);
    expect(useUI.getState().view).toBe('today');
    document.body.removeChild(input);
  });

  it('ignores navigation keys while typing in a contentEditable element', () => {
    renderHook(() => useHotkeys());
    const div = document.createElement('div');
    Object.defineProperty(div, 'isContentEditable', { value: true });
    document.body.appendChild(div);
    press('f', {}, div);
    expect(useUI.getState().focusMode).toBe(false);
    document.body.removeChild(div);
  });

  it('still toggles the command palette with Cmd+K while typing', () => {
    renderHook(() => useHotkeys());
    const input = document.createElement('input');
    document.body.appendChild(input);
    press('k', { metaKey: true }, input);
    expect(useUI.getState().commandOpen).toBe(true);
    document.body.removeChild(input);
  });

  it('ignores single-key shortcuts when a modifier key is held', () => {
    renderHook(() => useHotkeys());
    press('a', { metaKey: true });
    expect(useUI.getState().view).toBe('today');
  });

  it('ignores single-key shortcuts when altKey is held', () => {
    renderHook(() => useHotkeys());
    press('f', { altKey: true });
    expect(useUI.getState().focusMode).toBe(false);
  });

  it('removes its keydown listener on unmount', () => {
    const { unmount } = renderHook(() => useHotkeys());
    unmount();
    press('a');
    expect(useUI.getState().view).toBe('today');
  });
});
