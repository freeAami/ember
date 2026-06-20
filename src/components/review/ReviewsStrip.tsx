import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { useReviews } from '@/hooks/useSelectors';
import { useUI } from '@/store/useUI';
import { weekLabel } from './reviewFormat';

/** A compact, horizontally-scannable list of past weekly reviews. */
export function ReviewsStrip() {
  const reviews = useReviews();
  const openReview = useUI((s) => s.openReview);

  if (reviews.length === 0) return null;

  return (
    <div className="mt-6">
      <div className="mb-2 text-[12px] uppercase tracking-wider text-white/30">Weekly reviews</div>
      <div className="scroll-region flex gap-2.5 overflow-x-auto pb-1">
        {reviews.map((r) => (
          <motion.button
            key={r.weekStart}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => openReview(r.weekStart)}
            className="glass sheen flex min-w-[180px] shrink-0 items-center justify-between gap-3 rounded-xl px-4 py-3 text-left"
          >
            <div>
              <div className="text-[13px] font-medium text-white/85">{weekLabel(r)}</div>
              <div className="mt-0.5 text-[12px] text-white/40">
                {Math.round(r.completionRate * 100)}% · {r.goalsFinished} done
              </div>
            </div>
            <ChevronRight size={15} className="text-white/30" />
          </motion.button>
        ))}
      </div>
    </div>
  );
}
