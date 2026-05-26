'use client';

import { Calendar } from 'lucide-react';

export default function DateSelector() {
  return (
    <div>
      <label className="text-xs font-medium text-slate-500 mb-1 block">Date</label>
      <button className="w-full flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-400 hover:border-slate-300">
        <Calendar size={14} />
        <span>Select date...</span>
      </button>
    </div>
  );
}
