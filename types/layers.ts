// ประเภทข้อมูล layer ทั้งหมดในระบบ
export type RasterLayerId =
  | 'dem'
  | 'sar_vv'
  | 'sar_vh'
  | 'flood_threshold'
  | 'flood_classification';

export type VectorLayerId =
  | 'landuse'
  | 'amphoe';

export type LayerId = RasterLayerId | VectorLayerId;

export type LayerFormat = 'geotiff' | 'tile' | 'geojson' | 'shapefile' | 'cog';

export interface LayerConfig {
  id: LayerId;
  label: string;
  labelEn: string;
  description: string;
  format: LayerFormat;
  /** raster → /public/data/raster/, vector → /public/data/vector/ */
  filename: string;
  colormap: ColormapName;
  opacity: number;
  visible: boolean;
  group: 'sar' | 'terrain' | 'flood' | 'landuse' | 'amphoe';
  layerType: 'raster' | 'vector';
  unit?: string;
  min?: number;
  max?: number;
}

export type ColormapName =
  | 'viridis'
  | 'plasma'
  | 'greys'
  | 'rdbu'
  | 'blues'
  | 'rdylgn'
  | 'spectral'
  | 'landuse';

export interface LandUseClass {
  value: number;
  label: string;
  color: string;
  /** พื้นที่ทั้งหมด (ตร.กม.) */
  totalArea?: number;
  /** พื้นที่ที่ถูกน้ำท่วม (ตร.กม.) */
  floodedArea?: number;
}

export interface FloodStats {
  layerId: LayerId;
  totalFloodedPx: number;
  totalFloodedKm2: number;
  byLandUse: Record<number, { floodedKm2: number; percentage: number }>;
}
