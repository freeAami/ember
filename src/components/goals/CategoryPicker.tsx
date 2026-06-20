import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Tag, X } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { useCategories, useCategory } from '@/hooks/useSelectors';
import { iconFor } from '@/lib/categories';
import { CategoryBadge } from './CategoryBadge';
import { cn } from '@/lib/cn';

interface CategoryPickerProps {
  value?: string;
  onChange: (id?: string) => void;
  /** Compact trigger for inline use on goal rows. */
  compact?: boolean;
}

export function CategoryPicker({ value, onChange, compact }: CategoryPickerProps) {
  const categories = useCategories();
  const current = useCategory(value);
  const addCategory = useStore((s) => s.addCategory);
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener('mousedown', onDown);
    return () => window.removeEventListener('mousedown', onDown);
  }, [open]);

  const create = () => {
    const name = creating.trim();
    if (!name) return;
    const id = addCategory(name);
    onChange(id);
    setCreating('');
    setOpen(false);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        aria-label="Set category"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          'inline-flex items-center gap-1.5 rounded-full transition-colors',
          current
            ? ''
            : compact
              ? 'h-7 w-7 justify-center text-white/35 hover:bg-white/[0.06] hover:text-white/70'
              : 'border border-white/10 px-2.5 py-1 text-[12px] text-white/55 hover:border-white/20 hover:text-white/80',
        )}
      >
        {current ? (
          <CategoryBadge category={current} />
        ) : (
          <>
            <Tag size={compact ? 14 : 13} />
            {!compact && 'Category'}
          </>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 420, damping: 30 }}
            className="glass sheen absolute right-0 z-50 mt-2 w-52 overflow-hidden rounded-xl p-1.5 shadow-lift"
          >
            <button
              onClick={() => {
                onChange(undefined);
                setOpen(false);
              }}
              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-[13px] text-white/55 hover:bg-white/[0.05]"
            >
              <X size={14} /> No category
              {!value && <Check size={14} className="ml-auto text-accent" />}
            </button>
            <div className="my-1 h-px bg-white/[0.06]" />
            <div className="max-h-56 overflow-y-auto scroll-region">
              {categories.map((c) => {
                const Icon = iconFor(c.icon);
                return (
                  <button
                    key={c.id}
                    onClick={() => {
                      onChange(c.id);
                      setOpen(false);
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-[13px] text-white/80 hover:bg-white/[0.05]"
                  >
                    <span
                      className="grid h-5 w-5 place-items-center rounded-md"
                      style={{ background: `rgb(${c.color} / 0.16)`, color: `rgb(${c.color})` }}
                    >
                      <Icon size={12} />
                    </span>
                    {c.name}
                    {value === c.id && <Check size={14} className="ml-auto text-accent" />}
                  </button>
                );
              })}
            </div>
            <div className="my-1 h-px bg-white/[0.06]" />
            <div className="flex items-center gap-1.5 px-1 py-0.5">
              <input
                value={creating}
                onChange={(e) => setCreating(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && create()}
                placeholder="New category…"
                className="flex-1 bg-transparent px-1.5 py-1 text-[13px] text-white placeholder:text-white/30 outline-none"
              />
              <button
                onClick={create}
                disabled={!creating.trim()}
                className="rounded-md bg-accent/90 px-2 py-1 text-[12px] font-medium text-ink-50 disabled:opacity-30"
              >
                Add
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
