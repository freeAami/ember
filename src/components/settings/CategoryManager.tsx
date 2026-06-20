import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus, Trash2 } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { useCategories } from '@/hooks/useSelectors';
import { CATEGORY_COLORS, ICON_KEYS, iconFor } from '@/lib/categories';

export function CategoryManager() {
  const categories = useCategories();
  const addCategory = useStore((s) => s.addCategory);
  const updateCategory = useStore((s) => s.updateCategory);
  const deleteCategory = useStore((s) => s.deleteCategory);
  const [draft, setDraft] = useState('');

  const cycleIcon = (id: string, icon: string) => {
    const next = ICON_KEYS[(ICON_KEYS.indexOf(icon) + 1) % ICON_KEYS.length];
    updateCategory(id, { icon: next });
  };
  const cycleColor = (id: string, color: string) => {
    const next = CATEGORY_COLORS[(CATEGORY_COLORS.indexOf(color) + 1) % CATEGORY_COLORS.length];
    updateCategory(id, { color: next });
  };

  return (
    <div className="flex flex-col gap-2">
      <p className="mb-1 text-[12px] text-white/40">
        Tap the glyph or dot to cycle. Categories appear on goals, in analytics, and across the
        archive.
      </p>

      <AnimatePresence initial={false}>
        {categories.map((c) => {
          const Icon = iconFor(c.icon);
          return (
            <motion.div
              key={c.id}
              layout
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -8 }}
              className="flex items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.02] px-2.5 py-2"
            >
              <button
                onClick={() => cycleIcon(c.id, c.icon)}
                title="Change icon"
                className="grid h-8 w-8 place-items-center rounded-lg"
                style={{ background: `rgb(${c.color} / 0.16)`, color: `rgb(${c.color})` }}
              >
                <Icon size={15} />
              </button>
              <button
                onClick={() => cycleColor(c.id, c.color)}
                title="Change color"
                className="h-5 w-5 shrink-0 rounded-full ring-1 ring-white/10"
                style={{ background: `rgb(${c.color})` }}
              />
              <input
                value={c.name}
                onChange={(e) => updateCategory(c.id, { name: e.target.value })}
                className="flex-1 bg-transparent text-[14px] text-white/85 outline-none"
              />
              <button
                onClick={() => deleteCategory(c.id)}
                title="Delete category"
                className="grid h-8 w-8 place-items-center rounded-lg text-white/35 hover:bg-rose-500/10 hover:text-rose-300"
              >
                <Trash2 size={15} />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>

      <div className="mt-1 flex items-center gap-2 rounded-xl border border-dashed border-white/10 px-2.5 py-2">
        <span className="grid h-8 w-8 place-items-center rounded-lg text-white/30">
          <Plus size={16} />
        </span>
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && draft.trim()) {
              addCategory(draft);
              setDraft('');
            }
          }}
          placeholder="New category…"
          className="flex-1 bg-transparent text-[14px] text-white placeholder:text-white/30 outline-none"
        />
        <button
          onClick={() => {
            if (draft.trim()) {
              addCategory(draft);
              setDraft('');
            }
          }}
          disabled={!draft.trim()}
          className="rounded-lg bg-accent/90 px-3 py-1.5 text-[13px] font-medium text-ink-50 disabled:opacity-30"
        >
          Add
        </button>
      </div>
    </div>
  );
}
