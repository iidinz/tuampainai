'use client';

/**
 * AmphoeLayer — แสดงขอบเขตอำเภอที่เลือก + ชื่อ (ไทย / อังกฤษ)
 * รับ feature จาก SearchBox → วาด polygon boundary + label
 */

import { useEffect, useMemo } from 'react';
import { useMap, Marker } from 'react-map-gl/maplibre';
import * as turf from '@turf/turf';
import type { AmphoeFeature } from '@/components/filters/SearchBox';

interface Props {
  feature: AmphoeFeature | null;
}

const SOURCE_ID = 'amphoe-selected-source';
const FILL_ID = 'amphoe-selected-fill';
const LINE_ID = 'amphoe-selected-line';

export default function AmphoeLayer({ feature }: Props) {
  const { current: map } = useMap();

  // คำนวณ center ของ polygon สำหรับ label
  const center = useMemo(() => {
    if (!feature) return null;
    try {
      const c = turf.centroid(feature as turf.AllGeoJSON);
      return c.geometry.coordinates as [number, number];
    } catch {
      return null;
    }
  }, [feature]);

  // วาด polygon + fly to bounds
  useEffect(() => {
    if (!map) return;
    const nativeMap = map.getMap();
    if (!nativeMap) return;

    const cleanup = () => {
      try { if (nativeMap && nativeMap.getLayer(LINE_ID)) nativeMap.removeLayer(LINE_ID); } catch (_) {}
      try { if (nativeMap && nativeMap.getLayer(FILL_ID)) nativeMap.removeLayer(FILL_ID); } catch (_) {}
      try { if (nativeMap && nativeMap.getSource(SOURCE_ID)) nativeMap.removeSource(SOURCE_ID); } catch (_) {}
    };

    if (!feature) {
      cleanup();
      return;
    }

    const addLayers = () => {
      try {
        cleanup();

        nativeMap.addSource(SOURCE_ID, {
          type: 'geojson',
          data: feature as GeoJSON.Feature,
        });

        nativeMap.addLayer({
          id: FILL_ID,
          type: 'fill',
          source: SOURCE_ID,
          paint: {
            'fill-color': '#3b82f6',
            'fill-opacity': 0.12,
          },
        });

        nativeMap.addLayer({
          id: LINE_ID,
          type: 'line',
          source: SOURCE_ID,
          paint: {
            'line-color': '#2563eb',
            'line-width': 2.5,
            'line-opacity': 0.9,
          },
        });

        // fly to amphoe bounds
        try {
          const bbox = turf.bbox(feature as turf.AllGeoJSON) as [number, number, number, number];
          nativeMap.fitBounds(bbox, { padding: 60, duration: 1200 });
        } catch (err) {
          console.warn('[AmphoeLayer] fitBounds error:', err);
        }
      } catch (e) {
        console.warn('[AmphoeLayer] addLayers error:', e);
      }
    };

    if (nativeMap.isStyleLoaded()) addLayers();
    else nativeMap.once('load', addLayers);

    return cleanup;
  }, [map, feature]);

  if (!feature || !center) return null;

  return (
    <Marker longitude={center[0]} latitude={center[1]} anchor="center">
      <div className="pointer-events-none text-center select-none">
        <div className="text-[13px] font-bold text-blue-900 drop-shadow-[0_1px_2px_rgba(255,255,255,0.9)]">
          {feature.properties.AMP_NAME_T}
        </div>
        <div className="text-[11px] text-blue-700 drop-shadow-[0_1px_2px_rgba(255,255,255,0.9)]">
          {feature.properties.AMP_NAME_E}
        </div>
      </div>
    </Marker>
  );
}
