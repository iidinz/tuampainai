/**
 * floodStats — คำนวณสัดส่วนน้ำท่วมในพื้นที่ที่เลือก
 */

import { queryRasterValue } from './rasterStore';
import * as turf from '@turf/turf';

export interface FloodStatResult {
  classificationFlooded: number;   // จำนวนพิกเซล (classification)
  totalPixels: number;
  classificationPercent: number;   // %
}

/**
 * คำนวณสัดส่วนน้ำท่วมในพื้นที่ที่เลือก
 * โดยใช้ sampling pixel จากขอบเขตพื้นที่
 */
export function calculateFloodStats(
  polygon: GeoJSON.Feature<GeoJSON.Polygon | GeoJSON.MultiPolygon>,
  sampleDensity: number = 32  // ระยะห่างระหว่าง sample points (เมตร)
): FloodStatResult {
  try {
    const bbox = turf.bbox(polygon);
    const [minLng, minLat, maxLng, maxLat] = bbox;

    let totalPoints = 0;
    let classificationFlooded = 0;

    // Sample points บนกริด ภายในขอบเขต
    const stepLng = (sampleDensity / 111000); // ประมาณ meter to degree
    const stepLat = (sampleDensity / 111000);

    for (let lng = minLng; lng <= maxLng; lng += stepLng) {
      for (let lat = minLat; lat <= maxLat; lat += stepLat) {
        const point = turf.point([lng, lat]);
        
        // ตรวจว่าจุด sample อยู่ในพื้นที่หรือไม่
        if (!turf.booleanPointInPolygon(point, polygon)) continue;

        totalPoints++;

        // Query ค่า classification flood
        const classVal = queryRasterValue('flood_classification', lng, lat);
        if (classVal != null && classVal >= 1) {
          classificationFlooded++;
        }
      }
    }

    const classificationPercent = totalPoints > 0 ? (classificationFlooded / totalPoints) * 100 : 0;

    return {
      classificationFlooded,
      totalPixels: totalPoints,
      classificationPercent,
    };
  } catch (err) {
    console.warn('[floodStats] calculate error:', err);
    return {
      classificationFlooded: 0,
      totalPixels: 0,
      classificationPercent: 0,
    };
  }
}
