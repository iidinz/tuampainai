'use client';

/**
 * PngRasterLayer — แสดง PNG raster บน MapLibre
 * ใช้แทน RasterLayer สำหรับไฟล์ใหญ่ (DEM, Slope, SAR VV/VH)
 * ไม่ต้องใช้ georaster → ไม่ crash Out of Memory
 *
 * ต้องระบุ extent [xmin, ymin, xmax, ymax] ใน EPSG:4326
 * (คัดลอกจาก QGIS Export As PNG → Extent)
 */

import { useEffect } from 'react';
import { useMap } from 'react-map-gl/maplibre';
import { PNG_FILES } from '@/lib/map/constants';

export type PngLayerId = keyof typeof PNG_FILES;

interface Props {
  id: PngLayerId;
  opacity?: number;
}

export default function PngRasterLayer({ id, opacity = 0.8 }: Props) {
  const { current: map } = useMap();

  // ── Add / remove layer when id changes ───────────────────────────────────
  useEffect(() => {
    if (!map) return;

    const entry = PNG_FILES[id];
    if (!entry) return;

    const { url, extent } = entry;
    const [xmin, ymin, xmax, ymax] = extent;

    const sourceId = `png-source-${id}`;
    const layerId  = `png-layer-${id}`;
    const nativeMap = map.getMap();

    const safeRemove = () => {
      try { if (nativeMap.getLayer(layerId))   nativeMap.removeLayer(layerId);   } catch {}
      try { if (nativeMap.getSource(sourceId)) nativeMap.removeSource(sourceId); } catch {}
    };

    const addToMap = () => {
      safeRemove();

      nativeMap.addSource(sourceId, {
        type: 'image',
        url,
        coordinates: [
          [xmin, ymax], // top-left
          [xmax, ymax], // top-right
          [xmax, ymin], // bottom-right
          [xmin, ymin], // bottom-left
        ],
      });

      nativeMap.addLayer({
        id: layerId,
        type: 'raster',
        source: sourceId,
        paint: { 'raster-opacity': opacity },
      });
    };

    if (nativeMap.isStyleLoaded()) {
      addToMap();
    } else {
      nativeMap.once('load', addToMap);
    }

    return safeRemove;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, id]);

  // ── Opacity ปรับได้โดยไม่ต้อง reload ──────────────────────────────────────
  useEffect(() => {
    if (!map) return;
    const nativeMap = map.getMap();
    const layerId   = `png-layer-${id}`;
    if (nativeMap.getLayer(layerId)) {
      nativeMap.setPaintProperty(layerId, 'raster-opacity', opacity);
    }
  }, [map, id, opacity]);

  return null;
}
