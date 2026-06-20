import { motion } from 'framer-motion';
import { Archive, BarChart3, Command, Home, Moon, Settings as SettingsIcon, Target } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useUI, type View } from '@/store/useUI';
import { EmberMark } from './Brand';
import { cn } from '@/lib/cn';

interface NavItem {
  view: View;
  icon: LucideIcon;
  label: string;
}

const NAV: NavItem[] = [
  { view: 'today', icon: Home, label: 'Today' },
  { view: 'analytics', icon: BarChart3, label: 'Analytics' },
  { view: 'archive', icon: Archive, label: 'Archive' },
  { view: 'settings', icon: SettingsIcon, label: 'Settings' },
];

export function Dock() {
  const view = useUI((s) => s.view);
  const setView = useUI((s) => s.setView);
  const toggleCommand = useUI((s) => s.toggleCommand);
  const enterFocus = useUI((s) => s.enterFocus);
  const setPlanningOpen = useUI((s) => s.setPlanningOpen);

  return (
    <nav
      className={cn(
        'z-40 flex shrink-0 items-center gap-1 bg-ink-100/70 backdrop-blur-xl',
        // mobile: bottom bar
        'fixed inset-x-0 bottom-0 justify-around border-t border-white/[0.06] px-2 py-2',
        // desktop: left rail
        'sm:static sm:h-full sm:w-[64px] sm:flex-col sm:justify-start sm:gap-2 sm:border-r sm:border-t-0 sm:px-0 sm:py-5',
      )}
    >
      <div className="mb-1 hidden sm:grid sm:place-items-center sm:pb-2">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-accent/12">
          <EmberMark />
        </div>
      </div>

      {NAV.map((item) => {
        const active = view === item.view;
        return (
          <DockButton key={item.view} label={item.label} active={active} onClick={() => setView(item.view)}>
            <item.icon size={20} />
            {active && (
              <motion.span
                layoutId="dock-active"
                className="absolute inset-0 -z-10 rounded-xl bg-white/[0.07]"
                transition={{ type: 'spring', stiffness: 400, damping: 32 }}
              />
            )}
          </DockButton>
        );
      })}

      <div className="hidden h-px w-7 bg-white/10 sm:my-1.5 sm:block" />

      <DockButton label="Focus" onClick={() => enterFocus()}>
        <Target size={20} />
      </DockButton>
      <DockButton label="Plan tomorrow" onClick={() => setPlanningOpen(true)}>
        <Moon size={20} />
      </DockButton>
      <DockButton label="Command (⌘K)" onClick={toggleCommand}>
        <Command size={20} />
      </DockButton>
    </nav>
  );
}

function DockButton({
  children,
  onClick,
  label,
  active,
}: {
  children: React.ReactNode;
  onClick: () => void;
  label: string;
  active?: boolean;
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      title={label}
      aria-label={label}
      className={cn(
        'relative grid h-11 w-11 place-items-center rounded-xl transition-colors',
        active ? 'text-accent' : 'text-white/45 hover:text-white/80',
      )}
    >
      {children}
    </motion.button>
  );
}
