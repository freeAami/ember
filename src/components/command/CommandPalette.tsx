import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Archive,
  BarChart3,
  CalendarDays,
  Download,
  Flame,
  Home,
  Moon,
  Palette,
  Plus,
  Search,
  Settings as SettingsIcon,
  Sparkles,
  Tag,
  Target,
  Upload,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { useUI } from '@/store/useUI';
import { ACCENT_LIST } from '@/lib/accents';
import { downloadJSON, pickJSON, timestampedName } from '@/lib/io';
import { Kbd } from '@/components/ui/Kbd';
import { cn } from '@/lib/cn';

interface Command {
  id: string;
  label: string;
  hint?: string;
  icon: LucideIcon;
  keywords?: string;
  section: 'Create' | 'Navigate' | 'Reflect' | 'Focus' | 'Data' | 'Theme';
  run: () => void;
}

export function CommandPalette() {
  const open = useUI((s) => s.commandOpen);
  const setOpen = useUI((s) => s.setCommandOpen);
  const setView = useUI((s) => s.setView);
  const enterFocus = useUI((s) => s.enterFocus);
  const setPlanningOpen = useUI((s) => s.setPlanningOpen);
  const openReview = useUI((s) => s.openReview);
  const notify = useUI((s) => s.notify);

  const addGoal = useStore((s) => s.addGoal);
  const exportData = useStore((s) => s.exportData);
  const importData = useStore((s) => s.importData);
  const setSettings = useStore((s) => s.setSettings);

  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const close = () => {
    setOpen(false);
    setQuery('');
    setActive(0);
  };

  const commands = useMemo<Command[]>(() => {
    const base: Command[] = [
      {
        id: 'new-goal',
        label: 'New goal',
        hint: 'N',
        icon: Plus,
        section: 'Create',
        keywords: 'add task create',
        run: () => {
          setView('today');
          close();
          setTimeout(() => window.dispatchEvent(new CustomEvent('ember:newgoal')), 60);
        },
      },
      {
        id: 'plan-tomorrow',
        label: 'Plan tomorrow',
        icon: Sparkles,
        section: 'Create',
        keywords: 'next day rollover',
        run: () => {
          setPlanningOpen(true);
          close();
        },
      },
      { id: 'nav-today', label: 'Jump to Today', hint: 'T', icon: Home, section: 'Navigate', keywords: 'go home', run: () => { setView('today'); close(); } },
      { id: 'nav-analytics', label: 'Go to Analytics', hint: 'A', icon: BarChart3, section: 'Navigate', run: () => { setView('analytics'); close(); } },
      { id: 'nav-archive', label: 'Open Archive', icon: Archive, section: 'Navigate', keywords: 'history past days', run: () => { setView('archive'); close(); } },
      { id: 'nav-settings', label: 'Go to Settings', hint: 'S', icon: SettingsIcon, section: 'Navigate', run: () => { setView('settings'); close(); } },
      {
        id: 'search-history',
        label: 'Search history',
        icon: Search,
        section: 'Navigate',
        keywords: 'find goals archive past',
        run: () => {
          setView('archive');
          close();
          setTimeout(() => window.dispatchEvent(new CustomEvent('ember:archivesearch')), 80);
        },
      },
      {
        id: 'filter-category',
        label: 'Filter by category',
        icon: Tag,
        section: 'Navigate',
        keywords: 'archive category tag',
        run: () => {
          setView('archive');
          close();
          setTimeout(() => window.dispatchEvent(new CustomEvent('ember:archivesearch')), 80);
        },
      },
      {
        id: 'weekly-review',
        label: 'Weekly review',
        icon: CalendarDays,
        section: 'Reflect',
        keywords: 'summary week recap',
        run: () => {
          const reviews = useStore.getState().reviews;
          const latest = Object.values(reviews).sort((a, b) => (a.weekStart < b.weekStart ? 1 : -1))[0];
          close();
          if (latest) openReview(latest.weekStart);
          else {
            setView('archive');
            notify('No weekly reviews yet');
          }
        },
      },
      {
        id: 'focus',
        label: 'Enter focus mode',
        hint: 'F',
        icon: Target,
        section: 'Focus',
        keywords: 'timer pomodoro deep work',
        run: () => { enterFocus(); close(); },
      },
      {
        id: 'reduce-motion',
        label: 'Toggle reduced motion',
        icon: Moon,
        section: 'Focus',
        run: () => {
          const next = !useStore.getState().settings.reduceMotion;
          setSettings({ reduceMotion: next });
          notify(next ? 'Reduced motion on' : 'Reduced motion off');
          close();
        },
      },
      {
        id: 'export',
        label: 'Export data',
        icon: Download,
        section: 'Data',
        keywords: 'backup json save',
        run: () => {
          downloadJSON(exportData(), timestampedName());
          notify('Backup exported');
          close();
        },
      },
      {
        id: 'import',
        label: 'Import backup',
        icon: Upload,
        section: 'Data',
        keywords: 'restore json load',
        run: async () => {
          close();
          const data = await pickJSON();
          if (data) {
            importData(data);
            notify('Backup restored');
          } else {
            notify('Could not read that file');
          }
        },
      },
    ];

    const themes: Command[] = ACCENT_LIST.map((a) => ({
      id: `accent-${a.name}`,
      label: `Accent — ${a.label}`,
      icon: a.name === 'ember' ? Flame : Palette,
      section: 'Theme',
      keywords: 'color theme',
      run: () => {
        setSettings({ accent: a.name });
        notify(`${a.label} accent`);
        close();
      },
    }));

    return [...base, ...themes];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = !q
      ? commands
      : commands.filter((c) => (c.label + ' ' + (c.keywords ?? '')).toLowerCase().includes(q));

    // Offer to create a goal directly from the query.
    if (q.length > 1) {
      list.unshift({
        id: 'quick-create',
        label: `Create goal “${query.trim()}”`,
        icon: Plus,
        section: 'Create',
        run: () => {
          addGoal(query.trim());
          setView('today');
          notify('Goal added');
          close();
        },
      });
    }
    return list;
  }, [query, commands, addGoal, setView, notify]);

  useEffect(() => setActive(0), [query]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 30);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActive((a) => Math.min(a + 1, filtered.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActive((a) => Math.max(a - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        filtered[active]?.run();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, filtered, active]);

  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-idx="${active}"]`);
    el?.scrollIntoView({ block: 'nearest' });
  }, [active]);

  // Group while preserving order.
  const groups = useMemo(() => {
    const map = new Map<string, { cmd: Command; idx: number }[]>();
    filtered.forEach((cmd, idx) => {
      const arr = map.get(cmd.section) ?? [];
      arr.push({ cmd, idx });
      map.set(cmd.section, arr);
    });
    return [...map.entries()];
  }, [filtered]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 z-[80] flex items-start justify-center bg-ink-0/60 px-4 pt-[12vh] backdrop-blur-sm"
          onClick={close}
        >
          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 360, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
            className="glass sheen w-full max-w-xl overflow-hidden rounded-2xl shadow-lift"
          >
            <div className="flex items-center gap-3 border-b border-white/[0.06] px-4">
              <Search size={17} className="text-white/35" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search actions, or type a goal…"
                className="h-14 flex-1 bg-transparent text-[15px] text-white placeholder:text-white/30 outline-none"
              />
              <Kbd>Esc</Kbd>
            </div>

            <div ref={listRef} className="scroll-region max-h-[52vh] py-2">
              {filtered.length === 0 && (
                <div className="px-4 py-10 text-center text-sm text-white/35">No matching actions</div>
              )}
              {groups.map(([section, items]) => (
                <div key={section} className="px-2 py-1">
                  <div className="px-3 py-1.5 text-[11px] uppercase tracking-wider text-white/30">{section}</div>
                  {items.map(({ cmd, idx }) => (
                    <button
                      key={cmd.id}
                      data-idx={idx}
                      onMouseEnter={() => setActive(idx)}
                      onClick={cmd.run}
                      className={cn(
                        'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors',
                        active === idx ? 'bg-accent/15 text-white' : 'text-white/70 hover:bg-white/[0.04]',
                      )}
                    >
                      <cmd.icon size={16} className={active === idx ? 'text-accent' : 'text-white/40'} />
                      <span className="flex-1 text-[14px]">{cmd.label}</span>
                      {cmd.hint && <Kbd>{cmd.hint}</Kbd>}
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
