import { describe, it, expect, afterEach, vi } from 'vitest';
import { uid } from './id';

describe('uid', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('uses crypto.randomUUID when available', () => {
    const spy = vi.spyOn(crypto, 'randomUUID').mockReturnValue('11111111-1111-4111-8111-111111111111');
    expect(uid()).toBe('11111111-1111-4111-8111-111111111111');
    spy.mockRestore();
  });

  it('produces distinct ids across many calls', () => {
    const ids = new Set(Array.from({ length: 1000 }, () => uid()));
    expect(ids.size).toBe(1000);
  });

  it('falls back to a timestamp/random string when randomUUID is unavailable', () => {
    vi.stubGlobal('crypto', {});
    try {
      const id = uid();
      expect(id).toMatch(/^[a-z0-9]+-[a-z0-9]+$/);
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
