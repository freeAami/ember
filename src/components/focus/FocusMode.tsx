import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Pause, Play, RotateCcw } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { useUI } from '@/store/useUI';
import { useGoalsForDate, useTodayKey } from '@/hooks/useSelectors';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { Kbd } from '@/components/ui/Kbd';
import { cn } from '@/lib/cn';

const PRESETS = [15, 25, 50] as const;

export function FocusMode() {
  const focusMode = useUI((s) => s.focusMode);
  const exitFocus = useUI((s) => s.exitFocus);
  const focusGoalId = useUI((s) => s.focusGoalId);
  const toggleGoal = useStore((s) => s.toggleGoal);

  const today = useTodayKey();
  const goals = useGoalsForDate(today);

  // The goal in focus: explicit selection, else first still-open goal.
  const goal = useMemo(() => {
    if (focusGoalId) return goals.find((g) => g.id === focusGoalId) ?? null;
    return goals.find((g) => !g.done) ?? null;
  }, [goals, focusGoalId]);

  const openCount = goals.filter((g) => !g.done).length;
  const doneCount = goals.length - openCount;

  const [minutes, setMinutes] = useState<number>(25);
  const [remaining, setRemaining] = useState(minutes * 60);
  const [running, setRunning] = useState(true);

  useEffect(() => setRemaining(minutes * 60), [minutes]);

  useEffect(() => {
    if (!focusMode || !running) return;
    const id = window.setInterval(() => {
      setRemaining((r) => (r > 0 ? r - 1 : 0));
    }, 1000);
    return () => window.clearInterval(id);
  }, [focusMode, running]);

  useEffect(() => {
    if (!focusMode) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') exitFocus();
      if (e.code === 'Space') {
        e.preventDefault();
        setRunning((r) => !r);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [focusMode, exitFocus]);

  const total = minutes * 60;
  const elapsed = total > 0 ? (total - remaining) / total : 0;
  const mm = String(Math.floor(remaining / 60)).padStart(2, '0');
  const ss = String(remaining % 60).padStart(2, '0');

  return (
    <AnimatePresence>
      {focusMode && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="fixed inset-0 z-[70] flex flex-col items-center justify-center bg-ink-0/95 backdrop-blur-2xl"
        >
          {/* breathing ambient glow */}
          <motion.div
            aria-hidden
            className="pointer-events-none absolute h-[520px] w-[520px] rounded-full"
            style={{ background: 'radial-gradient(circle, rgb(var(--accent) / 0.16), transparent 60%)' }}
            animate={{ scale: running ? [1, 1.08, 1] : 1, opacity: running ? [0.6, 0.9, 0.6] : 0.4 }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          />

          <button
            onClick={exitFocus}
            className="absolute right-6 top-6 flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-white/45 transition-colors hover:bg-white/5 hover:text-white"
          >
            Exit <Kbd>Esc</Kbd>
          </button>

          <motion.div
            initial={{ y: 20, opacity: 0, scale: 0.97 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 26 }}
            className="relative z-10 flex flex-col items-center"
          >
            <p className="mb-1 text-[12px] uppercase tracking-[0.25em] text-accent/70">In focus</p>
            <h2 className="mb-10 max-w-xl text-center text-2xl font-medium text-white/95">
              {goal ? goal.title : 'No open goals — rest well.'}
            </h2>

            <ProgressRing progress={elapsed} size={300} stroke={6} color="rgb(var(--accent))">
              <div className="flex flex-col items-center">
                <div className="tnum font-mono text-6xl font-light tracking-tight text-white">
                  {mm}:{ss}
                </div>
                <div className="mt-3 flex gap-1.5">
                  {PRESETS.map((m) => (
                    <button
                      key={m}
                      onClick={() => setMinutes(m)}
                      className={cn(
                        'rounded-full px-2.5 py-1 text-[11px] transition-colors',
                        minutes === m ? 'bg-accent/90 text-ink-50' : 'text-white/40 hover:bg-white/5 hover:text-white/70',
                      )}
                    >
                      {m}m
                    </button>
                  ))}
                </div>
              </div>
            </ProgressRing>

            <div className="mt-10 flex items-center gap-3">
              <ControlBtn label={running ? 'Pause' : 'Play'} onClick={() => setRunning((r) => !r)} primary>
                {running ? <Pause size={18} /> : <Play size={18} />}
              </ControlBtn>
              <ControlBtn label="Reset" onClick={() => setRemaining(minutes * 60)}>
                <RotateCcw size={17} />
              </ControlBtn>
              {goal && (
                <ControlBtn
                  label="Complete"
                  onClick={() => {
                    toggleGoal(goal.id);
                    setRemaining(minutes * 60);
                  }}
                >
                  <Check size={18} />
                </ControlBtn>
              )}
            </div>

            <div className="mt-10 flex items-center gap-2 text-[13px] text-white/35">
              <span className="tnum text-white/60">{doneCount}</span> done ·
              <span className="tnum text-white/60">{openCount}</span> remaining today
            </div>
            <p className="mt-2 text-[11px] text-white/25">
              <Kbd>Space</Kbd> play / pause
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ControlBtn({
  children,
  onClick,
  label,
  primary,
}: {
  children: React.ReactNode;
  onClick: () => void;
  label: string;
  primary?: boolean;
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.92 }}
      onClick={onClick}
      aria-label={label}
      title={label}
      className={cn(
        'grid place-items-center rounded-full transition-colors',
        primary
          ? 'h-14 w-14 bg-accent text-ink-50 shadow-glow hover:brightness-110'
          : 'h-12 w-12 border border-white/10 bg-white/[0.04] text-white/70 hover:bg-white/[0.08] hover:text-white',
      )}
    >
      {children}
    </motion.button>
  );
}
