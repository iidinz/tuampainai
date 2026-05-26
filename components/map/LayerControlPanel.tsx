'use client';

import { useState } from 'react';
import { Layers, ChevronDown, ChevronRight, Map as MapIcon, X } from 'lucide-react';
import { LAYER_CONFIGS, GROUP_LABELS } from '@/config/layers';

type AnyLayerId = string;

interface ActiveLayer {
  id: AnyLayerId;
  opacity: number;
  type: 'raster' | 'vector';
}

interface Props {
  activeLayers: ActiveLayer[];
  onToggle: (id: AnyLayerId, type: 'raster' | 'vector') => void;
  onOpacityChange: (id: AnyLayerId, opacity: number) => void;
  basemap: 'light' | 'satellite';
  onBasemapChange: (b: 'light' | 'satellite') => void;
}

const GROUPS = ['flood', 'sar', 'terrain', 'landuse', 'amphoe'] as const;

// เปิด flood group ไว้ก่อน, ที่เหลือพับ
const INITIAL_COLLAPSED: Record<string, boolean> = {
  flood: false,
  sar: true,
  terrain: true,
  landuse: true,
  amphoe: true,
};

export default function LayerControlPanel({
  activeLayers,
  onToggle,
  onOpacityChange,
  basemap,
  onBasemapChange,
}: Props) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>(INITIAL_COLLAPSED);
  const [open, setOpen] = useState(false);

  const isActive = (id: string) => activeLayers.some((l) => l.id === id);
  const getOpacity = (id: string) => activeLayers.find((l) => l.id === id)?.opacity ?? 0.8;
  const toggleGroup = (g: string) => setCollapsed((p) => ({ ...p, [g]: !p[g] }));

  return (
    <div className="absolute top-3 right-12 z-20">
      {/* ── Toggle button ── */}
      <button
        onClick={() => setOpen((v) => !v)}
        title="Layers"
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg shadow-md
                    text-xs font-medium transition-all
                    ${open
                      ? 'bg-blue-600 text-white shadow-blue-200'
                      : 'bg-white/90 backdrop-blur text-blue-700 border border-blue-100 hover:bg-blue-50'
                    }`}
      >
        <Layers size={13} />
        Layers
        {activeLayers.length > 0 && (
          <span className={`ml-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-semibold leading-none
                            ${open ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-700'}`}>
            {activeLayers.length}
          </span>
        )}
      </button>

      {/* ── Panel ── */}
      {open && (
        <div className="mt-2 w-52 rounded-xl border border-blue-100 bg-white/95 backdrop-blur
                        shadow-xl shadow-blue-100/50 overflow-hidden">

          {/* header */}
          <div className="flex items-center justify-between px-3 py-2 bg-blue-600">
            <span className="text-[11px] font-semibold text-white tracking-wide uppercase">
              ชั้นข้อมูล
            </span>
            <button onClick={() => setOpen(false)} className="text-white/70 hover:text-white">
              <X size={13} />
            </button>
          </div>

          {/* layer groups */}
          {GROUPS.map((group) => {
            const groupLayers = LAYER_CONFIGS.filter((l) => l.group === group);
            const isCollapsed = collapsed[group];

            return (
              <div key={group} className="border-b border-blue-50 last:border-0">
                <button
                  onClick={() => toggleGroup(group)}
                  className="w-full flex items-center gap-1.5 px-3 py-2
                             text-[10px] font-semibold text-blue-400 uppercase tracking-wider
                             hover:bg-blue-50 transition-colors"
                >
                  {isCollapsed
                    ? <ChevronRight size={10} />
                    : <ChevronDown size={10} />}
                  {GROUP_LABELS[group]}
                </button>

                {!isCollapsed && (
                  <div className="px-3 pb-2.5 space-y-2.5">
                    {groupLayers.map((layer) => {
                      const active = isActive(layer.id);
                      const opacity = getOpacity(layer.id);
                      // badge แสดง format ของ layer
                      const badge = layer.layerType === 'vector'
                        ? 'GeoJSON'
                        : layer.format === 'tile' ? 'TILE'
                          : layer.format === 'png' ? 'PNG'
                            : 'TIF';
                      const badgeColor = layer.layerType === 'vector'
                        ? 'bg-green-100 text-green-600'
                        : layer.format === 'tile'
                          ? 'bg-purple-100 text-purple-600'
                          : 'bg-blue-100 text-blue-500';

                      return (
                        <div key={`${layer.id}-${layer.layerType}`}>
                          <label className="flex items-center gap-2 cursor-pointer group">
                            {/* custom checkbox */}
                            <span
                              onClick={() => onToggle(layer.id, layer.layerType)}
                              className={`h-3.5 w-3.5 rounded border-2 shrink-0 flex items-center justify-center
                                          transition-colors cursor-pointer
                                          ${active
                                            ? 'bg-blue-600 border-blue-600'
                                            : 'border-slate-300 group-hover:border-blue-400'}`}
                            >
                              {active && (
                                <svg viewBox="0 0 10 8" className="w-2 h-2 fill-white">
                                  <path d="M1 4l2.5 2.5L9 1" stroke="white" strokeWidth="1.5"
                                        fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                              )}
                            </span>
                            <span className={`text-[11px] leading-tight select-none flex-1
                                            ${active ? 'text-blue-900 font-medium' : 'text-slate-500'}`}>
                              {layer.label}
                            </span>
                            <span className={`text-[9px] font-bold px-1 py-0.5 rounded ${badgeColor}`}>
                              {badge}
                            </span>
                          </label>

                          {/* opacity slider */}
                          {active && (
                            <div className="mt-1.5 ml-5 flex items-center gap-2">
                              <input
                                type="range"
                                min={0} max={1} step={0.05}
                                value={opacity}
                                onChange={(e) =>
                                  onOpacityChange(layer.id, parseFloat(e.target.value))
                                }
                                className="w-full h-1 rounded-full accent-blue-600 cursor-pointer"
                              />
                              <span className="text-[10px] text-blue-400 w-6 text-right tabular-nums">
                                {Math.round(opacity * 100)}%
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}

          {/* basemap */}
          <div className="px-3 py-2.5 bg-blue-50/60">
            <div className="flex items-center gap-1 text-[10px] font-semibold text-blue-400 uppercase tracking-wider mb-1.5">
              <MapIcon size={10} />
              Basemap
            </div>
            <div className="flex gap-1.5">
              {(['light', 'satellite'] as const).map((style) => (
                <button
                  key={style}
                  onClick={() => onBasemapChange(style)}
                  className={`flex-1 rounded-md border py-1 text-[11px] font-medium transition-colors
                              ${basemap === style
                                ? 'border-blue-500 bg-blue-600 text-white'
                                : 'border-blue-200 bg-white text-blue-500 hover:border-blue-400'}`}
                >
                  {style === 'light' ? 'แผนที่' : 'ดาวเทียม'}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
