import React from 'react';
import { cn } from '../../lib/cn';

interface DataItem {
  label: string;
  value: number;
  color?: string;
}

interface Props {
  data: DataItem[];
  colorScheme?: 'multi' | 'brand';
  className?: string;
}

const COLORS = ['#3B82F6','#10B981','#F59E0B','#EF4444','#8B5CF6','#EC4899','#06B6D4','#84CC16'];

export function BarChart({ data, colorScheme = 'multi', className }: Props) {
  if (!data.length) return (
    <div className="flex items-center justify-center h-40 text-sm text-neutral-400">Tidak ada data.</div>
  );

  const max = Math.max(...data.map(d => d.value), 1);

  return (
    <div className={cn('space-y-2', className)}>
      {data.map((item, i) => {
        const pct = (item.value / max) * 100;
        const color = item.color || (colorScheme === 'brand' ? '#3B82F6' : COLORS[i % COLORS.length]);
        return (
          <div key={item.label} className="flex items-center gap-3">
            <div className="w-28 text-xs text-neutral-600 truncate flex-shrink-0 text-right">{item.label}</div>
            <div className="flex-1 flex items-center gap-2">
              <div className="flex-1 h-5 rounded-full bg-neutral-100 overflow-hidden">
                <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: color }} />
              </div>
              <span className="text-xs font-medium text-neutral-700 w-6 text-right flex-shrink-0">{item.value}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
