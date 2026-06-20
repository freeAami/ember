import { motion } from 'framer-motion';
import { AnimatedNumber } from '@/components/ui/AnimatedNumber';
import { ringColor } from '@/lib/accents';

interface DayRingProps {
  /** Fraction of the logical day elapsed (0–1). */
  dayPct: number;
  /** Fraction of today's goals completed (0–1). */
  completionPct: number;
  total: number;
  done: number;
  size?: number;
}

/**
 * Goal completion is the hero: a bold accent ring whose fill matches the % in
 * the center. The day-elapsed indicator is a quiet, thin inner arc (its hue
 * cooling from dawn ember to dusk blue) — a hint, never competing with the
 * completion reading.
 */
export function DayRing({ dayPct, completionPct, total, done, size = 240 }: DayRingProps) {
  const center = size / 2;
  const compStroke = 14;
  const dayStroke = 5;
  const rComp = (size - compStroke) / 2;
  const rDay = rComp - compStroke / 2 - 12 - dayStroke / 2;
  const cComp = 2 * Math.PI * rComp;
  const cDay = 2 * Math.PI * rDay;
  const dayColor = ringColor(dayPct);

  return (
    <div className="relative inline-grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        {/* tracks */}
        <circle cx={center} cy={center} r={rComp} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={compStroke} />
        <circle cx={center} cy={center} r={rDay} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth={dayStroke} />

        {/* completion arc — primary */}
        <motion.circle
          cx={center}
          cy={center}
          r={rComp}
          fill="none"
          stroke="rgb(var(--accent))"
          strokeWidth={compStroke}
          strokeLinecap="round"
          strokeDasharray={cComp}
          initial={{ strokeDashoffset: cComp }}
          animate={{ strokeDashoffset: cComp * (1 - completionPct) }}
          transition={{ type: 'spring', stiffness: 90, damping: 20 }}
          style={{ filter: 'drop-shadow(0 0 12px rgb(var(--accent) / 0.55))' }}
        />

        {/* day-elapsed arc — subtle hint */}
        <motion.circle
          cx={center}
          cy={center}
          r={rDay}
          fill="none"
          stroke={dayColor}
          strokeWidth={dayStroke}
          strokeLinecap="round"
          strokeDasharray={cDay}
          initial={{ strokeDashoffset: cDay }}
          animate={{ strokeDashoffset: cDay * (1 - dayPct) }}
          transition={{ type: 'spring', stiffness: 80, damping: 20 }}
          style={{ opacity: 0.5 }}
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="flex items-baseline tnum text-white">
          <AnimatedNumber value={Math.round(completionPct * 100)} className="text-5xl font-semibold tracking-tightest" />
          <span className="ml-0.5 text-2xl font-light text-white/50">%</span>
        </div>
        <div className="mt-1 text-[13px] text-white/45">
          {done} of {total} done
        </div>
        <div className="mt-2 flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-white/30">
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: dayColor }} />
          {Math.round(dayPct * 100)}% of day
        </div>
      </div>
    </div>
  );
}
