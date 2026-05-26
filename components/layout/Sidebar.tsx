'use client';

import DateSelector from '@/components/filters/DateSelector';
import LayerToggle from '@/components/filters/LayerToggle';

export default function Sidebar() {
  return (
    <aside className="w-[260px] shrink-0 bg-slate-50 border-r border-slate-200 overflow-y-auto">
      <div className="p-4 space-y-5">
        {/* วันที่ข้อมูล SAR */}
        <div>
          <h2 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-3">
            ข้อมูล
          </h2>
          <DateSelector />
        </div>

        {/* รายชื่อ layer */}
        <div className="border-t border-slate-200 pt-4">
          <LayerToggle />
        </div>

        {/* ข้อมูลดาวเทียม */}
        <div className="border-t border-slate-200 pt-4 space-y-1.5">
          <h2 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-2">
            แหล่งข้อมูล
          </h2>
          {[
            { label: 'Sentinel-1 SAR', sub: 'ESA / Copernicus' },
            { label: 'DEM', sub: 'SRTM / Copernicus DEM 30m' },
            { label: 'Land Use', sub: 'GISTDA / กรมพัฒนาที่ดิน' },
          ].map(({ label, sub }) => (
            <div key={label} className="text-xs">
              <span className="font-medium text-slate-700">{label}</span>
              <span className="text-slate-400 ml-1.5">{sub}</span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
