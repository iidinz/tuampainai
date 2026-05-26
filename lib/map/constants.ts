// ── พิกัดและ zoom เริ่มต้น ──────────────────────────────────────────────────
// ปรับให้ตรงกับพื้นที่ศึกษา (อยุธยา หรือพื้นที่อื่น ๆ ได้เลย)
export const STUDY_CENTER: [number, number] = [100.5895, 14.3532]; // อยุธยา
export const STUDY_BOUNDS: [[number, number], [number, number]] = [
  [100.3, 14.1],
  [100.9, 14.6],
];
export const DEFAULT_ZOOM = 11;

// legacy aliases (ถ้ายังมีโค้ดเก่าอ้างอิงอยู่)
export const HATYAI_CENTER = STUDY_CENTER;
export const HATYAI_BOUNDS = STUDY_BOUNDS;

// ── สีตาม severity ──────────────────────────────────────────────────────────
export const SEVERITY_COLORS = {
  severe: '#DC2626',
  moderate: '#F59E0B',
  light: '#FCD34D',
  safe: '#10B981',
} as const;

// ── Layer IDs ที่ใช้ใน MapLibre ────────────────────────────────────────────
export const RASTER_LAYER_IDS = {
  dem: 'layer-dem',
  sar_vv: 'layer-sar-vv',
  sar_vh: 'layer-sar-vh',
  flood_threshold: 'layer-flood-threshold',
  flood_classification: 'layer-flood-classification',
  landuse: 'layer-landuse',
} as const;

// ── สีสำหรับ Land Use (LUL_CODE จาก lu_ayu_2568) ───────────────────────────
// A = เกษตรกรรม, W = แหล่งน้ำ, U = ชุมชน, F = ป่าไม้, M = เบ็ดเตล็ด, M+F = เบ็ดเตล็ด+ป่า
export const LANDUSE_COLORS: Record<string, string> = {
  'A':   '#a8d5a2', // เกษตรกรรม — เขียวอ่อน
  'W':   '#1565c0', // แหล่งน้ำ — น้ำเงิน
  'U':   '#ef9a9a', // ชุมชน/สิ่งปลูกสร้าง — แดงอ่อน
  'F':   '#2e7d32', // ป่าไม้ — เขียวเข้ม
  'M':   '#bdbdbd', // เบ็ดเตล็ด — เทา
  'M+A': '#c8e6c9', // เบ็ดเตล็ด+เกษตรกรรม — เขียวอ่อน
};

// ── Path ไฟล์ raster TIF (ใช้ georaster — เฉพาะไฟล์เล็ก) ──────────────────
export const RASTER_FILES = {
  dem:                  '/data/raster/Ayutthaya_SRTM_DEM_30m.tif',
  sar_vv:               '/data/raster/vv_s1a.tif',
  sar_vh:               '/data/raster/vh_s1a.tif',
  flood_threshold:      '/data/raster/flood_thresh.tif',
  flood_classification: '/data/raster/flood_rf_result.tif',
} as const;

// legacy alias
export const DATA_FILES = RASTER_FILES;


// ── Path ไฟล์ vector (วางใน /public/data/vector/) ───────────────────────────
export const VECTOR_FILES = {
  landuse: '/data/vector/lu_ayu_2568.geojson',
  amphoe:  '/data/vector/amarea_ayutthaya.geojson',
} as const;

export type RasterId = keyof typeof RASTER_FILES;
export type VectorId = keyof typeof VECTOR_FILES;
