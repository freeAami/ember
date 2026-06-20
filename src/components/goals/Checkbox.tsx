import { motion } from 'framer-motion';
import { cn } from '@/lib/cn';

interface CheckboxProps {
  checked: boolean;
  onChange: () => void;
  label?: string;
}

/** Custom check with a drawn-in tick and a soft accent fill. */
export function Checkbox({ checked, onChange, label }: CheckboxProps) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      className={cn(
        'relative grid h-[22px] w-[22px] shrink-0 place-items-center rounded-[7px] border transition-colors',
        checked
          ? 'border-accent bg-accent/90'
          : 'border-white/20 bg-white/[0.03] hover:border-white/40',
      )}
    >
      <motion.svg
        viewBox="0 0 24 24"
        width="14"
        height="14"
        fill="none"
        initial={false}
        animate={{ opacity: checked ? 1 : 0, scale: checked ? 1 : 0.6 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      >
        <motion.path
          d="M4 12.5l5 5L20 6.5"
          stroke="rgb(var(--bg))"
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={false}
          animate={{ pathLength: checked ? 1 : 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
        />
      </motion.svg>
    </button>
  );
}
