'use client';

/**
 * VectorLayer — แสดง GeoJSON บน MapLibre
 * รองรับ: landuse (lu_ayu_2568.geojson)
 */

import { useEffect } from 'react';
import { useMap } from 'react-map-gl/maplibre';
import type { VectorId } from '@/lib/map/constants';
import { VECTOR_FILES, LANDUSE_COLORS } from '@/lib/map/constants';

interface Props {
  id: VectorId;
  opacity?: number;
}

type StyleDef = {
  fillColor: string | unknown[];
  fillOpacity: number;
  outlineColor: string;
  outlineWidth: number;
};

const VECTOR_STYLES: Record<VectorId, StyleDef> = {
  landuse: {
    fillColor: [
      'match',
      ['get', 'LUL1_CODE'],
      'A',   LANDUSE_COLORS['A'],
      'W',   LANDUSE_COLORS['W'],
      'U',   LANDUSE_COLORS['U'],
      'F',   LANDUSE_COLORS['F'],
      'M',   LANDUSE_COLORS['M'],
      'M+A', LANDUSE_COLORS['M+A'],
      '#bdbdbd',
    ],
    fillOpacity: 0.6,
    outlineColor: '#90caf9',
    outlineWidth: 0.3,
  },
  amphoe: {
    fillColor: '#3b82f6',
    fillOpacity: 0.1,
    outlineColor: '#2563eb',
    outlineWidth: 1.5,
  },
};

export default function VectorLayer({ id, opacity = 1 }: Props) {
  const { current: map } = useMap();

  useEffect(() => {
    if (!map) return;

    const url      = VECTOR_FILES[id];
    if (!url) {
      console.warn(`[VectorLayer] No URL found for vector layer: ${id}`);
      return;
    }

    const sourceId = `vector-source-${id}`;
    const fillId   = `vector-fill-${id}`;
    const lineId   = `vector-line-${id}`;
    const style    = VECTOR_STYLES[id];
    if (!style) {
      console.warn(`[VectorLayer] No style found for vector layer: ${id}`);
      return;
    }

    const nativeMap = map.getMap();
    if (!nativeMap) return;

    const safeRemove = () => {
      try { if (nativeMap && nativeMap.getLayer(lineId))    nativeMap.removeLayer(lineId);   } catch {}
      try { if (nativeMap && nativeMap.getLayer(fillId))    nativeMap.removeLayer(fillId);   } catch {}
      try { if (nativeMap && nativeMap.getSource(sourceId)) nativeMap.removeSource(sourceId);} catch {}
    };

    const addLayers = () => {
      try {
        safeRemove();

        nativeMap.addSource(sourceId, { type: 'geojson', data: url });

        nativeMap.addLayer({
          id: fillId,
          type: 'fill',
          source: sourceId,
          paint: {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            'fill-color': style.fillColor as any,
            'fill-opacity': style.fillOpacity * opacity,
          },
        });

        // เส้นขอบ — ไม่แสดงสำหรับ landuse
        if (style.outlineWidth > 0 && id !== 'landuse') {
          nativeMap.addLayer({
            id: lineId,
            type: 'line',
            source: sourceId,
            paint: {
              'line-color': style.outlineColor,
              'line-width': style.outlineWidth,
              'line-opacity': opacity,
            },
          });
        }
      } catch (e) {
        console.warn(`[VectorLayer] addLayers error (${id}):`, e);
      }
    };

    if (nativeMap.isStyleLoaded()) {
      addLayers();
    } else {
      nativeMap.once('load', addLayers);
    }

    return safeRemove;
  }, [map, id, opacity]);

  return null;
}
