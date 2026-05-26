'use client';

/**
 * AmphoeStats — แสดงสัดส่วนน้ำท่วมในอำเภอที่เลือก
 * แสดง RF Classification method
 */

import { useEffect, useState, useMemo } from 'react';
import { Droplets, X, Loader2 } from 'lucide-react';
import * as turf from '@turf/turf';
import type { AmphoeFeature } from '@/components/filters/SearchBox';
import { calculateFloodStats, type FloodStatResult } from '@/lib/map/floodStats';

interface Props {
  feature: AmphoeFeature | null;
}

/** Mini donut chart component */
function DonutChart({
  percent,
  color,
  size = 52,
  strokeWidth = 6,
}: {
  percent: number;
  color: string;
  size?: number;
  strokeWidth?: number;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(percent, 100) / 100) * circumference;

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      {/* Background ring */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="#e2e8f0"
        strokeWidth={strokeWidth}
      />
      {/* Progress ring */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        className="transition-all duration-1000 ease-out"
      />
    </svg>
  );
}

export default function AmphoeStats({ feature }: Props) {
  const [stats, setStats] = useState<FloodStatResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(true);

  // คำนวณพื้นที่รวมของอำเภอ (ตร.กม.)
  const amphoeAreaKm2 = useMemo(() => {
    if (!feature) return 0;
    try {
      const areaM2 = turf.area(feature as GeoJSON.Feature);
      return areaM2 / 1_000_000; // m² → km²
    } catch {
      return feature.properties.Shape_Area * 10_000; // fallback: Shape_Area อาจเป็น sq.deg
    }
  }, [feature]);

  useEffect(() => {
    if (!feature) {
      setStats(null);
      return;
    }

    setLoading(true);
    setVisible(true);
    // ใช้ setTimeout เพื่อให้ UI ไม่ freeze ระหว่างคำนวณ
    const timeout = setTimeout(() => {
      try {
        const result = calculateFloodStats(feature);
        setStats(result);
      } catch (err) {
        console.warn('[AmphoeStats] calculate error:', err);
        setStats(null);
      }
      setLoading(false);
    }, 150);

    return () => clearTimeout(timeout);
  }, [feature]);

  if (!feature || !visible) return null;

  const classAreaKm2 = stats
    ? (stats.classificationPercent / 100) * amphoeAreaKm2
    : 0;

  return (
    <div
      className="absolute top-16 left-3 z-20 w-[280px] rounded-xl border border-blue-100
                  bg-white/95 backdrop-blur shadow-xl shadow-blue-100/50 overflow-hidden
                  animate-in slide-in-from-left-2 duration-300"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500">
        <div className="flex items-center gap-2">
          <Droplets size={15} className="text-white/90" />
          <div>
            <div className="text-[12px] font-semibold text-white leading-tight">
              {feature.properties.AMP_NAME_T}
            </div>
            <div className="text-[10px] text-blue-100 leading-tight">
              {feature.properties.AMP_NAME_E}
            </div>
          </div>
        </div>
        <button
          onClick={() => setVisible(false)}
          className="text-white/60 hover:text-white transition-colors"
          title="ปิด"
        >
          <X size={14} />
        </button>
      </div>

      {/* Total Area */}
      <div className="px-4 py-1.5 bg-blue-50/60 border-b border-blue-100">
        <div className="flex justify-between text-[10px]">
          <span className="text-slate-400">พื้นที่อำเภอ</span>
          <span className="text-slate-600 font-medium tabular-nums">
            {amphoeAreaKm2.toLocaleString('th-TH', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}{' '}
            ตร.กม.
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-3 space-y-3">
        {loading && (
          <div className="flex flex-col items-center gap-2 py-4">
            <Loader2 size={20} className="text-blue-400 animate-spin" />
            <span className="text-[11px] text-slate-400">กำลังคำนวณสัดส่วนน้ำท่วม...</span>
          </div>
        )}

        {!loading && stats && (
          <>
            <div className="space-y-1.5">
              <div className="flex items-center gap-3">
                <div className="relative shrink-0">
                  <DonutChart percent={stats.classificationPercent} color="#10b981" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-[10px] font-bold text-emerald-600 tabular-nums">
                      {stats.classificationPercent.toFixed(1)}%
                    </span>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] font-semibold text-slate-700">
                    RF Classification
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    {classAreaKm2.toLocaleString('th-TH', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}{' '}
                    ตร.กม.
                  </div>
                  <div className="text-[9px] text-slate-400">
                    ≈{' '}
                    {(classAreaKm2 * 625).toLocaleString('th-TH', {
                      maximumFractionDigits: 0,
                    })}{' '}
                    ไร่
                  </div>
                </div>
              </div>
              {/* Progress bar */}
              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${Math.min(stats.classificationPercent, 100)}%` }}
                />
              </div>
            </div>

            <div className="pt-1.5 border-t border-blue-100">
              <div className="text-[9px] text-slate-300 mt-1">
                จาก {stats.totalPixels.toLocaleString()} sample points
              </div>
            </div>
          </>
        )}

        {!loading && !stats && (
          <div className="text-[11px] text-slate-400 text-center py-3">
            ไม่สามารถคำนวณได้ — อาจยังไม่ได้โหลด raster layer
          </div>
        )}
      </div>
    </div>
  );
}
