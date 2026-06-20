import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { ACCENT_LIST } from '@/lib/accents';
import { cn } from '@/lib/cn';

export function Onboarding() {
  const completeOnboarding = useStore((s) => s.completeOnboarding);
  const settings = useStore((s) => s.settings);
  const setSettings = useStore((s) => s.setSettings);
  const [name, setName] = useState('');

  return (
    <div className="fixed inset-0 z-[90] grid place-items-center bg-ink-0 px-6">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 28 }}
        className="w-full max-w-md text-center"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 260, damping: 20 }}
          className="mx-auto mb-8 grid h-16 w-16 place-items-center rounded-2xl bg-accent/15 shadow-glow"
        >
          <EmberMark />
        </motion.div>

        <h1 className="text-3xl font-semibold tracking-tightest text-white">Welcome to Ember</h1>
        <p className="mx-auto mt-3 max-w-sm text-[15px] leading-relaxed text-white/50">
          A quiet place to set the day, do the work, and watch consistency build. No account. No cloud. Just you.
        </p>

        <div className="mt-10 text-left">
          <label className="block text-[12px] uppercase tracking-wider text-white/40">What should we call you?</label>
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && completeOnboarding(name)}
            placeholder="Your name (optional)"
            className="mt-2 w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-[15px] text-white placeholder:text-white/30 outline-none focus:border-accent/40"
          />

          <label className="mt-6 block text-[12px] uppercase tracking-wider text-white/40">Pick an accent</label>
          <div className="mt-3 flex flex-wrap gap-2.5">
            {ACCENT_LIST.map((a) => (
              <button
                key={a.name}
                onClick={() => setSettings({ accent: a.name })}
                aria-label={a.label}
                className={cn(
                  'h-8 w-8 rounded-full transition-transform',
                  settings.accent === a.name ? 'scale-110 ring-2 ring-white/60 ring-offset-2 ring-offset-ink-0' : 'hover:scale-105',
                )}
                style={{ background: `rgb(${a.accent})` }}
              />
            ))}
          </div>
        </div>

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => completeOnboarding(name)}
          className="mt-10 inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-3 font-medium text-ink-50 shadow-glow transition hover:brightness-110"
        >
          Begin <ArrowRight size={17} />
        </motion.button>
      </motion.div>
    </div>
  );
}

function EmberMark() {
  return (
    <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 2c1.5 3 4 4.5 4 8a4 4 0 11-8 0c0-1 .3-1.8.7-2.5C9 9 9.5 10 11 10.5 10 8 11 4.5 12 2z"
        fill="rgb(var(--accent))"
      />
    </svg>
  );
}
