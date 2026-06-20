import { motion } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { greetingFor, prettyDate } from '@/lib/date';
import { useTodayKey } from '@/hooks/useSelectors';

export function Greeting({ now }: { now: Date }) {
  const name = useStore((s) => s.settings.name);
  const today = useTodayKey();

  const container = {
    hidden: {},
    show: { transition: { staggerChildren: 0.06 } },
  };
  const line = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 30 } },
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show">
      <motion.p variants={line} className="text-[13px] font-medium uppercase tracking-[0.18em] text-accent/80">
        {prettyDate(today)}
      </motion.p>
      <motion.h1
        variants={line}
        className="mt-1 text-3xl font-semibold tracking-tightest text-white sm:text-[34px]"
      >
        {greetingFor(now)}
        {name ? <span className="text-white/45">, {name}</span> : null}
      </motion.h1>
    </motion.div>
  );
}
