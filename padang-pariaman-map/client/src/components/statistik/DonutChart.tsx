import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

/**
 * DonutChart — distribusi kategori infrastruktur.
 * Prop schema: data: { name, value, color }
 * Default export agar bisa diimport sebagai: import DonutChart from './DonutChart'
 *
 * Fix: sebelumnya named export `export function DonutChart` dengan schema
 * berbeda {label, value}. Sekarang default export dengan schema {name, value, color}.
 */

interface DonutChartProps {
  data: { name: string; value: number; color: string }[];
  title?: string;
}

export default function DonutChart({ data, title }: DonutChartProps) {
  const total = data.reduce((sum, d) => sum + d.value, 0);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-36 text-neutral-400 text-xs">
        Tidak ada data
      </div>
    );
  }

  return (
    <div>
      {title && (
        <h4 className="text-xs font-semibold text-neutral-700 mb-3 uppercase tracking-wide">
          {title}
        </h4>
      )}

      <div className="flex items-center gap-4">
        {/* Donut */}
        <div className="flex-shrink-0">
          <ResponsiveContainer width={100} height={100}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={30}
                outerRadius={46}
                paddingAngle={2}
                dataKey="value"
                strokeWidth={0}
              >
                {data.map((entry, i) => (
                  <Cell key={`cell-${i}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  fontSize: 11,
                  borderRadius: 10,
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                  padding: '6px 10px',
                }}
                formatter={(v: number, name: string) => [
                  `${v} tempat (${total > 0 ? Math.round((v / total) * 100) : 0}%)`,
                  name,
                ]}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend kustom */}
        <div className="flex-1 space-y-1.5 min-w-0">
          {data.map(d => (
            <div key={d.name} className="flex items-center gap-2 min-w-0">
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: d.color }}
                aria-hidden="true"
              />
              <span className="text-[11px] text-neutral-600 flex-1 truncate">{d.name}</span>
              <span className="text-[11px] font-semibold text-neutral-700 flex-shrink-0">
                {d.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
