import type { EmberData } from '@/types';

/** Trigger a download of the given data as a pretty-printed JSON file. */
export function downloadJSON(data: EmberData, filename = 'ember-backup.json'): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/** Open a file picker and resolve with the parsed Ember data. */
export function pickJSON(): Promise<EmberData | null> {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json,.json';
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) return resolve(null);
      const reader = new FileReader();
      reader.onload = () => {
        try {
          resolve(JSON.parse(String(reader.result)) as EmberData);
        } catch {
          resolve(null);
        }
      };
      reader.onerror = () => resolve(null);
      reader.readAsText(file);
    };
    input.click();
  });
}

export function timestampedName(): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, '0');
  return `ember-${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}.json`;
}
