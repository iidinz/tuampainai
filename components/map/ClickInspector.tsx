'use client';

/**
 * ClickInspector — คลิกบนแผนที่เพื่อดูค่า raster pixel + ข้อมูล vector (Land Use)
 * แสดง popup ที่จุดที่คลิก
 */

import { useEffect, useState, useCallback } from 'react';
import { useMap, Popup } from 'react-map-gl/maplibre';
import type { MapMouseEvent } from 'maplibre-gl';
import { queryRasterValue, getLoadedRasterIds } from '@/lib/map/rasterStore';
import { LANDUSE_COLORS } from '@/lib/map/constants';

// แปลง LUL1_CODE → ชื่อไทย
const LU_LABELS: Record<string, string> = {
  A:     'เกษตรกรรม',
  W:     'แหล่งน้ำ',
  U:     'ชุมชน / สิ่งปลูกสร้าง',
  F:     'ป่าไม้',
  M:     'เบ็ดเตล็ด',
  'M+A': 'เบ็ดเตล็ด + เกษตรกรรม',
};

// หน่วยของแต่ละ raster
const RASTER_UNITS: Record<string, string> = {
  dem:                  'm',
  sar_vv:               'dB',
  sar_vh:               'dB',
  flood_threshold:      '',
  flood_classification: '',
};

// label สั้น ๆ ของ raster
const RASTER_LABELS: Record<string, string> = {
  dem:                  'DEM',
  sar_vv:               'SAR VV',
  sar_vh:               'SAR VH',
  flood_threshold:      'Flood (Threshold)',
  flood_classification: 'Flood (RF)',
};

// แปลงค่า flood เป็นข้อความ
function formatRasterValue(id: string, value: number): string {
  if (id === 'flood_threshold' || id === 'flood_classification') {
    return value >= 1 ? 'ท่วม' : 'ไม่ท่วม';
  }
  const unit = RASTER_UNITS[id] ?? '';
  return `${value.toFixed(2)} ${unit}`.trim();
}

interface PopupInfo {
  lng: number;
  lat: number;
  rasterValues: Array<{ id: string; label: string; value: string }>;
  vectorFeatures: Array<{
    luCode: string;
    luLabel: string;
    luColor: string;
    area_rai?: number;
  }>;
}

export default function ClickInspector() {
  const { current: map } = useMap();
  const [popup, setPopup] = useState<PopupInfo | null>(null);

  const handleClick = useCallback(
    (e: MapMouseEvent) => {
      if (!map) return;
      const { lng, lat } = e.lngLat;
      const nativeMap = map.getMap();

      // ── Query raster values ──
      const loadedIds = getLoadedRasterIds();
      const rasterValues: PopupInfo['rasterValues'] = [];

      for (const id of loadedIds) {
        const v = queryRasterValue(id, lng, lat);
        if (v != null) {
          rasterValues.push({
            id,
            label: RASTER_LABELS[id] ?? id,
            value: formatRasterValue(id, v),
          });
        }
      }

      // ── Query vector features (Land Use) ──
      const vectorFeatures: PopupInfo['vectorFeatures'] = [];
      const fillLayers = nativeMap
        .getStyle()
        .layers?.filter((l) => l.id.startsWith('vector-fill-'))
        .map((l) => l.id) ?? [];

      if (fillLayers.length > 0) {
        const features = nativeMap.queryRenderedFeatures(e.point, {
          layers: fillLayers,
        });
        for (const f of features) {
          const props = f.properties;
          if (!props) continue;
          const luCode = props.LUL1_CODE ?? props.LUL_CODE ?? '';
          if (luCode) {
            vectorFeatures.push({
              luCode,
              luLabel: LU_LABELS[luCode] ?? luCode,
              luColor: LANDUSE_COLORS[luCode] ?? '#bdbdbd',
              area_rai: props.AREA_RAI ?? props.area_rai,
            });
          }
        }
      }

      // ถ้าไม่มีข้อมูลเลย ไม่ต้องแสดง popup
      if (rasterValues.length === 0 && vectorFeatures.length === 0) {
        setPopup(null);
        return;
      }

      setPopup({ lng, lat, rasterValues, vectorFeatures });
    },
    [map],
  );

  useEffect(() => {
    if (!map) return;
    const nativeMap = map.getMap();
    nativeMap.on('click', handleClick);

    // เปลี่ยน cursor เป็น crosshair
    nativeMap.getCanvas().style.cursor = 'crosshair';

    return () => {
      nativeMap.off('click', handleClick);
      nativeMap.getCanvas().style.cursor = '';
    };
  }, [map, handleClick]);

  if (!popup) return null;

  return (
    <Popup
      longitude={popup.lng}
      latitude={popup.lat}
      anchor="bottom"
      closeOnClick={false}
      onClose={() => setPopup(null)}
      className="inspect-popup"
      maxWidth="260px"
    >
      <div className="p-2 min-w-[180px] space-y-2">
        {/* พิกัด */}
        <div className="text-[10px] text-slate-400 tabular-nums">
          {popup.lat.toFixed(5)}, {popup.lng.toFixed(5)}
        </div>

        {/* ข้อมูล Raster */}
        {popup.rasterValues.length > 0 && (
          <div className="space-y-1">
            {popup.rasterValues.map((r) => (
              <div
                key={r.id}
                className="flex items-center justify-between text-[11px]"
              >
                <span className="text-slate-500">{r.label}</span>
                <span className="font-medium text-slate-800">{r.value}</span>
              </div>
            ))}
          </div>
        )}

        {/* ข้อมูล Land Use */}
        {popup.vectorFeatures.length > 0 && (
          <div className="border-t border-slate-100 pt-1.5 space-y-1">
            <div className="text-[10px] font-semibold text-blue-400 uppercase tracking-wide">
              Land Use
            </div>
            {popup.vectorFeatures.map((f, i) => (
              <div key={i} className="flex items-center gap-1.5 text-[11px]">
                <span
                  className="h-2.5 w-2.5 rounded-sm shrink-0"
                  style={{ backgroundColor: f.luColor }}
                />
                <span className="text-slate-700">{f.luLabel}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </Popup>
  );
}
