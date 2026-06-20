import { useEffect, useRef, useState } from 'react';
import { Reorder, useDragControls, motion } from 'framer-motion';
import { GripVertical, Pencil, Target, Trash2, Check, X } from 'lucide-react';
import type { Goal } from '@/types';
import { useStore } from '@/store/useStore';
import { useUI } from '@/store/useUI';
import { cn } from '@/lib/cn';
import { Checkbox } from './Checkbox';
import { CategoryPicker } from './CategoryPicker';

interface GoalItemProps {
  goal: Goal;
  /** Whether the item participates in drag reordering. */
  draggable?: boolean;
}

export function GoalItem({ goal, draggable = true }: GoalItemProps) {
  const toggleGoal = useStore((s) => s.toggleGoal);
  const deleteGoal = useStore((s) => s.deleteGoal);
  const updateGoal = useStore((s) => s.updateGoal);
  const setGoalCategory = useStore((s) => s.setGoalCategory);
  const enterFocus = useUI((s) => s.enterFocus);

  const controls = useDragControls();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(goal.title);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editing]);

  const commit = () => {
    const v = draft.trim();
    if (v && v !== goal.title) updateGoal(goal.id, { title: v });
    else setDraft(goal.title);
    setEditing(false);
  };

  return (
    <Reorder.Item
      value={goal}
      dragListener={false}
      dragControls={controls}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -12, transition: { duration: 0.18 } }}
      transition={{ type: 'spring', stiffness: 500, damping: 40 }}
      className={cn(
        'group flex items-center gap-3 rounded-xl border border-transparent px-3 py-2.5',
        'transition-colors hover:border-white/[0.06] hover:bg-white/[0.025]',
      )}
    >
      {draggable && (
        <button
          aria-label="Drag to reorder"
          onPointerDown={(e) => controls.start(e)}
          className="cursor-grab text-white/20 opacity-0 transition-opacity group-hover:opacity-100 active:cursor-grabbing"
        >
          <GripVertical size={16} />
        </button>
      )}

      <Checkbox checked={goal.done} onChange={() => toggleGoal(goal.id)} label={goal.title} />

      {editing ? (
        <input
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') commit();
            if (e.key === 'Escape') {
              setDraft(goal.title);
              setEditing(false);
            }
          }}
          className="flex-1 bg-transparent text-[15px] text-white outline-none"
        />
      ) : (
        <button
          onDoubleClick={() => setEditing(true)}
          className={cn(
            'flex-1 text-left text-[15px] transition-colors',
            goal.done ? 'text-white/35 line-through' : 'text-white/90',
          )}
        >
          {goal.title}
        </button>
      )}

      {goal.category && !editing && (
        <div className="shrink-0">
          <CategoryPicker compact value={goal.category} onChange={(id) => setGoalCategory(goal.id, id)} />
        </div>
      )}

      <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
        {editing ? (
          <>
            <IconBtn label="Save" onClick={commit}>
              <Check size={15} />
            </IconBtn>
            <IconBtn
              label="Cancel"
              onClick={() => {
                setDraft(goal.title);
                setEditing(false);
              }}
            >
              <X size={15} />
            </IconBtn>
          </>
        ) : (
          <>
            {!goal.category && (
              <CategoryPicker compact value={goal.category} onChange={(id) => setGoalCategory(goal.id, id)} />
            )}
            {!goal.done && (
              <IconBtn label="Focus on this" onClick={() => enterFocus(goal.id)}>
                <Target size={15} />
              </IconBtn>
            )}
            <IconBtn label="Edit" onClick={() => setEditing(true)}>
              <Pencil size={15} />
            </IconBtn>
            <IconBtn label="Delete" danger onClick={() => deleteGoal(goal.id)}>
              <Trash2 size={15} />
            </IconBtn>
          </>
        )}
      </div>
    </Reorder.Item>
  );
}

function IconBtn({
  children,
  onClick,
  label,
  danger,
}: {
  children: React.ReactNode;
  onClick: () => void;
  label: string;
  danger?: boolean;
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      aria-label={label}
      title={label}
      onClick={onClick}
      className={cn(
        'grid h-7 w-7 place-items-center rounded-lg text-white/45 transition-colors',
        danger ? 'hover:bg-rose-500/10 hover:text-rose-300' : 'hover:bg-white/[0.06] hover:text-white/80',
      )}
    >
      {children}
    </motion.button>
  );
}
