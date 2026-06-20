import { motion } from 'framer-motion';
import { Eraser } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { useClock } from '@/hooks/useClock';
import { useDayProgress, useGoalsForDate, useTodayKey } from '@/hooks/useSelectors';
import { dayProgress } from '@/lib/date';
import { Surface } from '@/components/ui/Surface';
import { Greeting } from './Greeting';
import { DayRing } from './DayRing';
import { StreakBadge } from './StreakBadge';
import { GoalTicker } from './GoalTicker';
import { QuickAdd } from '@/components/goals/QuickAdd';
import { GoalList } from '@/components/goals/GoalList';
import { WeeklyReviewCard } from '@/components/review/WeeklyReviewCard';

export function TodayView() {
  const now = useClock();
  const today = useTodayKey();
  const goals = useGoalsForDate(today);
  const { total, done, pct } = useDayProgress(today);
  const dayStartHour = useStore((s) => s.settings.dayStartHour);
  const clearCompleted = useStore((s) => s.clearCompleted);
  const hasDone = goals.some((g) => g.done);

  const dpct = dayProgress(dayStartHour, now);

  return (
    <div className="mx-auto w-full max-w-5xl">
      <Greeting now={now} />

      <div className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-[1fr_340px]">
        {/* Working column */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <Surface className="p-5">
            <div className="mb-4 flex items-center justify-between px-1">
              <div className="flex items-baseline gap-2">
                <h2 className="text-[15px] font-medium text-white/90">Goals</h2>
                <span className="tnum text-[13px] text-white/35">
                  {done}/{total}
                </span>
              </div>
              {hasDone && (
                <button
                  onClick={() => clearCompleted(today)}
                  className="flex items-center gap-1.5 text-[12px] text-white/35 transition-colors hover:text-white/70"
                >
                  <Eraser size={13} /> Clear done
                </button>
              )}
            </div>
            <QuickAdd date={today} globalFocus />
            <div className="mt-2">
              <GoalList date={today} goals={goals} emptyHint="A clear board. Add your first goal — press N." />
            </div>
          </Surface>
        </motion.div>

        {/* Pulse column */}
        <div className="flex flex-col gap-5">
          <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}>
            <Surface className="flex flex-col items-center gap-5 p-6">
              <DayRing dayPct={dpct} completionPct={pct} total={total} done={done} />
              <div className="w-full border-t border-white/[0.06] pt-5">
                <StreakBadge />
              </div>
            </Surface>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }}>
            <Surface className="overflow-hidden p-3">
              <div className="mb-1 flex items-center justify-between px-2">
                <span className="text-[12px] uppercase tracking-wider text-white/40">Open goals</span>
              </div>
              <GoalTicker goals={goals} />
            </Surface>
          </motion.div>

          <WeeklyReviewCard />
        </div>
      </div>
    </div>
  );
}
