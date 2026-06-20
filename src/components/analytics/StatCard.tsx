import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { Surface } from '@/components/ui/Surface';

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  sub?: string;
  delay?: number;
}

export function StatCard({ icon: Icon, label, value, sub, delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, type: 'spring', stiffness: 280, damping: 28 }}
    >
      <Surface className="flex flex-col gap-3 p-5">
        <div className="flex items-center gap-2 text-white/45">
          <Icon size={15} className="text-accent" />
          <span className="text-[12px] uppercase tracking-wider">{label}</span>
        </div>
        <div className="tnum text-3xl font-semibold tracking-tightest text-white">{value}</div>
        {sub && <div className="text-[12px] text-white/40">{sub}</div>}
      </Surface>
    </motion.div>
  );
}
