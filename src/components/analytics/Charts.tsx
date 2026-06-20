import { useMemo } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { DayCell } from '@/lib/analytics';
import { rangeCells } from '@/lib/analytics';
import { shortWeekday } from '@/lib/date';
import { useAccentColor } from '@/hooks/useAccent';
import { useMergedHistory, useTodayKey } from '@/hooks/useSelectors';

interface TipProps {
  active?: boolean;
  payload?: Array<{ payload: { label: string; value: number; sub?: string } }>;
}

function ChartTip({ active, payload }: TipProps) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="glass rounded-lg px-3 py-2 text-xs">
      <div className="font-medium text-white">{d.label}</div>
      <div className="mt-0.5 text-white/55">{d.sub ?? `${d.value}% complete`}</div>
    </div>
  );
}

export function WeeklyBars() {
  const history = useMergedHistory();
  const today = useTodayKey();
  const accent = useAccentColor();

  const data = useMemo(() => {
    const cells: DayCell[] = rangeCells(history, today, 7);
    return cells.map((c) => ({
      label: shortWeekday(c.date),
      value: Math.round(c.rate * 100),
      sub: `${c.completed}/${c.total} done`,
      active: c.total > 0,
    }));
  }, [history, today]);

  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={data} margin={{ top: 8, right: 4, left: -24, bottom: 0 }}>
        <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }} />
        <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 11 }} width={36} />
        <Tooltip cursor={{ fill: 'rgba(255,255,255,0.03)' }} content={<ChartTip />} />
        <Bar dataKey="value" radius={[6, 6, 6, 6]} maxBarSize={26} isAnimationActive>
          {data.map((d, i) => (
            <Cell key={i} fill={accent} fillOpacity={d.active ? 0.9 : 0.12} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function TrendArea({ days = 30 }: { days?: number }) {
  const history = useMergedHistory();
  const today = useTodayKey();
  const accent = useAccentColor();

  const data = useMemo(() => {
    const cells = rangeCells(history, today, days);
    return cells.map((c) => ({
      label: c.date.slice(5),
      value: Math.round(c.rate * 100),
      sub: `${c.completed}/${c.total} done`,
    }));
  }, [history, today, days]);

  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={data} margin={{ top: 8, right: 6, left: -24, bottom: 0 }}>
        <defs>
          <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={accent} stopOpacity={0.35} />
            <stop offset="100%" stopColor={accent} stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="label"
          axisLine={false}
          tickLine={false}
          minTickGap={28}
          tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }}
        />
        <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 11 }} width={36} />
        <Tooltip cursor={{ stroke: 'rgba(255,255,255,0.1)' }} content={<ChartTip />} />
        <Area
          type="monotone"
          dataKey="value"
          stroke={accent}
          strokeWidth={2}
          fill="url(#trendFill)"
          dot={false}
          activeDot={{ r: 4, fill: accent }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
