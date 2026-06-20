import { AnimatePresence, motion } from 'framer-motion';
import { Flame, Sparkles, Target, TrendingUp, X } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { useUI } from '@/store/useUI';
import { useCategories } from '@/hooks/useSelectors';
import { findCategory, iconFor } from '@/lib/categories';
import { shortWeekday } from '@/lib/date';
import { weekLabel, bestDayLabel, streakDeltaLabel } from './reviewFormat';

export function WeeklyReviewModal() {
  const week = useUI((s) => s.reviewWeek);
  const close = useUI((s) => s.closeReview);
  const review = useStore((s) => (week ? s.reviews[week] : undefined));
  const categories = useCategories();

  const open = !!week && !!review;
  const best = review ? bestDayLabel(review) : null;

  const cats = review
    ? Object.entries(review.categoryBreakdown)
        .map(([id, count]) => ({ cat: findCategory(categories, id), count }))
        .filter((x) => x.cat)
        .sort((a, b) => b.count - a.count)
    : [];
  const maxCat = Math.max(1, ...cats.map((c) => c.count));

  return (
    <AnimatePresence>
      {open && review && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={close}
          className="fixed inset-0 z-[78] flex items-center justify-center bg-ink-0/65 px-4 backdrop-blur-md"
        >
          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
            className="glass sheen w-full max-w-xl overflow-hidden rounded-2xl shadow-lift"
          >
            <div className="flex items-start justify-between border-b border-white/[0.06] px-6 py-5">
              <div>
                <div className="flex items-center gap-2 text-accent/80">
                  <Sparkles size={14} />
                  <span className="text-[12px] uppercase tracking-[0.18em]">Weekly review</span>
                </div>
                <h3 className="mt-1 text-xl font-semibold tracking-tightest text-white">{weekLabel(review)}</h3>
              </div>
              <button
                onClick={close}
                className="grid h-8 w-8 place-items-center rounded-lg text-white/40 hover:bg-white/5 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            <div className="scroll-region max-h-[68vh] overflow-y-auto px-6 py-5">
              {/* headline */}
              <p className="text-[15px] leading-relaxed text-white/70">
                You completed{' '}
                <span className="font-semibold text-white">{review.goalsFinished} goals</span> at a{' '}
                <span className="font-semibold text-white">{Math.round(review.completionRate * 100)}%</span>{' '}
                completion rate.{best ? ` ${best} was your strongest day.` : ''}
              </p>

              {/* stat grid */}
              <div className="mt-5 grid grid-cols-3 gap-3">
                <Stat icon={TrendingUp} label="Completion" value={`${Math.round(review.completionRate * 100)}%`} />
                <Stat icon={Target} label="Goals" value={`${review.goalsFinished}`} />
                <Stat icon={Flame} label="Streak" value={`${review.currentStreak}d`} sub={streakDeltaLabel(review.streakDelta)} />
              </div>

              {/* daily completion */}
              <Section title="Daily completion">
                <div className="flex items-end gap-2">
                  {review.daily.map((d) => (
                    <div key={d.date} className="flex flex-1 flex-col items-center gap-1.5">
                      <div className="flex h-24 w-full items-end overflow-hidden rounded-lg bg-white/[0.04]">
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: `${d.total ? Math.max(d.rate * 100, 6) : 0}%` }}
                          transition={{ type: 'spring', stiffness: 120, damping: 20 }}
                          className="w-full rounded-lg bg-accent"
                          style={{ opacity: d.total ? 0.9 : 0.12 }}
                        />
                      </div>
                      <span className="text-[10px] text-white/35">{shortWeekday(d.date)}</span>
                    </div>
                  ))}
                </div>
              </Section>

              {/* category distribution */}
              {cats.length > 0 && (
                <Section title="Category breakdown">
                  <div className="flex flex-col gap-2.5">
                    {cats.map(({ cat, count }) => {
                      const Icon = iconFor(cat!.icon);
                      return (
                        <div key={cat!.id} className="flex items-center gap-3">
                          <span
                            className="grid h-6 w-6 shrink-0 place-items-center rounded-md"
                            style={{ background: `rgb(${cat!.color} / 0.16)`, color: `rgb(${cat!.color})` }}
                          >
                            <Icon size={12} />
                          </span>
                          <span className="w-20 shrink-0 text-[13px] text-white/70">{cat!.name}</span>
                          <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/[0.05]">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${(count / maxCat) * 100}%` }}
                              transition={{ type: 'spring', stiffness: 120, damping: 22 }}
                              className="h-full rounded-full"
                              style={{ background: `rgb(${cat!.color})` }}
                            />
                          </div>
                          <span className="tnum w-6 text-right text-[12px] text-white/45">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </Section>
              )}

              <p className="mt-6 text-center text-[12px] text-white/30">
                A week to learn from, not to judge. Onward.
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Stat({ icon: Icon, label, value, sub }: { icon: LucideIcon; label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
      <div className="flex items-center gap-1.5 text-white/40">
        <Icon size={13} className="text-accent" />
        <span className="text-[11px] uppercase tracking-wider">{label}</span>
      </div>
      <div className="mt-1.5 tnum text-xl font-semibold text-white">{value}</div>
      {sub && <div className="text-[11px] text-white/35">{sub}</div>}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-6">
      <div className="mb-2.5 text-[12px] uppercase tracking-wider text-white/30">{title}</div>
      {children}
    </div>
  );
}
