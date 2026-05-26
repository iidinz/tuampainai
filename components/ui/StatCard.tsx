'use client';

import type { ReactNode } from 'react';

interface StatCardProps {
  icon: ReactNode;
  label: string;
  value: string;
  color?: string;
}

export default function StatCard({ icon, label, value, color }: StatCardProps) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3">
      <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
        <span style={color ? { color } : undefined}>{icon}</span>
        <span>{label}</span>
      </div>
      <div className="text-lg font-semibold text-slate-900">{value}</div>
    </div>
  );
}
