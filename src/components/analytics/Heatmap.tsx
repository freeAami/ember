import { useMemo } from 'react';
import { heatmapWeeks, type DayCell } from '@/lib/analytics';
import { prettyDate } from '@/lib/date';
import { useMergedHistory, useTodayKey } from '@/hooks/useSelectors';

const WEEKS = 22;

function level(cell: DayCell): number {
  if (cell.total === 0) return 0;
  if (cell.rate >= 1) return 4;
  if (cell.rate >= 0.66) return 3;
  if (cell.rate >= 0.33) return 2;
  return 1;
}

const FILLS = [
  'rgba(255,255,255,0.04)',
  'rgb(var(--accent) / 0.25)',
  'rgb(var(--accent) / 0.45)',
  'rgb(var(--accent) / 0.70)',
  'rgb(var(--accent) / 1)',
];

export function Heatmap() {
  const history = useMergedHistory();
  const today = useTodayKey();
  const cols = useMemo(() => heatmapWeeks(history, today, WEEKS), [history, today]);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-[3px] overflow-hidden">
        {cols.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-[3px]">
            {week.map((cell) => {
              const isFuture = cell.date > today;
              return (
                <div
                  key={cell.date}
                  title={
                    isFuture
                      ? prettyDate(cell.date)
                      : `${prettyDate(cell.date)} — ${cell.completed}/${cell.total} done`
                  }
                  className="h-[13px] w-[13px] rounded-[3px] transition-transform hover:scale-125"
                  style={{
                    background: isFuture ? 'transparent' : FILLS[level(cell)],
                    border: isFuture ? '1px dashed rgba(255,255,255,0.04)' : 'none',
                  }}
                />
              );
            })}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 self-end text-[11px] text-white/40">
        Less
        {FILLS.map((f, i) => (
          <span key={i} className="h-[11px] w-[11px] rounded-[3px]" style={{ background: f }} />
        ))}
        More
      </div>
    </div>
  );
}
