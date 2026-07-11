import { describe, it, expect, afterEach, vi } from 'vitest';
import type { EmberData } from '@/types';
import { DEFAULT_CATEGORIES } from './categories';
import { DEFAULT_SETTINGS } from '@/store/useStore';
import { downloadJSON, pickJSON, timestampedName } from './io';

const SAMPLE_DATA: EmberData = {
  goals: [],
  history: {},
  archive: {},
  reviews: {},
  categories: DEFAULT_CATEGORIES,
  settings: DEFAULT_SETTINGS,
  version: 2,
};

describe('downloadJSON', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('creates an object URL, triggers a click on a temporary anchor, and revokes the URL', () => {
    const createObjectURL = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock-url');
    const revokeObjectURL = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});

    downloadJSON(SAMPLE_DATA, 'my-backup.json');

    expect(createObjectURL).toHaveBeenCalledTimes(1);
    const blobArg = createObjectURL.mock.calls[0][0] as Blob;
    expect(blobArg.type).toBe('application/json');
    expect(click).toHaveBeenCalledTimes(1);
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
  });

  it('does not leave the temporary anchor attached to the document', () => {
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock-url');
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});

    const before = document.body.children.length;
    downloadJSON(SAMPLE_DATA);
    expect(document.body.children.length).toBe(before);
  });

  it('defaults the filename to ember-backup.json', () => {
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock-url');
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
    let capturedDownload = '';
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (this: HTMLAnchorElement) {
      capturedDownload = this.download;
    });

    downloadJSON(SAMPLE_DATA);
    expect(capturedDownload).toBe('ember-backup.json');
  });
});

describe('pickJSON', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  function stubFileInput(): { fire: (file: File | undefined) => void } {
    const input = document.createElement('input');
    let onchange: (() => void) | null = null;
    Object.defineProperty(input, 'onchange', {
      set(fn) {
        onchange = fn;
      },
      get() {
        return onchange;
      },
    });
    let currentFile: File | undefined;
    Object.defineProperty(input, 'files', {
      get() {
        return currentFile ? [currentFile] : [];
      },
    });
    vi.spyOn(input, 'click').mockImplementation(() => {});
    vi.spyOn(document, 'createElement').mockReturnValue(input);
    return {
      fire(file) {
        currentFile = file;
        onchange?.();
      },
    };
  }

  it('resolves with the parsed JSON from the selected file', async () => {
    const { fire } = stubFileInput();
    const file = new File([JSON.stringify(SAMPLE_DATA)], 'backup.json', { type: 'application/json' });

    const promise = pickJSON();
    fire(file);
    const result = await promise;

    expect(result).toEqual(SAMPLE_DATA);
  });

  it('resolves with null when no file is selected', async () => {
    const { fire } = stubFileInput();
    const promise = pickJSON();
    fire(undefined);
    expect(await promise).toBeNull();
  });

  it('resolves with null when the file contains invalid JSON', async () => {
    const { fire } = stubFileInput();
    const file = new File(['not json'], 'backup.json', { type: 'application/json' });

    const promise = pickJSON();
    fire(file);
    expect(await promise).toBeNull();
  });
});

describe('timestampedName', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('formats the current date as ember-YYYYMMDD.json', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-04T10:00:00'));
    expect(timestampedName()).toBe('ember-20260304.json');
  });

  it('zero-pads single-digit months and days', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-09T10:00:00'));
    expect(timestampedName()).toBe('ember-20260109.json');
  });
});
