import { motion } from 'framer-motion';
import { Check, Download, RotateCcw, Upload } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { useUI } from '@/store/useUI';
import { ACCENT_LIST } from '@/lib/accents';
import { downloadJSON, pickJSON, timestampedName } from '@/lib/io';
import { Surface } from '@/components/ui/Surface';
import { Button } from '@/components/ui/Button';
import { Toggle } from './Toggle';
import { CategoryManager } from './CategoryManager';
import { cn } from '@/lib/cn';

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Surface className="p-6">
      <h3 className="mb-4 text-[15px] font-medium text-white/90">{title}</h3>
      {children}
    </Surface>
  );
}

export function SettingsView() {
  const settings = useStore((s) => s.settings);
  const setSettings = useStore((s) => s.setSettings);
  const exportData = useStore((s) => s.exportData);
  const importData = useStore((s) => s.importData);
  const resetAll = useStore((s) => s.resetAll);
  const notify = useUI((s) => s.notify);

  const hours = Array.from({ length: 24 }, (_, i) => i);

  return (
    <div className="mx-auto w-full max-w-2xl">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-2xl font-semibold tracking-tightest text-white">Settings</h2>
        <p className="mt-1 text-sm text-white/45">Tune Ember to your rhythm. Everything stays on this device.</p>
      </motion.div>

      <div className="mt-6 flex flex-col gap-4">
        <Card title="Identity">
          <label className="block text-[12px] uppercase tracking-wider text-white/40">Name in greeting</label>
          <input
            value={settings.name}
            onChange={(e) => setSettings({ name: e.target.value })}
            placeholder="Your name"
            className="mt-2 w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-[15px] text-white placeholder:text-white/30 outline-none focus:border-accent/40"
          />
        </Card>

        <Card title="Accent">
          <div className="flex flex-wrap gap-3">
            {ACCENT_LIST.map((a) => {
              const selected = settings.accent === a.name;
              return (
                <button
                  key={a.name}
                  onClick={() => setSettings({ accent: a.name })}
                  className={cn(
                    'group flex items-center gap-2 rounded-full border px-3 py-1.5 transition-all',
                    selected ? 'border-white/25 bg-white/[0.06]' : 'border-white/10 hover:border-white/20',
                  )}
                >
                  <span
                    className="grid h-5 w-5 place-items-center rounded-full"
                    style={{ background: `rgb(${a.accent})` }}
                  >
                    {selected && <Check size={12} className="text-ink-50" />}
                  </span>
                  <span className="text-[13px] text-white/80">{a.label}</span>
                </button>
              );
            })}
          </div>
        </Card>

        <Card title="Categories">
          <CategoryManager />
        </Card>

        <Card title="Day">
          <label className="block text-[12px] uppercase tracking-wider text-white/40">
            Day starts at
          </label>
          <p className="mt-1 text-[12px] text-white/40">
            Late-night work before this hour still counts toward the previous day.
          </p>
          <select
            value={settings.dayStartHour}
            onChange={(e) => setSettings({ dayStartHour: Number(e.target.value) })}
            className="mt-3 w-full rounded-xl border border-white/10 bg-ink-200 px-4 py-2.5 text-[15px] text-white outline-none focus:border-accent/40"
          >
            {hours.map((h) => (
              <option key={h} value={h} className="bg-ink-200">
                {String(h).padStart(2, '0')}:00
              </option>
            ))}
          </select>
        </Card>

        <Card title="Motion & atmosphere">
          <div className="divide-y divide-white/[0.06]">
            <Toggle
              label="Reduced motion"
              description="Calm the animations across the app."
              checked={settings.reduceMotion}
              onChange={(v) => setSettings({ reduceMotion: v })}
            />
            <Toggle
              label="Film grain"
              description="A subtle textured overlay on the canvas."
              checked={settings.grain}
              onChange={(v) => setSettings({ grain: v })}
            />
          </div>
        </Card>

        <Card title="Your data">
          <p className="text-[13px] text-white/50">
            Ember is local-first — your goals live only in this browser. Export regularly to keep a backup.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              variant="subtle"
              onClick={() => {
                downloadJSON(exportData(), timestampedName());
                notify('Backup exported');
              }}
            >
              <Download size={15} /> Export JSON
            </Button>
            <Button
              variant="subtle"
              onClick={async () => {
                const data = await pickJSON();
                if (data) {
                  importData(data);
                  notify('Backup restored');
                } else notify('Could not read that file');
              }}
            >
              <Upload size={15} /> Import backup
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                if (confirm('Erase all goals and history? This cannot be undone.')) {
                  resetAll();
                  notify('Everything reset');
                }
              }}
            >
              <RotateCcw size={15} /> Reset
            </Button>
          </div>
        </Card>

        <p className="pb-4 text-center text-[12px] text-white/25">Ember · v1.0 · local-first daily OS</p>
      </div>
    </div>
  );
}
