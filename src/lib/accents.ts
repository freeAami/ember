import type { AccentName } from '@/types';

export interface AccentDef {
  name: AccentName;
  label: string;
  /** RGB channel triplets fed into CSS variables. */
  accent: string;
  soft: string;
}

export const ACCENTS: Record<AccentName, AccentDef> = {
  ember: { name: 'ember', label: 'Ember', accent: '255 138 76', soft: '255 178 130' },
  indigo: { name: 'indigo', label: 'Indigo', accent: '129 140 248', soft: '165 180 252' },
  mint: { name: 'mint', label: 'Mint', accent: '94 234 212', soft: '153 246 228' },
  rose: { name: 'rose', label: 'Rose', accent: '251 113 133', soft: '253 164 175' },
  gold: { name: 'gold', label: 'Gold', accent: '234 201 122', soft: '245 222 170' },
  ice: { name: 'ice', label: 'Ice', accent: '125 211 252', soft: '186 230 253' },
};

export const ACCENT_LIST = Object.values(ACCENTS);

/** Apply an accent to the document root via CSS variables. */
export function applyAccent(name: AccentName): void {
  const def = ACCENTS[name] ?? ACCENTS.ember;
  const root = document.documentElement;
  root.style.setProperty('--accent', def.accent);
  root.style.setProperty('--accent-soft', def.soft);
}

/**
 * Day-driven hue used by the progress ring — a warm dawn → cool dusk arc,
 * reminiscent of an ember cooling over the course of a day.
 */
export function ringColor(progress: number): string {
  // Hue travels from 28° (ember) → 200° (cool blue) across the day.
  const hue = 28 + progress * 172;
  const sat = 80 - progress * 18;
  const light = 60 - progress * 6;
  return `hsl(${hue} ${sat}% ${light}%)`;
}
