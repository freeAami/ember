import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { useCategories, useGoalsForDate, useTodayKey } from '@/hooks/useSelectors';
import { categoryStats } from '@/lib/analytics';
import { findCategory, iconFor } from '@/lib/categories';
import type { ArchivedDay } from '@/types';

export function CategoryAnalytics() {
  const archive = useStore((s) => s.archive);
  const categories = useCategories();
  const today = useTodayKey();
  const todayGoals = useGoalsForDate(today);

  const stats = useMemo(() => {
    // Fold today's live goals into the archive so stats are useful immediately.
    const merged: Record<string, ArchivedDay> = { ...archive };
    if (todayGoals.length) {
      merged[today] = {
        date: today,
        goals: todayGoals.map((g) => ({ id: g.id, title: g.title, done: g.done, category: g.category, order: g.order })),
        total: todayGoals.length,
        completed: todayGoals.filter((g) => g.done).length,
        categories: [],
      };
    }
    return categoryStats(merged, today, 90).filter((s) => findCategory(categories, s.id));
  }, [archive, todayGoals, today, categories]);

  if (stats.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-white/30">
        Tag a few goals with categories to see this come alive.
      </p>
    );
  }

  const max = Math.max(...stats.map((s) => s.completed), 1);
  const mostActive = findCategory(categories, stats[0].id);

  return (
    <div className="flex flex-col gap-4">
      {mostActive && (
        <p className="text-[13px] text-white/45">
          Most active:{' '}
          <span className="font-medium" style={{ color: `rgb(${mostActive.color})` }}>
            {mostActive.name}
          </span>{' '}
          — {stats[0].completed} goals closed.
        </p>
      )}
      <div className="flex flex-col gap-3">
        {stats.map((s, i) => {
          const cat = findCategory(categories, s.id)!;
          const Icon = iconFor(cat.icon);
          return (
            <div key={s.id} className="flex items-center gap-3">
              <span
                className="grid h-7 w-7 shrink-0 place-items-center rounded-lg"
                style={{ background: `rgb(${cat.color} / 0.14)`, color: `rgb(${cat.color})` }}
              >
                <Icon size={14} />
              </span>
              <div className="flex-1">
                <div className="mb-1 flex items-baseline justify-between text-[13px]">
                  <span className="text-white/80">{cat.name}</span>
                  <span className="tnum text-white/40">
                    {s.completed} done · {Math.round(s.rate * 100)}%
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-white/[0.05]">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(s.completed / max) * 100}%` }}
                    transition={{ delay: 0.05 * i, type: 'spring', stiffness: 120, damping: 22 }}
                    className="h-full rounded-full"
                    style={{ background: `rgb(${cat.color})` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
