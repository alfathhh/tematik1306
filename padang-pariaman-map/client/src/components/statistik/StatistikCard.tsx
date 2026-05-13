import React from 'react';
import { cn } from '../../lib/cn';

type Color = 'brand' | 'green' | 'amber' | 'red' | 'neutral';

interface Props {
  label: string;
  value: number | string;
  icon?: React.ReactNode;
  color?: Color;
  subtitle?: string;
  className?: string;
}

const colorMap: Record<Color, { bg: string; icon: string; text: string }> = {
  brand: { bg: 'bg-brand-50', icon: 'text-brand-600', text: 'text-brand-900' },
  green: { bg: 'bg-emerald-50', icon: 'text-emerald-600', text: 'text-emerald-900' },
  amber: { bg: 'bg-amber-50', icon: 'text-amber-600', text: 'text-amber-900' },
  red:   { bg: 'bg-red-50', icon: 'text-red-600', text: 'text-red-900' },
  neutral: { bg: 'bg-neutral-100', icon: 'text-neutral-600', text: 'text-neutral-900' },
};

export function StatistikCard({ label, value, icon, color = 'neutral', subtitle, className }: Props) {
  const c = colorMap[color];
  return (
    <div className={cn('bg-white rounded-2xl border border-neutral-100 shadow-soft p-4', className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-xs font-medium text-neutral-500 mb-1">{label}</div>
          <div className={cn('text-2xl font-display font-bold', c.text)}>{value.toLocaleString('id-ID')}</div>
          {subtitle && <div className="text-xs text-neutral-400 mt-0.5">{subtitle}</div>}
        </div>
        {icon && (
          <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', c.bg, c.icon)}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
