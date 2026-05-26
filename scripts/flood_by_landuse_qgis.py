"""
flood_by_landuse_qgis.py
────────────────────────────────────────────────────────────
รันใน QGIS Python Console:
  Plugins → Python Console → Editor → เปิดไฟล์นี้ → Run (▶)

สิ่งที่ script ทำ:
  1. อ่าน flood_thresh (raster 0/1) + LU_AYU_2568 (vector)
  2. Zonal Statistics → นับ pixel ท่วมในแต่ละ polygon land use
  3. Group by LUL_CODE → รวมพื้นที่แต่ละ class
  4. Export → public/data/flood_by_landuse.json

ปรับค่าใน SETTINGS ก่อนรัน
────────────────────────────────────────────────────────────
"""

import json, os
from collections import defaultdict
from qgis.core import (
    QgsProject, QgsVectorFileWriter,
    QgsCoordinateReferenceSystem, QgsCoordinateTransform
)
from qgis.analysis import QgsZonalStatistics

# ══════════════════════════════════════════════════════════
#  SETTINGS
# ══════════════════════════════════════════════════════════

FLOOD_RASTER_NAME = "flood_thresh"       # ชื่อ layer raster ใน QGIS
LANDUSE_LAYER_NAME = "LU_AYU_2568"       # ชื่อ layer vector ใน QGIS
FIELD_LUL_CODE = "LUL_CODE"              # field ประเภท land use (A/W/U/F/M/M+F)

# pixel resolution ของ flood_thresh (rasterize ที่ 0.0001 deg)
# 0.0001° ≈ 11.1 m → 1 pixel ≈ 0.0001 × 0.0001 × 111320² ม. = ~123.5 ตร.ม.
PIXEL_DEG = 0.0001
PIXEL_AREA_M2  = (PIXEL_DEG * 111320) ** 2   # ตร.เมตร
PIXEL_AREA_KM2 = PIXEL_AREA_M2 / 1_000_000   # ตร.กม.
PIXEL_AREA_RAI = PIXEL_AREA_M2 / 1600         # ไร่

# ชื่อภาษาไทยของแต่ละ class
LU_LABELS = {
    'A':   'เกษตรกรรม',
    'W':   'แหล่งน้ำ',
    'U':   'ชุมชน / สิ่งปลูกสร้าง',
    'F':   'ป่าไม้',
    'M':   'เบ็ดเตล็ด',
    'M+F': 'เบ็ดเตล็ด + ป่า',
}

LU_COLORS = {
    'A':   '#a8d5a2',
    'W':   '#1565c0',
    'U':   '#ef9a9a',
    'F':   '#2e7d32',
    'M':   '#bdbdbd',
    'M+F': '#81c784',
}

OUTPUT_DIR = r"E:\TuamPaiNai\public\data"

# ══════════════════════════════════════════════════════════
#  โหลด layer
# ══════════════════════════════════════════════════════════

def get_layer(name):
    layers = QgsProject.instance().mapLayersByName(name)
    if not layers:
        raise ValueError(
            f"ไม่พบ layer '{name}'\n"
            f"เช็คชื่อใน Layers panel แล้วแก้ใน SETTINGS"
        )
    return layers[0]

print("โหลด layer...")
flood_raster   = get_layer(FLOOD_RASTER_NAME)
landuse_layer  = get_layer(LANDUSE_LAYER_NAME)
print(f"  Raster : {flood_raster.name()}")
print(f"  Vector : {landuse_layer.name()} ({landuse_layer.featureCount()} features)")

# ══════════════════════════════════════════════════════════
#  Clone vector layer เพื่อไม่แก้ต้นฉบับ
# ══════════════════════════════════════════════════════════

tmp_path = os.path.join(OUTPUT_DIR, "_tmp_lu_stats.gpkg")
QgsVectorFileWriter.writeAsVectorFormat(
    landuse_layer, tmp_path, "UTF-8",
    landuse_layer.crs(), "GPKG"
)

from qgis.core import QgsVectorLayer
work_layer = QgsVectorLayer(tmp_path, "lu_work", "ogr")
if not work_layer.isValid():
    raise RuntimeError("โหลด temp layer ไม่ได้")

# ══════════════════════════════════════════════════════════
#  Zonal Statistics
# ══════════════════════════════════════════════════════════

print("\nคำนวณ Zonal Statistics (อาจใช้เวลาสักครู่)...")
zs = QgsZonalStatistics(
    work_layer,
    flood_raster,
    "fl_",
    1,
    QgsZonalStatistics.Sum | QgsZonalStatistics.Count
)
zs.calculateStatistics(None)
print("  เสร็จแล้ว")

# ══════════════════════════════════════════════════════════
#  Group by LUL_CODE
# ══════════════════════════════════════════════════════════

grouped = defaultdict(lambda: {"flood_px": 0, "total_px": 0})

for feat in work_layer.getFeatures():
    code      = str(feat[FIELD_LUL_CODE]).strip() if feat[FIELD_LUL_CODE] else "?"
    fl_sum    = feat["fl_sum"]   or 0
    fl_count  = feat["fl_count"] or 0
    grouped[code]["flood_px"] += fl_sum
    grouped[code]["total_px"] += fl_count

# ══════════════════════════════════════════════════════════
#  แสดงผลใน Console
# ══════════════════════════════════════════════════════════

print("\n" + "─" * 68)
print(f"{'Class':<6} {'ประเภท':<22} {'ท่วม (ตร.กม.)':>13} {'ท่วม (ไร่)':>11} {'% ท่วม':>8}")
print("─" * 68)

results = []
total_flood_km2 = 0

for code in sorted(grouped.keys()):
    d = grouped[code]
    flood_km2  = d["flood_px"] * PIXEL_AREA_KM2
    total_km2  = d["total_px"] * PIXEL_AREA_KM2
    flood_rai  = d["flood_px"] * PIXEL_AREA_RAI
    total_rai  = d["total_px"] * PIXEL_AREA_RAI
    pct        = (d["flood_px"] / d["total_px"] * 100) if d["total_px"] > 0 else 0
    label      = LU_LABELS.get(code, code)
    total_flood_km2 += flood_km2

    print(f"{code:<6} {label:<22} {flood_km2:>13.3f} {flood_rai:>11.0f} {pct:>7.1f}%")

    results.append({
        "code":       code,
        "label":      label,
        "color":      LU_COLORS.get(code, "#bdbdbd"),
        "flood_km2":  round(flood_km2, 4),
        "flood_rai":  round(flood_rai, 1),
        "total_km2":  round(total_km2, 4),
        "total_rai":  round(total_rai, 1),
        "pct_flooded": round(pct, 2),
    })

print("─" * 68)
print(f"{'รวม':<6} {'':<22} {total_flood_km2:>13.3f} {total_flood_km2*625:>11.0f}")

# เรียงตามพื้นที่ท่วมมากสุด
results.sort(key=lambda x: x["flood_km2"], reverse=True)

# ══════════════════════════════════════════════════════════
#  Export JSON
# ══════════════════════════════════════════════════════════

os.makedirs(OUTPUT_DIR, exist_ok=True)
out_path = os.path.join(OUTPUT_DIR, "flood_by_landuse.json")

output = {
    "generated_by": "QGIS Python Console — flood_by_landuse_qgis.py",
    "flood_layer":  FLOOD_RASTER_NAME,
    "landuse_layer": LANDUSE_LAYER_NAME,
    "pixel_area_m2": round(PIXEL_AREA_M2, 2),
    "classes": results,
    "summary": {
        "total_flooded_km2": round(total_flood_km2, 4),
        "total_flooded_rai": round(total_flood_km2 * 625, 1),
        "class_count": len(results),
    }
}

with open(out_path, "w", encoding="utf-8") as f:
    json.dump(output, f, ensure_ascii=False, indent=2)

print(f"\n✅ บันทึก → {out_path}")

# ล้าง temp
try:
    os.remove(tmp_path)
except:
    pass

print("🎉 เสร็จ! นำ flood_by_landuse.json ไปแสดงบนเว็บได้เลยครับ")
