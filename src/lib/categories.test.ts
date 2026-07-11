import { describe, it, expect, afterEach, vi } from 'vitest';
import {
  CATEGORY_ICONS,
  ICON_KEYS,
  CATEGORY_COLORS,
  DEFAULT_CATEGORIES,
  iconFor,
  makeCategory,
  findCategory,
} from './categories';

describe('ICON_KEYS', () => {
  it('mirrors the keys of CATEGORY_ICONS', () => {
    expect(ICON_KEYS.sort()).toEqual(Object.keys(CATEGORY_ICONS).sort());
  });
});

describe('iconFor', () => {
  it('resolves a known icon key', () => {
    expect(iconFor('heart')).toBe(CATEGORY_ICONS.heart);
  });

  it('falls back to the tag icon for an unknown key', () => {
    expect(iconFor('does-not-exist')).toBe(CATEGORY_ICONS.tag);
  });
});

describe('makeCategory', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('trims the provided name', () => {
    const cat = makeCategory('  Reading  ');
    expect(cat.name).toBe('Reading');
  });

  it('defaults to the tag icon when none is given', () => {
    const cat = makeCategory('Reading');
    expect(cat.icon).toBe('tag');
  });

  it('uses an explicit icon and color when provided', () => {
    const cat = makeCategory('Reading', 'palette', '1 2 3');
    expect(cat.icon).toBe('palette');
    expect(cat.color).toBe('1 2 3');
  });

  it('assigns a random color from the palette when none is given', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    const first = makeCategory('A');
    expect(first.color).toBe(CATEGORY_COLORS[0]);

    vi.spyOn(Math, 'random').mockReturnValue(0.999);
    const last = makeCategory('B');
    expect(last.color).toBe(CATEGORY_COLORS[CATEGORY_COLORS.length - 1]);
  });

  it('generates a unique id per call', () => {
    const a = makeCategory('A');
    const b = makeCategory('B');
    expect(a.id).not.toBe(b.id);
  });
});

describe('findCategory', () => {
  it('finds a category by id', () => {
    const found = findCategory(DEFAULT_CATEGORIES, 'work');
    expect(found?.name).toBe('Work');
  });

  it('returns undefined when the id is missing', () => {
    expect(findCategory(DEFAULT_CATEGORIES, undefined)).toBeUndefined();
  });

  it('returns undefined when no category matches', () => {
    expect(findCategory(DEFAULT_CATEGORIES, 'nonexistent')).toBeUndefined();
  });
});
