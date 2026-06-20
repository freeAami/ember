import { AnimatePresence, motion } from 'framer-motion';
import { Moon, X } from 'lucide-react';
import { useUI } from '@/store/useUI';
import { useGoalsForDate, useTomorrowKey } from '@/hooks/useSelectors';
import { prettyDate } from '@/lib/date';
import { QuickAdd } from './QuickAdd';
import { GoalList } from './GoalList';

export function PlanningPanel() {
  const open = useUI((s) => s.planningOpen);
  const setOpen = useUI((s) => s.setPlanningOpen);
  const tomorrow = useTomorrowKey();
  const goals = useGoalsForDate(tomorrow);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[65] flex justify-end bg-ink-0/50 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 36 }}
            onClick={(e) => e.stopPropagation()}
            className="glass flex h-full w-full max-w-md flex-col border-l border-white/[0.07]"
          >
            <div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="grid h-9 w-9 place-items-center rounded-xl bg-accent/15 text-accent">
                  <Moon size={17} />
                </div>
                <div>
                  <h3 className="text-[15px] font-medium text-white">Plan tomorrow</h3>
                  <p className="text-[12px] text-white/40">{prettyDate(tomorrow)}</p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="grid h-8 w-8 place-items-center rounded-lg text-white/40 hover:bg-white/5 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            <div className="px-6 py-5">
              <QuickAdd date={tomorrow} placeholder="What matters tomorrow?" />
            </div>

            <div className="scroll-region flex-1 px-4 pb-6">
              <GoalList date={tomorrow} goals={goals} emptyHint="Set tomorrow's intentions tonight." />
            </div>

            <div className="border-t border-white/[0.06] px-6 py-4 text-[12px] text-white/35">
              Anything unfinished today rolls into tomorrow automatically.
            </div>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
