'use client';

import { Droplets, BarChart3, Map, Layers } from 'lucide-react';
import StatCard from '@/components/ui/StatCard';
import { LANDUSE_CLASSES } from '@/config/layers';

/**
 * InfoPanel — แสดงสถิติน้ำท่วมรวมและแยกตาม Land Use
 * ข้อมูลจริงจะถูก inject จาก MapView ผ่าน props หรือ global store
 * ตอนนี้ใช้ placeholder (—) ไว้ก่อน
 */
export default function InfoPanel() {
  return (
    <aside className="w-[280px] shrink-0 bg-slate-50 border-l border-slate-200 overflow-y-auto">
      <div className="p-4 space-y-5">
        <h2 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
          สรุปผลน้ำท่วม
        </h2>

        {/* ── สถิติรวม ──────────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-2">
          <StatCard
            icon={<Droplets size={14} />}
            label="พื้นที่น้ำท่วม"
            value="— กม²"
          />
          <StatCard
            icon={<BarChart3 size={14} />}
            label="% ของพื้นที่ทั้งหมด"
            value="—%"
          />
          <StatCard
            icon={<Map size={14} />}
            label="Threshold (−17 dB)"
            value="— กม²"
          />
          <StatCard
            icon={<Layers size={14} />}
            label="Classification"
            value="— กม²"
          />
        </div>

        {/* ── แยกตาม Land Use ──────────────────────────────────── */}
        <div className="border-t border-slate-200 pt-4">
          <h3 className="text-xs font-medium text-slate-500 mb-3">
            พื้นที่น้ำท่วมตามการใช้ที่ดิน
          </h3>
          <div className="space-y-2.5">
            {LANDUSE_CLASSES.map(({ value, label, color }) => (
              <div key={value}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <div className="flex items-center gap-1.5">
                    <span
                      className="h-2.5 w-2.5 rounded-sm shrink-0"
                      style={{ backgroundColor: color }}
                    />
                    <span className="text-slate-600">{label}</span>
                  </div>
                  <span className="text-slate-400 tabular-nums">— กม²</span>
                </div>
                {/* Progress bar placeholder */}
                <div className="h-1.5 rounded-full bg-slate-200">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ backgroundColor: color, width: '0%' }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── หมายเหตุ data ─────────────────────────────────────── */}
        <div className="border-t border-slate-200 pt-3">
          <p className="text-[11px] text-slate-400 leading-relaxed">
            ข้อมูลจะถูกคำนวณหลังโหลดไฟล์ raster ครบทั้ง flood + landuse
          </p>
        </div>
      </div>
    </aside>
  );
}
