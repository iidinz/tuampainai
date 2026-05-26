import type { Severity } from './building';

export interface FloodFeature {
  id: string;
  geometry: GeoJSON.Polygon | GeoJSON.MultiPolygon;
  properties: {
    depth: number;
    severity: Severity;
    date: string;
  };
}
