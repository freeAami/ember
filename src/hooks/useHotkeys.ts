import { useEffect } from 'react';
import { useUI } from '@/store/useUI';

function isTyping(el: EventTarget | null): boolean {
  const node = el as HTMLElement | null;
  if (!node) return false;
  const tag = node.tagName;
  return (
    tag === 'INPUT' ||
    tag === 'TEXTAREA' ||
    node.isContentEditable === true
  );
}

/**
 * Global keyboard layer. The app is fully operable from here:
 * ⌘K palette, focus mode, quick-add, and single-key navigation.
 */
export function useHotkeys(): void {
  const { toggleCommand, setCommandOpen, enterFocus, exitFocus, setView } = useUI();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;

      // Palette — works even while typing.
      if (mod && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        toggleCommand();
        return;
      }

      if (e.key === 'Escape') {
        setCommandOpen(false);
        return;
      }

      if (isTyping(e.target) || mod || e.altKey) return;

      switch (e.key.toLowerCase()) {
        case 'n':
          e.preventDefault();
          window.dispatchEvent(new CustomEvent('ember:newgoal'));
          break;
        case 'f':
          e.preventDefault();
          if (useUI.getState().focusMode) exitFocus();
          else enterFocus();
          break;
        case 't':
          setView('today');
          break;
        case 'a':
          setView('analytics');
          break;
        case 's':
          setView('settings');
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [toggleCommand, setCommandOpen, enterFocus, exitFocus, setView]);
}
