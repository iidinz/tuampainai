'use client';

import { LAYER_CONFIGS, LANDUSE_CLASSES } from '@/config/layers';

interface LegendProps {
  activeLayers: string[];
}

// Gradient colormaps (สำหรับ continuous layers)
const COLORMAPS: Record<string, { stops: string[]; label: [string, string] }> = {
  dem:    { stops: ['#440154', '#3b528b', '#21918c', '#5ec962', '#fde725'], label: ['ต่ำ', 'สูง'] },
  sar_vv: { stops: ['#000000', '#ffffff'], label: ['−25 dB', '0 dB'] },
  sar_vh: { stops: ['#000000', '#ffffff'], label: ['−30 dB', '−5 dB'] },
};

// Binary legends (ท่วม / ไม่ท่วม)
const BINARY_LEGENDS: Record<string, { colors: [string, string]; labels: [string, string] }> = {
  flood_threshold:      { colors: ['#e0e0e0', '#0d47a1'], labels: ['ไม่ท่วม', 'ท่วม'] },
  flood_classification: { colors: ['#e0e0e0', '#0d47a1'], labels: ['ไม่ท่วม', 'ท่วม'] },
};

// card สไตล์กลาง
const card = 'rounded-xl border border-blue-100 bg-white/95 backdrop-blur px-3 py-2.5 shadow-lg shadow-blue-100/40 w-44';

export default function Legend({ activeLayers }: LegendProps) {
  if (activeLayers.length === 0) return null;

  return (
    <div className="absolute bottom-8 left-3 z-10 flex flex-col gap-2 max-h-[70vh] overflow-y-auto">
      {activeLayers.map((layerId) => {
        const config = LAYER_CONFIGS.find((l) => l.id === layerId);
        if (!config) return null;

        // ── Land Use — categorical ──────────────────────────────────────
        if (layerId === 'landuse') {
          return (
            <div key={layerId} className={card}>
              <div className="text-[10px] font-semibold text-blue-500 uppercase tracking-wide mb-2">
                {config.labelEn}
              </div>
              <div className="space-y-1.5">
                {LANDUSE_CLASSES.map(({ value, label, color }) => (
                  <div key={value} className="flex items-center gap-2 text-[11px] text-slate-600">
                    <span className="h-3 w-3 rounded-sm shrink-0 border border-black/10"
                          style={{ backgroundColor: color }} />
                    {label}
                  </div>
                ))}
              </div>
            </div>
          );
        }

        // ── Binary flood — ท่วม / ไม่ท่วม ──────────────────────────────
        const bin = BINARY_LEGENDS[layerId];
        if (bin) {
          return (
            <div key={layerId} className={card}>
              <div className="text-[10px] font-semibold text-blue-500 uppercase tracking-wide mb-2 leading-tight">
                {config.labelEn}
              </div>
              <div className="flex gap-3">
                {bin.colors.map((color, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-[11px] text-slate-600">
                    <span className="h-3.5 w-3.5 rounded-sm shrink-0 border border-black/10"
                          style={{ backgroundColor: color }} />
                    {bin.labels[i]}
                  </div>
                ))}
              </div>
            </div>
          );
        }

        // ── Continuous — gradient bar ───────────────────────────────────
        const cm = COLORMAPS[layerId];
        if (!cm) return null;
        const gradient = `linear-gradient(to right, ${cm.stops.join(', ')})`;

        return (
          <div key={layerId} className={card}>
            <div className="text-[10px] font-semibold text-blue-500 uppercase tracking-wide mb-2 leading-tight">
              {config.labelEn}
            </div>
            <div className="h-2.5 rounded-full w-full mb-1.5 border border-black/5"
                 style={{ background: gradient }} />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>{cm.label[0]}</span>
              <span>{cm.label[1]}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
