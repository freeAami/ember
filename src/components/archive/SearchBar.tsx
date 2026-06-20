import { forwardRef } from 'react';
import { Search, X } from 'lucide-react';
import { useCategories } from '@/hooks/useSelectors';
import type { SearchFilters, StatusFilter } from '@/lib/search';
import { cn } from '@/lib/cn';

interface SearchBarProps {
  filters: SearchFilters;
  onChange: (next: SearchFilters) => void;
}

const STATUSES: Array<{ id: StatusFilter; label: string }> = [
  { id: 'all', label: 'All' },
  { id: 'done', label: 'Completed' },
  { id: 'open', label: 'Unfinished' },
];

export const SearchBar = forwardRef<HTMLInputElement, SearchBarProps>(({ filters, onChange }, ref) => {
  const categories = useCategories();

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="flex flex-1 items-center gap-3 rounded-xl border border-white/[0.07] bg-white/[0.02] px-3.5 py-2.5 focus-within:border-accent/40">
        <Search size={17} className="text-white/35" />
        <input
          ref={ref}
          value={filters.query}
          onChange={(e) => onChange({ ...filters, query: e.target.value })}
          placeholder="Search every goal you've ever set…"
          className="flex-1 bg-transparent text-[15px] text-white placeholder:text-white/30 outline-none"
        />
        {filters.query && (
          <button
            onClick={() => onChange({ ...filters, query: '' })}
            className="grid h-6 w-6 place-items-center rounded-md text-white/35 hover:bg-white/5 hover:text-white"
          >
            <X size={14} />
          </button>
        )}
      </div>

      <div className="flex items-center gap-2">
        <select
          value={filters.category}
          onChange={(e) => onChange({ ...filters, category: e.target.value })}
          className="rounded-xl border border-white/10 bg-ink-200 px-3 py-2.5 text-[13px] text-white/80 outline-none focus:border-accent/40"
        >
          <option value="all" className="bg-ink-200">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id} className="bg-ink-200">
              {c.name}
            </option>
          ))}
        </select>

        <div className="flex rounded-xl border border-white/10 bg-white/[0.02] p-0.5">
          {STATUSES.map((s) => (
            <button
              key={s.id}
              onClick={() => onChange({ ...filters, status: s.id })}
              className={cn(
                'rounded-lg px-2.5 py-2 text-[12px] transition-colors',
                filters.status === s.id ? 'bg-accent/90 text-ink-50' : 'text-white/45 hover:text-white/75',
              )}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
});
SearchBar.displayName = 'SearchBar';
