import { motion } from 'framer-motion';

export function EmberMark({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 2c1.5 3 4 4.5 4 8a4 4 0 11-8 0c0-1 .3-1.8.7-2.5C9 9 9.5 10 11 10.5 10 8 11 4.5 12 2z"
        fill="rgb(var(--accent))"
      />
    </svg>
  );
}

export function Brand() {
  return (
    <div className="flex items-center gap-2.5">
      <motion.div
        initial={{ rotate: -8, opacity: 0 }}
        animate={{ rotate: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 18 }}
        className="grid h-9 w-9 place-items-center rounded-xl bg-accent/12"
      >
        <EmberMark />
      </motion.div>
      <span className="text-[15px] font-semibold tracking-tight text-white">Ember</span>
    </div>
  );
}
