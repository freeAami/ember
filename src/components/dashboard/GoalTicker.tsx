import { useMemo } from 'react';
import { ArrowUpRight, Sparkles } from 'lucide-react';
import type { Goal } from '@/types';
import { useStore } from '@/store/useStore';

/** Derive a terse, ticker-symbol-like token from a goal title. */
function symbol(title: string): string {
  const words = title.replace(/[^a-zA-Z0-9 ]/g, '').trim().split(/\s+/);
  const base = words.length >= 2 ? words.slice(0, 2).map((w) => w[0]).join('') : title.slice(0, 3);
  return base.toUpperCase().padEnd(3, 'X').slice(0, 4);
}

function hoursOpen(g: Goal): number {
  return Math.max(0, (Date.now() - g.createdAt) / 3_600_000);
}

interface TickerEntry {
  id: string;
  sym: string;
  title: string;
  delta: string;
}

export function GoalTicker({ goals }: { goals: Goal[] }) {
  const reduceMotion = useStore((s) => s.settings.reduceMotion);

  const entries = useMemo<TickerEntry[]>(
    () =>
      goals
        .filter((g) => !g.done)
        .map((g) => ({
          id: g.id,
          sym: symbol(g.title),
          title: g.title,
          delta: `${hoursOpen(g) < 1 ? '+NEW' : `${hoursOpen(g).toFixed(0)}h open`}`,
        })),
    [goals],
  );

  if (entries.length === 0) {
    return (
      <div className="flex items-center justify-center gap-2 py-2 text-[13px] text-white/45">
        <Sparkles size={14} className="text-accent" />
        Board is clear — every goal closed.
      </div>
    );
  }

  // Duration scales with item count so speed feels consistent.
  const duration = Math.max(18, entries.length * 6);
  const loop = [...entries, ...entries];

  const Row = ({ e }: { e: TickerEntry }) => (
    <div className="flex shrink-0 items-center gap-2.5 px-5">
      <span className="tnum font-mono text-[12px] tracking-wider text-accent">{e.sym}</span>
      <span className="max-w-[220px] truncate text-[13px] text-white/75">{e.title}</span>
      <span className="flex items-center gap-0.5 text-[11px] text-white/35">
        <ArrowUpRight size={11} />
        {e.delta}
      </span>
      <span className="ml-2 h-3 w-px bg-white/10" />
    </div>
  );

  if (reduceMotion) {
    return (
      <div className="scroll-region flex items-center gap-1 overflow-x-auto py-2">
        {entries.map((e) => (
          <Row key={e.id} e={e} />
        ))}
      </div>
    );
  }

  return (
    <div className="group relative overflow-hidden py-2">
      {/* edge fades */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-ink-100 to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-ink-100 to-transparent" />
      <div
        className="ticker-track flex w-max group-hover:[animation-play-state:paused]"
        style={{ ['--ticker-duration' as string]: `${duration}s` }}
      >
        {loop.map((e, i) => (
          <Row key={`${e.id}-${i}`} e={e} />
        ))}
      </div>
    </div>
  );
}
