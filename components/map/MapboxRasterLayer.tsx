'use client';

/**
 * MapboxRasterLayer — แสดง raster layer จาก Mapbox Tileset
 * ใช้สำหรับ layer ที่ไฟล์ TIF ใหญ่เกินไป (เช่น slope) จนทำให้ OOM ถ้าโหลดผ่าน georaster
 *
 * วิธีใช้:
 * 1. อัปโหลด TIF ขึ้น Mapbox Studio → Tilesets → New tileset
 * 2. คัดลอก Tileset ID (เช่น "username.abc12345") มาใส่ใน MAPBOX_TILESETS
 * 3. ต้องการ NEXT_PUBLIC_MAPBOX_TOKEN ใน .env.local
 */

import { useEffect } from 'react';
import { useMap } from 'react-map-gl/maplibre';

// ── Mapbox Tileset IDs ────────────────────────────────────────────────────────
// เพิ่ม layer id → tileset ID หลังจากอัปโหลดใน Mapbox Studio
export const MAPBOX_TILESETS: Record<string, string> = {
  slope: 'REPLACE_WITH_YOUR_TILESET_ID', // เช่น "username.abc12345"
  // dem:    'username.xxxxxxxx',
  // sar_vv: 'username.xxxxxxxx',
  // sar_vh: 'username.xxxxxxxx',
  // flood_classification: 'username.xxxxxxxx',
};

interface Props {
  id: string;
  opacity?: number;
}

export default function MapboxRasterLayer({ id, opacity = 0.8 }: Props) {
  const { current: map } = useMap();

  // ── Add / remove layer ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!map) return;

    const tilesetId = MAPBOX_TILESETS[id];
    if (!tilesetId || tilesetId.startsWith('REPLACE_')) {
      console.warn(`[MapboxRasterLayer] ยังไม่ได้ตั้ง Tileset ID สำหรับ "${id}"`);
      return;
    }

    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!token) {
      console.error('[MapboxRasterLayer] ไม่พบ NEXT_PUBLIC_MAPBOX_TOKEN ใน .env.local');
      return;
    }

    const sourceId = `mapbox-tile-source-${id}`;
    const layerId  = `mapbox-tile-layer-${id}`;
    const nativeMap = map.getMap();

    const safeRemove = () => {
      try { if (nativeMap.getLayer(layerId))   nativeMap.removeLayer(layerId);   } catch (_) {}
      try { if (nativeMap.getSource(sourceId)) nativeMap.removeSource(sourceId); } catch (_) {}
    };

    const addToMap = () => {
      safeRemove();

      // Mapbox raster-dem หรือ raster tile URL
      nativeMap.addSource(sourceId, {
        type: 'raster',
        tiles: [
          `https://api.mapbox.com/v4/${tilesetId}/{z}/{x}/{y}.png?access_token=${token}`,
        ],
        tileSize: 256,
        attribution: '© Mapbox',
      });

      nativeMap.addLayer({
        id: layerId,
        type: 'raster',
        source: sourceId,
        paint: {
          'raster-opacity': opacity,
          'raster-resampling': 'linear',
        },
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
    const layerId   = `mapbox-tile-layer-${id}`;
    if (nativeMap.getLayer(layerId)) {
      nativeMap.setPaintProperty(layerId, 'raster-opacity', opacity);
    }
  }, [map, id, opacity]);

  return null;
}
