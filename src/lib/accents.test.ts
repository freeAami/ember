import { describe, it, expect } from 'vitest';
import { ACCENTS, ACCENT_LIST, applyAccent, ringColor } from './accents';

describe('ACCENT_LIST', () => {
  it('contains one entry per accent, matching ACCENTS values', () => {
    expect(ACCENT_LIST).toEqual(Object.values(ACCENTS));
    expect(ACCENT_LIST).toHaveLength(Object.keys(ACCENTS).length);
  });
});

describe('applyAccent', () => {
  it('sets --accent and --accent-soft CSS variables for a known accent', () => {
    applyAccent('mint');
    const root = document.documentElement;
    expect(root.style.getPropertyValue('--accent')).toBe(ACCENTS.mint.accent);
    expect(root.style.getPropertyValue('--accent-soft')).toBe(ACCENTS.mint.soft);
  });

  it('falls back to the ember accent for an unrecognized name', () => {
    // @ts-expect-error deliberately invalid accent name
    applyAccent('not-a-real-accent');
    const root = document.documentElement;
    expect(root.style.getPropertyValue('--accent')).toBe(ACCENTS.ember.accent);
    expect(root.style.getPropertyValue('--accent-soft')).toBe(ACCENTS.ember.soft);
  });
});

describe('ringColor', () => {
  it('starts at the warm ember hue when progress is 0', () => {
    expect(ringColor(0)).toBe('hsl(28 80% 60%)');
  });

  it('ends at the cool blue hue when progress is 1', () => {
    expect(ringColor(1)).toBe('hsl(200 62% 54%)');
  });

  it('interpolates linearly at the midpoint', () => {
    expect(ringColor(0.5)).toBe('hsl(114 71% 57%)');
  });
});
