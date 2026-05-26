/**
 * floodStats — คำนวณสัดส่วนน้ำท่วมในพื้นที่ที่เลือก
 */

import { queryRasterValue } from './rasterStore';
import * as turf from '@turf/turf';

export interface FloodStatResult {
  thresholdFlooded: number;        // จำนวนพิกเซล (threshold)
  classificationFlooded: number;   // จำนวนพิกเซล (classification)
  totalPixels: number;
  thresholdPercent: number;        // %
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
    let thresholdFlooded = 0;
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

        // Query ค่า threshold flood
        const thresholdVal = queryRasterValue('flood_threshold', lng, lat);
        if (thresholdVal != null && thresholdVal >= 1) {
          thresholdFlooded++;
        }

        // Query ค่า classification flood
        const classVal = queryRasterValue('flood_classification', lng, lat);
        if (classVal != null && classVal >= 1) {
          classificationFlooded++;
        }
      }
    }

    const thresholdPercent = totalPoints > 0 ? (thresholdFlooded / totalPoints) * 100 : 0;
    const classificationPercent = totalPoints > 0 ? (classificationFlooded / totalPoints) * 100 : 0;

    return {
      thresholdFlooded,
      classificationFlooded,
      totalPixels: totalPoints,
      thresholdPercent,
      classificationPercent,
    };
  } catch (err) {
    console.warn('[floodStats] calculate error:', err);
    return {
      thresholdFlooded: 0,
      classificationFlooded: 0,
      totalPixels: 0,
      thresholdPercent: 0,
      classificationPercent: 0,
    };
  }
}
