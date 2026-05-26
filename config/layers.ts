import type { LayerConfig, LandUseClass } from '@/types/layers';

/**
 * ตั้งค่า layer ทั้งหมด
 * raster → วางใน /public/data/raster/
 * vector → วางใน /public/data/vector/ (GeoJSON แปลงจาก Shapefile)
 */
export const LAYER_CONFIGS: LayerConfig[] = [
  {
    id: 'dem',
    label: 'แบบจำลองระดับความสูง (DEM)',
    labelEn: 'Digital Elevation Model',
    description: 'ระดับความสูงของพื้นดิน (เมตร) จาก SRTM / Copernicus DEM',
    format: 'geotiff',
    filename: 'Ayutthaya_SRTM_DEM_30m.tif',
    colormap: 'viridis',
    opacity: 0.8,
    visible: false,
    group: 'terrain',
    layerType: 'raster',
    unit: 'm',
  },
  {
    id: 'sar_vv',
    label: 'SAR — VV Backscatter',
    labelEn: 'SAR VV Polarization',
    description: 'ค่าสะท้อนกลับ VV จากดาวเทียม Sentinel-1A (dB)',
    format: 'geotiff',
    filename: 'vv_s1a.tif',
    colormap: 'greys',
    opacity: 0.85,
    visible: false,
    group: 'sar',
    layerType: 'raster',
    unit: 'dB',
  },
  {
    id: 'sar_vh',
    label: 'SAR — VH Backscatter',
    labelEn: 'SAR VH Polarization',
    description: 'ค่าสะท้อนกลับ VH จากดาวเทียม Sentinel-1A (dB)',
    format: 'geotiff',
    filename: 'vh_s1a.tif',
    colormap: 'greys',
    opacity: 0.85,
    visible: false,
    group: 'sar',
    layerType: 'raster',
    unit: 'dB',
  },
  // ── Flood layers ──────────────────────────────────────────────────────────
  {
    id: 'flood_threshold',
    label: 'น้ำท่วม — Threshold (−17 dB)',
    labelEn: 'Flood Threshold (−17 dB)',
    description: 'ขอบเขตพื้นที่น้ำท่วมจาก threshold VV < −17 dB (flood_thresh.tif)',
    format: 'geotiff',
    filename: 'flood_thresh.tif',
    colormap: 'blues',
    opacity: 0.7,
    visible: true,
    group: 'flood',
    layerType: 'raster',
  },
  {
    id: 'flood_classification',
    label: 'น้ำท่วม — RF Classification',
    labelEn: 'Flood Classification (RF)',
    description: 'พื้นที่น้ำท่วมจาก Random Forest classification (flood_rf_result.tif)',
    format: 'geotiff',
    filename: 'flood_rf_result.tif',
    colormap: 'rdbu',
    opacity: 0.8,
    visible: false,
    group: 'flood',
    layerType: 'raster',
  },
  // ── Land Use ──────────────────────────────────────────────────────────────
  {
    id: 'landuse',
    label: 'การใช้ประโยชน์ที่ดิน',
    labelEn: 'Land Use (lu_ayu_2568)',
    description: 'การใช้ประโยชน์ที่ดิน — กรมพัฒนาที่ดิน (lu_ayu_2568.geojson)',
    format: 'geojson',
    filename: 'lu_ayu_2568.geojson',
    colormap: 'landuse',
    opacity: 0.7,
    visible: false,
    group: 'landuse',
    layerType: 'vector',
  },
  // ── Amphoe ────────────────────────────────────────────────────────────────
  {
    id: 'amphoe',
    label: 'ขอบเขตอำเภอ',
    labelEn: 'District Boundary',
    description: 'ขอบเขตอำเภอในจังหวัดอยุธยา (amarea_ayutthaya.geojson)',
    format: 'geojson',
    filename: 'amarea_ayutthaya.geojson',
    colormap: 'viridis',
    opacity: 0.8,
    visible: false,
    group: 'amphoe',
    layerType: 'vector',
  },
];

/** คลาส Land Use และสีที่ใช้แสดงผล */
/** คลาส Land Use ตรงกับ LUL1_CODE ใน GeoJSON และ LANDUSE_COLORS */
export const LANDUSE_CLASSES: LandUseClass[] = [
  { value: 1, label: 'เกษตรกรรม',              color: '#a8d5a2' }, // A
  { value: 2, label: 'แหล่งน้ำ',               color: '#1565c0' }, // W
  { value: 3, label: 'ชุมชน / สิ่งปลูกสร้าง',   color: '#ef9a9a' }, // U
  { value: 4, label: 'ป่าไม้',                  color: '#2e7d32' }, // F
  { value: 5, label: 'เบ็ดเตล็ด',              color: '#bdbdbd' }, // M
  { value: 6, label: 'เบ็ดเตล็ด + เกษตรกรรม',   color: '#c8e6c9' }, // M+A
];

/** layer group labels */
export const GROUP_LABELS: Record<string, string> = {
  flood: 'แผนที่น้ำท่วม',
  sar: 'ภาพ SAR (Sentinel-1)',
  terrain: 'ข้อมูลภูมิประเทศ',
  landuse: 'การใช้ประโยชน์ที่ดิน',
  amphoe: 'ขอบเขตการบริหาร',
};
