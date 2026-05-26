"""
flood_stats_qgis.py
────────────────────────────────────────────────────────────
รันใน QGIS Python Console:
  Plugins → Python Console → เปิด Editor → วางโค้ด → Run

สิ่งที่ script นี้ทำ:
  1. อ่าน flood_thresh (raster) + ขอบเขตอำเภอ (vector)
  2. คำนวณพื้นที่ท่วมแต่ละอำเภอ (ตร.กม. และ %)
  3. Export → flood_by_district.geojson  (ใช้แสดงบนแผนที่)
              flood_stats.json           (ใช้แสดงตารางใน web)

ปรับค่าใน SETTINGS ก่อนรัน
────────────────────────────────────────────────────────────
"""

import json, os
from qgis.core import (
    QgsProject, QgsVectorLayer, QgsRasterLayer,
    QgsVectorFileWriter, QgsCoordinateReferenceSystem,
    QgsCoordinateTransform
)
from qgis.analysis import QgsZonalStatistics

# ══════════════════════════════════════════════════════════
#  SETTINGS — ปรับให้ตรงกับชื่อ layer ใน QGIS ของคุณ
# ══════════════════════════════════════════════════════════

# ชื่อ layer ใน QGIS Layers panel (ดูจากแผงซ้าย)
FLOOD_RASTER_NAME   = "flood_thresh"           # raster น้ำท่วม (0/1)
DISTRICT_LAYER_NAME = "33_amarea_phra_nakhon_si_ayutthaya"  # vector อำเภอ

# Field ชื่ออำเภอใน attribute table
FIELD_AMP_CODE = "AMP_CODE"
FIELD_AMP_TH   = "AMP_NAME_T"
FIELD_AMP_EN   = "AMP_NAME_E"

# pixel resolution ของ flood_thresh (องศา → ตร.กม.)
# flood_thresh rasterize ที่ 0.0001 deg ≈ 11.1 m → pixel ≈ 0.000123 ตร.กม.
PIXEL_AREA_KM2 = 0.0001 * 0.0001 * (111.32 * 111.32)

# โฟลเดอร์ output (เปลี่ยนให้ตรงกับ path จริงในเครื่อง)
OUTPUT_DIR = r"E:\TuamPaiNai\public\data\vector"

# ══════════════════════════════════════════════════════════
#  หา layer จาก QGIS project
# ══════════════════════════════════════════════════════════

def get_layer(name):
    layers = QgsProject.instance().mapLayersByName(name)
    if not layers:
        raise ValueError(f"ไม่พบ layer ชื่อ '{name}' ใน QGIS\nเช็คชื่อใน Layers panel แล้วแก้ใน SETTINGS")
    return layers[0]

print("กำลังโหลด layer...")
flood_raster   = get_layer(FLOOD_RASTER_NAME)
district_layer = get_layer(DISTRICT_LAYER_NAME)

print(f"  Raster : {flood_raster.name()}")
print(f"  Vector : {district_layer.name()} ({district_layer.featureCount()} อำเภอ)")

# ══════════════════════════════════════════════════════════
#  Clone vector layer (ไม่แก้ต้นฉบับ)
# ══════════════════════════════════════════════════════════

tmp_path = os.path.join(OUTPUT_DIR, "_tmp_district_stats.gpkg")
error, msg = QgsVectorFileWriter.writeAsVectorFormat(
    district_layer, tmp_path, "UTF-8",
    district_layer.crs(), "GPKG"
)
if error != QgsVectorFileWriter.NoError:
    raise RuntimeError(f"Clone layer ไม่ได้: {msg}")

work_layer = QgsVectorLayer(tmp_path, "work", "ogr")
if not work_layer.isValid():
    raise RuntimeError("โหลด temp layer ไม่ได้")

# ══════════════════════════════════════════════════════════
#  Zonal Statistics — นับ pixel ท่วม (sum) และทั้งหมด (count)
# ══════════════════════════════════════════════════════════

print("\nคำนวณ Zonal Statistics...")
zs = QgsZonalStatistics(
    work_layer,
    flood_raster,
    "fl_",          # prefix ของ column ที่จะเพิ่ม
    1,              # band 1
    QgsZonalStatistics.Sum | QgsZonalStatistics.Count
)
result = zs.calculateStatistics(None)
print(f"  เสร็จแล้ว (result code: {result})")

# ══════════════════════════════════════════════════════════
#  รวบรวมผลและคำนวณพื้นที่
# ══════════════════════════════════════════════════════════

stats = []
for feat in work_layer.getFeatures():
    amp_code = feat[FIELD_AMP_CODE]
    amp_th   = feat[FIELD_AMP_TH]
    amp_en   = feat[FIELD_AMP_EN]

    fl_sum   = feat["fl_sum"]   or 0   # pixel ที่มีค่า = 1 (น้ำท่วม)
    fl_count = feat["fl_count"] or 0   # pixel ทั้งหมดในอำเภอ

    flooded_km2 = fl_sum   * PIXEL_AREA_KM2
    total_km2   = fl_count * PIXEL_AREA_KM2
    pct         = (fl_sum / fl_count * 100) if fl_count > 0 else 0

    # แปลงเป็นไร่ (1 ตร.กม. = 625 ไร่)
    flooded_rai = flooded_km2 * 625
    total_rai   = total_km2   * 625

    stats.append({
        "amp_code":    str(amp_code),
        "amp_th":      amp_th,
        "amp_en":      amp_en,
        "flooded_km2": round(flooded_km2, 4),
        "flooded_rai": round(flooded_rai, 1),
        "total_km2":   round(total_km2,   4),
        "total_rai":   round(total_rai,   1),
        "pct_flooded": round(pct, 2),
    })

# เรียงตามพื้นที่ท่วมมากสุด
stats.sort(key=lambda x: x["flooded_km2"], reverse=True)

# ══════════════════════════════════════════════════════════
#  แสดงผลใน Console
# ══════════════════════════════════════════════════════════

print("\n{'─'*65}")
print(f"{'อำเภอ':<20} {'ท่วม (ตร.กม.)':>14} {'ท่วม (ไร่)':>12} {'% ท่วม':>8}")
print("─" * 65)
for s in stats:
    print(f"{s['amp_th']:<20} {s['flooded_km2']:>14.2f} {s['flooded_rai']:>12.0f} {s['pct_flooded']:>7.1f}%")
print("─" * 65)
total_flood = sum(s["flooded_km2"] for s in stats)
print(f"{'รวมทั้งหมด':<20} {total_flood:>14.2f} {total_flood*625:>12.0f}")

# ══════════════════════════════════════════════════════════
#  Export flood_stats.json
# ══════════════════════════════════════════════════════════

os.makedirs(OUTPUT_DIR, exist_ok=True)
json_path = os.path.join(OUTPUT_DIR, "..", "flood_stats.json")
json_path = os.path.normpath(json_path)

output = {
    "generated": "QGIS Python Console",
    "flood_layer": FLOOD_RASTER_NAME,
    "unit": {"km2": "ตารางกิโลเมตร", "rai": "ไร่"},
    "districts": stats,
    "summary": {
        "total_flooded_km2": round(total_flood, 4),
        "total_flooded_rai": round(total_flood * 625, 1),
        "district_count": len(stats),
    }
}

with open(json_path, "w", encoding="utf-8") as f:
    json.dump(output, f, ensure_ascii=False, indent=2)

print(f"\n✅ บันทึก flood_stats.json → {json_path}")

# ══════════════════════════════════════════════════════════
#  Export flood_by_district.geojson (มี geometry + stats)
# ══════════════════════════════════════════════════════════

geojson_path = os.path.join(OUTPUT_DIR, "flood_by_district.geojson")

save_options = QgsVectorFileWriter.SaveVectorOptions()
save_options.driverName = "GeoJSON"
save_options.fileEncoding = "UTF-8"
save_options.ct = QgsCoordinateTransform(
    work_layer.crs(),
    QgsCoordinateReferenceSystem("EPSG:4326"),
    QgsProject.instance()
)

error2, msg2 = QgsVectorFileWriter.writeAsVectorFormatV2(
    work_layer, geojson_path,
    QgsProject.instance().transformContext(),
    save_options
)

if error2 == QgsVectorFileWriter.NoError:
    print(f"✅ บันทึก flood_by_district.geojson → {geojson_path}")
else:
    print(f"⚠️  GeoJSON export มีปัญหา: {msg2}")

# ล้าง temp file
try:
    os.remove(tmp_path)
except:
    pass

print("\n🎉 เสร็จสิ้น! นำไฟล์ไปใช้ใน TuamPaiNai ได้เลย")
