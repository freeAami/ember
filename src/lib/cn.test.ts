import { describe, it, expect } from 'vitest';
import { cn } from './cn';

describe('cn', () => {
  it('joins plain string arguments', () => {
    expect(cn('a', 'b', 'c')).toBe('a b c');
  });

  it('drops falsy values', () => {
    expect(cn('a', false, null, undefined, 0, '', 'b')).toBe('a b');
  });

  it('applies object-conditional classes', () => {
    expect(cn({ active: true, disabled: false })).toBe('active');
  });

  it('flattens arrays of class values', () => {
    expect(cn(['a', 'b'], { c: true })).toBe('a b c');
  });

  it('returns an empty string when nothing is truthy', () => {
    expect(cn(false, undefined, null)).toBe('');
  });
});
