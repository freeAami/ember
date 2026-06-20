import { useStore } from '@/store/useStore';
import { ACCENTS } from '@/lib/accents';

/** The active accent as a concrete `rgb()` string (for canvas/SVG fills). */
export function useAccentColor(): string {
  const accent = useStore((s) => s.settings.accent);
  return `rgb(${ACCENTS[accent].accent})`;
}
