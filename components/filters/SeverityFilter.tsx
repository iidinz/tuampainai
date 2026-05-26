'use client';

import { useState } from 'react';
import { SEVERITY_COLORS } from '@/lib/map/constants';
import type { Severity } from '@/types/building';

const SEVERITIES: { key: Severity; label: string }[] = [
  { key: 'severe', label: 'Severe' },
  { key: 'moderate', label: 'Moderate' },
  { key: 'light', label: 'Light' },
  { key: 'safe', label: 'Safe' },
];

export default function SeverityFilter() {
  const [checked, setChecked] = useState<Record<Severity, boolean>>({
    severe: true,
    moderate: true,
    light: true,
    safe: true,
  });

  const toggle = (key: Severity) => {
    setChecked((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div>
      <label className="text-xs font-medium text-slate-500 mb-2 block">Severity</label>
      <div className="space-y-1.5">
        {SEVERITIES.map(({ key, label }) => (
          <label
            key={key}
            className="flex items-center gap-2 cursor-pointer text-sm text-slate-700 hover:text-slate-900"
          >
            <input
              type="checkbox"
              checked={checked[key]}
              onChange={() => toggle(key)}
              className="rounded border-slate-300"
            />
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: SEVERITY_COLORS[key] }}
            />
            {label}
          </label>
        ))}
      </div>
    </div>
  );
}
