export type Severity = 'severe' | 'moderate' | 'light' | 'safe';

export interface AffectedBuilding {
  id: string;
  geometry: GeoJSON.Polygon;
  properties: {
    severity: Severity;
    floodDepth: number;
    tambon: string;
    buildingType?: 'residential' | 'commercial' | 'industrial';
  };
}
