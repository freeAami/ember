import { motion } from 'framer-motion';
import { Flame } from 'lucide-react';
import { useStreak } from '@/hooks/useSelectors';
import { cn } from '@/lib/cn';

export function StreakBadge() {
  const { current, longest, todayCleared } = useStreak();

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2.5">
        <motion.div
          animate={
            todayCleared
              ? { scale: [1, 1.18, 1], filter: ['drop-shadow(0 0 0px rgb(var(--accent)))', 'drop-shadow(0 0 12px rgb(var(--accent)))', 'drop-shadow(0 0 4px rgb(var(--accent)))'] }
              : {}
          }
          transition={{ duration: 1.4, repeat: todayCleared ? Infinity : 0, repeatDelay: 1.5 }}
        >
          <Flame
            size={22}
            className={cn(todayCleared ? 'text-accent' : 'text-white/25')}
            fill={todayCleared ? 'rgb(var(--accent))' : 'transparent'}
          />
        </motion.div>
        <div className="leading-none">
          <div className="tnum text-xl font-semibold text-white">{current}</div>
          <div className="mt-0.5 text-[11px] uppercase tracking-wider text-white/40">day streak</div>
        </div>
      </div>
      <div className="h-8 w-px bg-white/10" />
      <div className="leading-none">
        <div className="tnum text-xl font-semibold text-white/80">{longest}</div>
        <div className="mt-0.5 text-[11px] uppercase tracking-wider text-white/40">best</div>
      </div>
    </div>
  );
}
