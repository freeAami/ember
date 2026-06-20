import { Reorder, AnimatePresence, motion } from 'framer-motion';
import type { DateKey, Goal } from '@/types';
import { useStore } from '@/store/useStore';
import { GoalItem } from './GoalItem';

interface GoalListProps {
  date: DateKey;
  goals: Goal[];
  emptyHint?: string;
}

export function GoalList({ date, goals, emptyHint = 'Nothing here yet.' }: GoalListProps) {
  const reorderForDate = useStore((s) => s.reorderForDate);

  if (goals.length === 0) {
    return (
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="px-3 py-8 text-center text-sm text-white/30"
      >
        {emptyHint}
      </motion.p>
    );
  }

  return (
    <Reorder.Group
      axis="y"
      values={goals}
      onReorder={(next) => reorderForDate(date, next.map((g) => g.id))}
      className="flex flex-col gap-0.5"
    >
      <AnimatePresence initial={false}>
        {goals.map((goal) => (
          <GoalItem key={goal.id} goal={goal} />
        ))}
      </AnimatePresence>
    </Reorder.Group>
  );
}
