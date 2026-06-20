import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus, CornerDownLeft } from 'lucide-react';
import type { DateKey } from '@/types';
import { useStore } from '@/store/useStore';
import { cn } from '@/lib/cn';
import { CategoryPicker } from './CategoryPicker';

interface QuickAddProps {
  date: DateKey;
  placeholder?: string;
  /** Listen for the global `n` hotkey to grab focus. */
  globalFocus?: boolean;
}

export function QuickAdd({ date, placeholder = 'Add a goal…', globalFocus }: QuickAddProps) {
  const addGoal = useStore((s) => s.addGoal);
  const [value, setValue] = useState('');
  const [category, setCategory] = useState<string | undefined>(undefined);
  const [focused, setFocused] = useState(false);
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!globalFocus) return;
    const onNew = () => ref.current?.focus();
    window.addEventListener('ember:newgoal', onNew);
    return () => window.removeEventListener('ember:newgoal', onNew);
  }, [globalFocus]);

  const submit = () => {
    if (!value.trim()) return;
    addGoal(value, date, category);
    setValue('');
    // Keep the chosen category as a sticky default for the next add.
  };

  const expanded = focused || value.trim().length > 0;

  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-xl border px-3 py-2.5 transition-colors',
        focused ? 'border-accent/40 bg-white/[0.03]' : 'border-white/[0.07] bg-white/[0.015]',
      )}
    >
      <motion.span
        animate={{
          rotate: focused ? 90 : 0,
          color: focused ? 'rgb(var(--accent))' : 'rgba(255,255,255,0.35)',
        }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      >
        <Plus size={18} />
      </motion.span>
      <input
        ref={ref}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onKeyDown={(e) => e.key === 'Enter' && submit()}
        placeholder={placeholder}
        className="flex-1 bg-transparent text-[15px] text-white placeholder:text-white/30 outline-none"
      />

      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <CategoryPicker value={category} onChange={setCategory} />
          </motion.div>
        )}
      </AnimatePresence>

      {value.trim() && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={submit}
          className="flex shrink-0 items-center gap-1.5 rounded-lg bg-accent/90 px-2.5 py-1 text-[12px] font-medium text-ink-50"
        >
          Add <CornerDownLeft size={12} />
        </motion.button>
      )}
    </div>
  );
}
