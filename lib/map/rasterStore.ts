/**
 * rasterStore — เก็บ parsed georaster objects ไว้ให้ click handler query ค่า pixel ได้
 */

export interface GeoRasterData {
  width: number;
  height: number;
  xmin: number;
  ymin: number;
  xmax: number;
  ymax: number;
  values: number[][][];
  noDataValue: number | null;
}

const store = new Map<string, GeoRasterData>();

export function setRasterData(id: string, data: GeoRasterData) {
  store.set(id, data);
}

export function removeRasterData(id: string) {
  store.delete(id);
}

/**
 * query ค่า pixel จาก georaster ที่เก็บไว้
 * @returns ค่า pixel หรือ null ถ้าอยู่นอกขอบเขต / noData
 */
export function queryRasterValue(
  id: string,
  lng: number,
  lat: number,
): number | null {
  const data = store.get(id);
  if (!data) return null;

  const { xmin, xmax, ymin, ymax, width, height, values, noDataValue } = data;

  // ตรวจว่าอยู่ในขอบเขตไหม
  if (lng < xmin || lng > xmax || lat < ymin || lat > ymax) return null;

  // แปลง lng/lat → pixel col/row
  const col = Math.floor(((lng - xmin) / (xmax - xmin)) * width);
  const row = Math.floor(((ymax - lat) / (ymax - ymin)) * height);

  const clamped_col = Math.min(Math.max(col, 0), width - 1);
  const clamped_row = Math.min(Math.max(row, 0), height - 1);

  const v = values[0]?.[clamped_row]?.[clamped_col];
  if (v == null || Number.isNaN(v) || v === noDataValue || v === 0) return null;

  return v;
}

/** รายชื่อ raster ที่โหลดอยู่ */
export function getLoadedRasterIds(): string[] {
  return Array.from(store.keys());
}
