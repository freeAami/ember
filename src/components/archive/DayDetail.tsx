import { AnimatePresence, motion } from 'framer-motion';
import { Check, Circle, Flame, X } from 'lucide-react';
import type { ArchivedDay, ArchivedGoal } from '@/types';
import { useCategories } from '@/hooks/useSelectors';
import { findCategory } from '@/lib/categories';
import { prettyDate } from '@/lib/date';
import { CategoryBadge } from '@/components/goals/CategoryBadge';

interface DayDetailProps {
  day: ArchivedDay | null;
  onClose: () => void;
}

export function DayDetail({ day, onClose }: DayDetailProps) {
  const categories = useCategories();

  return (
    <AnimatePresence>
      {day && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-[75] flex items-center justify-center bg-ink-0/60 px-4 backdrop-blur-sm"
        >
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
            className="glass sheen w-full max-w-lg overflow-hidden rounded-2xl shadow-lift"
          >
            <Header day={day} onClose={onClose} />
            <div className="scroll-region max-h-[60vh] overflow-y-auto px-5 py-4">
              <GoalGroup
                title="Completed"
                goals={day.goals.filter((g) => g.done)}
                categories={categories}
                done
              />
              <GoalGroup
                title="Unfinished"
                goals={day.goals.filter((g) => !g.done)}
                categories={categories}
              />
              {day.goals.length === 0 && (
                <p className="py-8 text-center text-sm text-white/30">No goals were set this day.</p>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Header({ day, onClose }: { day: ArchivedDay; onClose: () => void }) {
  const rate = day.total ? day.completed / day.total : 0;
  const cleared = day.total > 0 && day.completed >= day.total;
  return (
    <div className="flex items-start justify-between border-b border-white/[0.06] px-5 py-4">
      <div>
        <div className="flex items-center gap-2">
          <h3 className="text-[16px] font-medium text-white">{prettyDate(day.date)}</h3>
          {cleared && <Flame size={15} className="text-accent" fill="rgb(var(--accent))" />}
        </div>
        <p className="mt-0.5 text-[13px] text-white/45">
          {Math.round(rate * 100)}% · {day.completed} of {day.total} completed
        </p>
      </div>
      <button
        onClick={onClose}
        className="grid h-8 w-8 place-items-center rounded-lg text-white/40 hover:bg-white/5 hover:text-white"
      >
        <X size={16} />
      </button>
    </div>
  );
}

function GoalGroup({
  title,
  goals,
  categories,
  done,
}: {
  title: string;
  goals: ArchivedGoal[];
  categories: ReturnType<typeof useCategories>;
  done?: boolean;
}) {
  if (goals.length === 0) return null;
  return (
    <div className="mb-4 last:mb-0">
      <div className="mb-1.5 px-1 text-[11px] uppercase tracking-wider text-white/30">
        {title} · {goals.length}
      </div>
      <div className="flex flex-col gap-0.5">
        {goals.map((g) => (
          <div key={g.id} className="flex items-center gap-3 rounded-lg px-2 py-2">
            {done ? (
              <span className="grid h-5 w-5 place-items-center rounded-[6px] bg-accent/90">
                <Check size={13} className="text-ink-50" />
              </span>
            ) : (
              <Circle size={18} className="text-white/20" />
            )}
            <span className={done ? 'flex-1 text-[14px] text-white/45 line-through' : 'flex-1 text-[14px] text-white/85'}>
              {g.title}
            </span>
            <CategoryBadge category={findCategory(categories, g.category)} />
          </div>
        ))}
      </div>
    </div>
  );
}
