'use client';

/**
 * StatsPanel — แสดงตารางพื้นที่น้ำท่วมแยกตาม Land Use
 * ข้อมูลจาก /data/flood_by_landuse.json (คำนวณจาก QGIS)
 * แสดงเฉพาะ RF Classification
 */

import { useEffect, useState } from 'react';
import { BarChart2, X, ChevronDown, ChevronUp } from 'lucide-react';

interface LUClass {
  code: string;
  label: string;
  color: string;
  flood_km2: number;
  flood_rai: number;
  total_km2: number;
  total_rai: number;
  pct_flooded: number;
}

interface MethodData {
  classes: LUClass[];
  summary: {
    total_flooded_km2: number;
    total_flooded_rai: number;
  };
}

interface FloodStats {
  rf_classification: MethodData;
}

export default function StatsPanel() {
  const [data, setData]       = useState<FloodStats | null>(null);
  const [open, setOpen]       = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    fetch('/data/flood_by_landuse.json')
      .then((r) => r.json())
      .then(setData)
      .catch(() => console.warn('[StatsPanel] โหลด flood_by_landuse.json ไม่ได้'));
  }, []);

  if (!data) return null;

  const current   = data.rf_classification;
  const maxFlood  = Math.max(...current.classes.map((c) => c.flood_km2));
  const classes   = expanded
    ? current.classes
    : current.classes.filter((c) => c.flood_km2 > 0);

  return (
    <div className="absolute bottom-10 right-3 z-20 w-64">
      {/* ── Toggle button ── */}
      <button
        onClick={() => setOpen((v) => !v)}
        title="สถิติน้ำท่วม"
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg shadow-md
                    text-xs font-medium transition-all ml-auto
                    ${open
                      ? 'bg-blue-600 text-white shadow-blue-200'
                      : 'bg-white/90 backdrop-blur text-blue-700 border border-blue-100 hover:bg-blue-50'
                    }`}
      >
        <BarChart2 size={13} />
        สถิติน้ำท่วม
      </button>

      {/* ── Panel ── */}
      {open && (
        <div className="mt-2 rounded-xl border border-blue-100 bg-white/95 backdrop-blur
                        shadow-xl shadow-blue-100/50 overflow-hidden">

          {/* header */}
          <div className="flex items-center justify-between px-3 py-2 bg-blue-600">
            <span className="text-[11px] font-semibold text-white tracking-wide uppercase">
              พื้นที่น้ำท่วมแยก Land Use
            </span>
            <button onClick={() => setOpen(false)} className="text-white/70 hover:text-white">
              <X size={13} />
            </button>
          </div>

          {/* summary */}
          <div className="px-3 py-2 bg-blue-600/5 border-b border-blue-100">
            <div className="flex justify-between items-baseline">
              <span className="text-[10px] text-blue-400">พื้นที่ท่วมรวม</span>
              <span className="text-[13px] font-bold text-blue-700">
                {current.summary.total_flooded_km2.toLocaleString('th-TH', { minimumFractionDigits: 2 })} ตร.กม.
              </span>
            </div>
            <div className="flex justify-between items-baseline mt-0.5">
              <span className="text-[10px] text-blue-400" />
              <span className="text-[11px] text-blue-500">
                ≈ {current.summary.total_flooded_rai.toLocaleString('th-TH', { maximumFractionDigits: 0 })} ไร่
              </span>
            </div>
          </div>

          {/* table */}
          <div className="px-3 py-2.5 space-y-2">
            {classes.map((cls) => (
              <div key={cls.code}>
                <div className="flex items-center justify-between mb-0.5">
                  <div className="flex items-center gap-1.5">
                    <span
                      className="h-2.5 w-2.5 rounded-sm shrink-0"
                      style={{ backgroundColor: cls.color }}
                    />
                    <span className="text-[11px] text-slate-600 leading-tight">{cls.label}</span>
                  </div>
                  <span className="text-[11px] font-medium text-blue-700 tabular-nums ml-1 shrink-0">
                    {cls.flood_km2.toLocaleString('th-TH', { minimumFractionDigits: 2 })} ตร.กม.
                  </span>
                </div>

                {/* mini bar */}
                <div className="ml-4 flex items-center gap-1.5">
                  <div className="flex-1 h-1.5 rounded-full bg-blue-50 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: maxFlood > 0 ? `${(cls.flood_km2 / maxFlood) * 100}%` : '0%',
                        backgroundColor: cls.color,
                      }}
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 tabular-nums w-8 text-right">
                    {cls.pct_flooded > 0 ? `${cls.pct_flooded}%` : '—'}
                  </span>
                </div>
              </div>
            ))}

            {/* show/hide class ที่ไม่ท่วม */}
            {current.classes.some((c) => c.flood_km2 === 0) && (
              <button
                onClick={() => setExpanded((v) => !v)}
                className="w-full flex items-center justify-center gap-1 mt-1
                           text-[10px] text-blue-400 hover:text-blue-600 transition-colors"
              >
                {expanded ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
                {expanded ? 'ซ่อน class ที่ไม่ท่วม' : 'แสดง class ที่ไม่ท่วม'}
              </button>
            )}
          </div>

          <div className="px-3 pb-2 text-[9px] text-slate-300 text-right">
            คำนวณจาก QGIS Zonal Statistics
          </div>
        </div>
      )}
    </div>
  );
}
