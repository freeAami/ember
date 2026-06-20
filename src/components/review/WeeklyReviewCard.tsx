import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useLatestReview } from '@/hooks/useSelectors';
import { useUI } from '@/store/useUI';
import { shortWeekday } from '@/lib/date';
import { Surface } from '@/components/ui/Surface';
import { weekLabel, bestDayLabel } from './reviewFormat';

/** Surfaces the most recent weekly review on the dashboard. */
export function WeeklyReviewCard() {
  const review = useLatestReview();
  const openReview = useUI((s) => s.openReview);
  if (!review) return null;

  const best = bestDayLabel(review);

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
      <Surface className="p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-white/45">
            <Sparkles size={14} className="text-accent" />
            <span className="text-[12px] uppercase tracking-wider">Last week</span>
          </div>
          <span className="text-[12px] text-white/35">{weekLabel(review)}</span>
        </div>

        <div className="mt-4 flex items-end justify-between">
          <div className="flex items-baseline gap-1 tnum">
            <span className="text-4xl font-semibold tracking-tightest text-white">
              {Math.round(review.completionRate * 100)}
            </span>
            <span className="text-xl font-light text-white/45">%</span>
          </div>
          <div className="flex flex-col items-end text-[12px] text-white/45">
            <span>
              <span className="tnum text-white/75">{review.goalsFinished}</span> goals finished
            </span>
            {best && (
              <span>
                <span className="text-white/75">{best}</span> was strongest
              </span>
            )}
          </div>
        </div>

        {/* mini daily bars */}
        <div className="mt-4 flex items-end gap-1.5">
          {review.daily.map((d) => (
            <div key={d.date} className="flex flex-1 flex-col items-center gap-1">
              <div className="flex h-12 w-full items-end overflow-hidden rounded-md bg-white/[0.04]">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${Math.max(d.total ? d.rate * 100 : 0, d.total ? 6 : 0)}%` }}
                  transition={{ type: 'spring', stiffness: 120, damping: 20 }}
                  className="w-full rounded-md bg-accent"
                  style={{ opacity: d.total ? 0.9 : 0.15 }}
                />
              </div>
              <span className="text-[10px] text-white/30">{shortWeekday(d.date)[0]}</span>
            </div>
          ))}
        </div>

        <button
          onClick={() => openReview(review.weekStart)}
          className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-lg border border-white/10 py-2 text-[13px] text-white/70 transition-colors hover:bg-white/[0.04] hover:text-white"
        >
          Open review <ArrowRight size={14} />
        </button>
      </Surface>
    </motion.div>
  );
}
