import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Archive as ArchiveIcon, Flame } from 'lucide-react';
import type { ArchivedDay } from '@/types';
import { useStore } from '@/store/useStore';
import { useArchiveDays } from '@/hooks/useSelectors';
import { EMPTY_FILTERS, hasActiveFilters, searchDays, type SearchFilters } from '@/lib/search';
import { streakPeriods } from '@/lib/streak';
import { monthKey, monthLabel, shortDate } from '@/lib/date';
import { Surface } from '@/components/ui/Surface';
import { SearchBar } from './SearchBar';
import { DayCard } from './DayCard';
import { DayDetail } from './DayDetail';
import { ReviewsStrip } from '@/components/review/ReviewsStrip';

export function ArchiveView() {
  const days = useArchiveDays();
  const history = useStore((s) => s.history);
  const [filters, setFilters] = useState<SearchFilters>(EMPTY_FILTERS);
  const [selected, setSelected] = useState<ArchivedDay | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onSearch = () => searchRef.current?.focus();
    window.addEventListener('ember:archivesearch', onSearch);
    return () => window.removeEventListener('ember:archivesearch', onSearch);
  }, []);

  const active = hasActiveFilters(filters);
  const filtered = useMemo(() => searchDays(days, filters), [days, filters]);
  const periods = useMemo(() => streakPeriods(history).slice(0, 6), [history]);

  // Group browse-mode days by month, preserving newest-first order.
  const months = useMemo(() => {
    const map = new Map<string, ArchivedDay[]>();
    for (const d of filtered) {
      const k = monthKey(d.date);
      (map.get(k) ?? map.set(k, []).get(k)!).push(d);
    }
    return [...map.entries()];
  }, [filtered]);

  return (
    <div className="mx-auto w-full max-w-5xl">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-2xl font-semibold tracking-tightest text-white">Archive</h2>
        <p className="mt-1 text-sm text-white/45">
          Every day you've lived in Ember, kept for you. The longer you stay, the richer it gets.
        </p>
      </motion.div>

      <div className="mt-6">
        <SearchBar ref={searchRef} filters={filters} onChange={setFilters} />
      </div>

      {days.length === 0 ? (
        <Surface className="mt-6 flex flex-col items-center gap-3 px-6 py-16 text-center">
          <ArchiveIcon size={26} className="text-white/25" />
          <p className="text-[15px] text-white/55">Your archive is waiting.</p>
          <p className="max-w-sm text-[13px] text-white/35">
            As each day closes, Ember tucks it away here — searchable forever, entirely on your device.
          </p>
        </Surface>
      ) : (
        <>
          {!active && (
            <>
              <ReviewsStrip />

              {periods.length > 0 && (
                <div className="mt-6">
                  <div className="mb-2 text-[12px] uppercase tracking-wider text-white/30">Streak periods</div>
                  <div className="flex flex-wrap gap-2">
                    {periods.map((p) => (
                      <div
                        key={p.start}
                        className="glass flex items-center gap-2 rounded-full px-3 py-1.5 text-[12px]"
                      >
                        <Flame size={13} className="text-accent" fill="rgb(var(--accent))" />
                        <span className="text-white/70">
                          {shortDate(p.start)} – {shortDate(p.end)}
                        </span>
                        <span className="tnum text-white/40">{p.length}d</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {active && filtered.length === 0 && (
            <p className="mt-10 text-center text-sm text-white/35">No goals match your search.</p>
          )}

          {active ? (
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {filtered.map((d) => (
                <DayCard
                  key={d.date}
                  day={d}
                  onOpen={setSelected}
                  matchLabel={`${d.goals.length} match${d.goals.length === 1 ? '' : 'es'}`}
                />
              ))}
            </div>
          ) : (
            months.map(([k, list]) => (
              <div key={k} className="mt-8">
                <div className="mb-3 text-[13px] font-medium text-white/55">{monthLabel(`${k}-01`)}</div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                  {list.map((d) => (
                    <DayCard key={d.date} day={d} onOpen={setSelected} />
                  ))}
                </div>
              </div>
            ))
          )}
        </>
      )}

      <DayDetail day={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
