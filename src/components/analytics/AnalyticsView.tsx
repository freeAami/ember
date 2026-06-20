import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { CalendarDays, CheckCircle2, Flame, TrendingUp } from 'lucide-react';
import { Surface } from '@/components/ui/Surface';
import { StatCard } from './StatCard';
import { WeeklyBars, TrendArea } from './Charts';
import { Heatmap } from './Heatmap';
import { CategoryAnalytics } from './CategoryAnalytics';
import { useMergedHistory, useStreak, useTodayKey } from '@/hooks/useSelectors';
import { averageRate, mostProductiveWeekday, rangeCells, totalCompleted } from '@/lib/analytics';

function Section({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <Surface className="p-6">
      <div className="mb-5 flex items-baseline justify-between">
        <h3 className="text-[15px] font-medium text-white/90">{title}</h3>
        {hint && <span className="text-[12px] text-white/35">{hint}</span>}
      </div>
      {children}
    </Surface>
  );
}

export function AnalyticsView() {
  const history = useMergedHistory();
  const today = useTodayKey();
  const streak = useStreak();

  const stats = useMemo(() => {
    const last30 = rangeCells(history, today, 30);
    const last90 = rangeCells(history, today, 90);
    return {
      avg: Math.round(averageRate(last30) * 100),
      completed90: totalCompleted(last90),
      best: mostProductiveWeekday(last90),
    };
  }, [history, today]);

  return (
    <div className="mx-auto w-full max-w-5xl">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-2xl font-semibold tracking-tightest text-white">Analytics</h2>
        <p className="mt-1 text-sm text-white/45">Your consistency, measured — never to shame, only to see.</p>
      </motion.div>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={TrendingUp} label="Avg completion" value={`${stats.avg}%`} sub="last 30 days" delay={0.02} />
        <StatCard icon={Flame} label="Current streak" value={`${streak.current}d`} sub={`best ${streak.longest} days`} delay={0.06} />
        <StatCard icon={CheckCircle2} label="Goals closed" value={`${stats.completed90}`} sub="last 90 days" delay={0.1} />
        <StatCard icon={CalendarDays} label="Best day" value={stats.best ?? '—'} sub="by completion rate" delay={0.14} />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Section title="This week" hint="completion %">
          <WeeklyBars />
        </Section>
        <Section title="Momentum" hint="last 30 days">
          <TrendArea days={30} />
        </Section>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Section title="By category" hint="last 90 days">
          <CategoryAnalytics />
        </Section>
        <Section title="Consistency" hint="last 22 weeks">
          <Heatmap />
        </Section>
      </div>
    </div>
  );
}
