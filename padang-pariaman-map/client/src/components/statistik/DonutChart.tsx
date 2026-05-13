import React, { useMemo } from 'react';
import { cn } from '../../lib/cn';

interface DataItem {
  label: string;
  value: number;
  color?: string;
}

interface Props {
  data: DataItem[];
  size?: number;
  className?: string;
}

const COLORS = ['#3B82F6','#10B981','#F59E0B','#EF4444','#8B5CF6','#EC4899','#06B6D4','#84CC16'];

export function DonutChart({ data, size = 140, className }: Props) {
  const total = useMemo(() => data.reduce((s, d) => s + d.value, 0), [data]);

  const slices = useMemo(() => {
    const r = 42;
    const circ = 2 * Math.PI * r;
    let offset = 0;
    return data.map((item, i) => {
      const pct = total > 0 ? item.value / total : 0;
      const len = pct * circ;
      const slice = { ...item, color: item.color || COLORS[i % COLORS.length], dasharray: `${len} ${circ - len}`, dashoffset: -offset, pct };
      offset += len;
      return slice;
    });
  }, [data, total]);

  if (!data.length || total === 0) return (
    <div className="flex items-center justify-center h-32 text-sm text-neutral-400">Tidak ada data.</div>
  );

  return (
    <div className={cn('flex flex-col items-center gap-4', className)}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox="0 0 100 100">
          {slices.map((s, i) => (
            <circle key={i} cx="50" cy="50" r="42" fill="none" stroke={s.color} strokeWidth="14" strokeDasharray={s.dasharray} strokeDashoffset={s.dashoffset} style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }} />
          ))}
          <circle cx="50" cy="50" r="28" fill="white" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-display font-bold text-neutral-900">{total}</span>
          <span className="text-[9px] text-neutral-500 uppercase tracking-wide">Total</span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 w-full">
        {slices.map((s, i) => (
          <div key={i} className="flex items-center gap-1.5 min-w-0">
            <div className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ backgroundColor: s.color }} />
            <span className="text-[11px] text-neutral-600 truncate">{s.label}</span>
            <span className="text-[11px] font-medium text-neutral-900 ml-auto flex-shrink-0">{s.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
