'use client';

/**
 * RasterLayer — แสดง GeoTIFF บน MapLibre
 * ใช้ georaster parse → วาดลง canvas → ใส่เป็น ImageSource
 *
 * npm install georaster
 */

import { useEffect, useRef } from 'react';
import { useMap } from 'react-map-gl/maplibre';
import type { RasterId } from '@/lib/map/constants';
import { RASTER_FILES } from '@/lib/map/constants';
import { setRasterData, removeRasterData } from '@/lib/map/rasterStore';

type RGBA = [number, number, number, number];

interface Props {
  id: RasterId;
  opacity?: number;
  colormap?: (value: number, min: number, max: number) => RGBA;
}

// ── Colormaps ──────────────────────────────────────────────────────────────
// ── helper: lerp ระหว่าง color stops ──────────────────────────────────────
function lerpStops(
  t: number,
  stops: Array<[number, number, number]>,
): [number, number, number] {
  const n = stops.length - 1;
  const idx = Math.min(Math.floor(t * n), n - 1);
  const local = (t * n) - idx;
  const a = stops[idx];
  const b = stops[idx + 1];
  return [
    Math.round(a[0] + (b[0] - a[0]) * local),
    Math.round(a[1] + (b[1] - a[1]) * local),
    Math.round(a[2] + (b[2] - a[2]) * local),
  ];
}

export const COLORMAPS: Record<string, (v: number, min: number, max: number) => RGBA> = {
  /** flood: 0 = transparent, ≥1 = น้ำเงิน (noData จะถูก filter ก่อนเข้า colormap) */
  classification: (v) => {
    if (v === 0) return [0, 0, 0, 0];
    return [13, 71, 161, 210]; // #0d47a1
  },

  /** greyscale สำหรับ SAR */
  grey: (v, min, max) => {
    const t = Math.max(0, Math.min(1, (v - min) / (max - min)));
    const c = Math.round(t * 255);
    return [c, c, c, 200];
  },

  /** viridis สำหรับ DEM — ตรงกับ Legend: #440154 → #21918c → #fde725 */
  viridis: (v, min, max) => {
    const t = Math.max(0, Math.min(1, (v - min) / (max - min)));
    const [r, g, b] = lerpStops(t, [
      [68,   1, 84],   // #440154 ม่วงเข้ม
      [59,  82, 139],  // #3b528b น้ำเงิน
      [33, 145, 140],  // #21918c เขียวอมฟ้า
      [94, 201, 98],   // #5ec962 เขียว
      [253, 231, 37],  // #fde725 เหลือง
    ]);
    return [r, g, b, 200];
  },
};

// ── Component ──────────────────────────────────────────────────────────────
export default function RasterLayer({ id, opacity = 0.8, colormap }: Props) {
  const { current: map } = useMap();
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!map) return;

    const url = (RASTER_FILES as Record<string, string>)[id];
    if (!url) return;

    const sourceId = `raster-img-${id}`;
    const layerId  = `raster-lyr-${id}`;
    let cancelled  = false;

    (async () => {
      try {
        const { default: parseGeoraster } = await import('georaster');

        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status} — ${url}`);
        const buf      = await res.arrayBuffer();
        const georaster = await parseGeoraster(buf);
        if (cancelled) return;

        const { width, height, values, mins, maxs, xmin, ymin, xmax, ymax, noDataValue } = georaster;
        const min = mins[0];
        const max = maxs[0];
        const cm  = colormap ?? COLORMAPS.grey;

        console.log(`[RasterLayer] ${id}: ${width}x${height}, min=${min}, max=${max}, noData=${noDataValue}, extent=[${xmin},${ymin},${xmax},${ymax}]`);

        // เก็บ georaster data ไว้ให้ click handler query ค่า pixel ได้
        setRasterData(id, { width, height, xmin, ymin, xmax, ymax, values, noDataValue: noDataValue ?? null });

        // ย่อ resolution เพื่อประหยัด RAM — จำกัดด้านยาวไม่เกิน 1024px
        const MAX_DIM = 1024;
        const scale   = Math.min(1, MAX_DIM / Math.max(width, height));
        const outW    = Math.round(width  * scale);
        const outH    = Math.round(height * scale);

        // วาดลง OffscreenCanvas ขนาดย่อ
        const canvas = new OffscreenCanvas(outW, outH);
        const ctx    = canvas.getContext('2d')!;
        const img    = ctx.createImageData(outW, outH);
        const band   = values[0] as number[][];

        for (let row = 0; row < outH; row++) {
          const srcRow = Math.min(Math.round(row / scale), height - 1);
          for (let col = 0; col < outW; col++) {
            const srcCol = Math.min(Math.round(col / scale), width - 1);
            const v = band[srcRow]?.[srcCol];
            const i = (row * outW + col) * 4;
            if (v == null || Number.isNaN(v) || v === noDataValue || v === 0) {
              img.data[i + 3] = 0;
              continue;
            }
            const [r, g, b, a] = cm(v, min, max);
            img.data[i]     = r;
            img.data[i + 1] = g;
            img.data[i + 2] = b;
            img.data[i + 3] = a;
          }
        }
        ctx.putImageData(img, 0, 0);

        // แปลง canvas → blob → URL
        const blob    = await canvas.convertToBlob({ type: 'image/png' });
        const blobUrl = URL.createObjectURL(blob);
        if (cancelled) { URL.revokeObjectURL(blobUrl); return; }

        const nativeMap = map.getMap();

        const addToMap = () => {
          try {
            if (nativeMap.getLayer(layerId))  nativeMap.removeLayer(layerId);
            if (nativeMap.getSource(sourceId)) nativeMap.removeSource(sourceId);

            nativeMap.addSource(sourceId, {
              type: 'image',
              url: blobUrl,
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
          } catch (e) {
            console.warn(`[RasterLayer] addToMap error (${id}):`, e);
          }
        };

        if (nativeMap.isStyleLoaded()) addToMap();
        else nativeMap.once('load', addToMap);

        cleanupRef.current = () => {
          try {
            if (nativeMap && typeof nativeMap.getLayer === 'function' && typeof nativeMap.getSource === 'function') {
              if (nativeMap.getLayer(layerId)) nativeMap.removeLayer(layerId);
              if (nativeMap.getSource(sourceId)) nativeMap.removeSource(sourceId);
            }
          } catch (e) {
            console.warn('[RasterLayer] cleanup error:', e);
          }
          URL.revokeObjectURL(blobUrl);
          removeRasterData(id);
        };

      } catch (err) {
        console.warn(`[RasterLayer] โหลดไม่ได้ (${id}):`, err);
      }
    })();

    return () => {
      cancelled = true;
      cleanupRef.current?.();
      cleanupRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, id]);

  // opacity เปลี่ยนโดยไม่ต้อง reload
  useEffect(() => {
    if (!map) return;
    try {
      const nativeMap = map.getMap();
      if (!nativeMap || typeof nativeMap.getLayer !== 'function') return;
      
      const layerId   = `raster-lyr-${id}`;
      const layer = nativeMap.getLayer(layerId);
      if (layer) {
        nativeMap.setPaintProperty(layerId, 'raster-opacity', opacity);
      }
    } catch (e) {
      console.warn('[RasterLayer] opacity update error:', e);
    }
  }, [map, id, opacity]);

  return null;
}
