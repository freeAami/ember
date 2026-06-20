import { motion } from 'framer-motion';
import { Flame } from 'lucide-react';
import type { ArchivedDay } from '@/types';
import { useCategories } from '@/hooks/useSelectors';
import { findCategory } from '@/lib/categories';
import { shortWeekday, dayOfMonth } from '@/lib/date';
import { Surface } from '@/components/ui/Surface';

interface DayCardProps {
  day: ArchivedDay;
  onOpen: (day: ArchivedDay) => void;
  /** Optional override label (e.g. matched-goal count in search). */
  matchLabel?: string;
}

export function DayCard({ day, onOpen, matchLabel }: DayCardProps) {
  const categories = useCategories();
  const rate = day.total ? day.completed / day.total : 0;
  const cleared = day.total > 0 && day.completed >= day.total;
  const cats = day.categories.map((id) => findCategory(categories, id)).filter(Boolean);

  return (
    <motion.button
      layout
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onOpen(day)}
      className="text-left"
    >
      <Surface className="relative h-full p-4">
        <div className="flex items-start justify-between">
          <div className="leading-none">
            <div className="text-[11px] uppercase tracking-wider text-white/40">{shortWeekday(day.date)}</div>
            <div className="mt-1 text-2xl font-semibold tracking-tightest text-white">{dayOfMonth(day.date)}</div>
          </div>
          {cleared && <Flame size={15} className="text-accent" fill="rgb(var(--accent))" />}
        </div>

        <div className="mt-4 flex items-baseline gap-1.5">
          <span className="tnum text-lg font-semibold text-white/90">{Math.round(rate * 100)}%</span>
          <span className="text-[12px] text-white/35">· {day.completed}/{day.total}</span>
        </div>

        {/* completion meter */}
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/[0.05]">
          <div className="h-full rounded-full bg-accent" style={{ width: `${rate * 100}%` }} />
        </div>

        <div className="mt-3 flex flex-wrap gap-1">
          {matchLabel ? (
            <span className="text-[11px] text-accent/80">{matchLabel}</span>
          ) : (
            cats.slice(0, 4).map((c) => (
              <span key={c!.id} className="h-2 w-2 rounded-full" style={{ background: `rgb(${c!.color})` }} title={c!.name} />
            ))
          )}
        </div>
      </Surface>
    </motion.button>
  );
}
