"""
flood_stats_all_qgis.py
────────────────────────────────────────────────────────────
รันใน QGIS Python Console:
  Plugins → Python Console → Editor → เปิดไฟล์นี้ → Run (▶)

รันครั้งเดียว ได้ผลทั้งหมด:
  1. flood_thresh    × LU_AYU_2568  → flood_by_landuse_thresh.json
  2. flood_rf_result × LU_AYU_2568  → flood_by_landuse_rf.json
  3. รวมทั้งสองไว้ใน              → flood_by_landuse.json (ใช้บนเว็บ)

ปรับค่าใน SETTINGS ก่อนรัน
────────────────────────────────────────────────────────────
"""

import json, os
from collections import defaultdict
from qgis.core import (
    QgsProject, QgsVectorLayer, QgsVectorFileWriter,
)
from qgis.analysis import QgsZonalStatistics

# ══════════════════════════════════════════════════════════
#  SETTINGS
# ══════════════════════════════════════════════════════════

THRESH_RASTER_NAME  = "flood_thresh"       # layer raster threshold
RF_RASTER_NAME      = "flood_rf_result"    # layer raster RF classification
LANDUSE_LAYER_NAME  = "LU_AYU_2568"        # layer vector land use
FIELD_LUL_CODE      = "LUL1_CODE"          # field ประเภท land use

# pixel resolution (rasterize ที่ 0.0001 deg)
PIXEL_DEG      = 0.0001
PIXEL_AREA_M2  = (PIXEL_DEG * 111320) ** 2
PIXEL_AREA_KM2 = PIXEL_AREA_M2 / 1_000_000
PIXEL_AREA_RAI = PIXEL_AREA_M2 / 1600

OUTPUT_DIR = r"E:\TuamPaiNai\public\data"

# ── ชื่อและสีแต่ละ class ─────────────────────────────────
LU_LABELS = {
    'A':   'เกษตรกรรม',
    'W':   'แหล่งน้ำ',
    'U':   'ชุมชน / สิ่งปลูกสร้าง',
    'F':   'ป่าไม้',
    'M':   'เบ็ดเตล็ด',
    'M+A': 'เบ็ดเตล็ด + เกษตรกรรม',
}

LU_COLORS = {
    'A':   '#a8d5a2',
    'W':   '#1565c0',
    'U':   '#ef9a9a',
    'F':   '#2e7d32',
    'M':   '#bdbdbd',
    'M+A': '#c8e6c9',
}

# ══════════════════════════════════════════════════════════
#  Helper functions
# ══════════════════════════════════════════════════════════

def get_layer(name):
    layers = QgsProject.instance().mapLayersByName(name)
    if not layers:
        raise ValueError(f"ไม่พบ layer '{name}' ใน QGIS Layers panel")
    return layers[0]


def run_zonal_stats(raster_layer, landuse_layer, prefix, tmp_path):
    """Clone landuse layer, รัน zonal stats, คืน work_layer"""
    QgsVectorFileWriter.writeAsVectorFormat(
        landuse_layer, tmp_path, "UTF-8",
        landuse_layer.crs(), "GPKG"
    )
    work = QgsVectorLayer(tmp_path, "work", "ogr")
    if not work.isValid():
        raise RuntimeError(f"โหลด temp layer ไม่ได้: {tmp_path}")

    zs = QgsZonalStatistics(
        work, raster_layer, prefix, 1,
        QgsZonalStatistics.Sum | QgsZonalStatistics.Count
    )
    zs.calculateStatistics(None)
    return work


def aggregate_by_class(work_layer, sum_field, count_field):
    """Group by LUL_CODE แล้วรวม pixel"""
    grouped = defaultdict(lambda: {"flood_px": 0, "total_px": 0})
    for feat in work_layer.getFeatures():
        code = str(feat[FIELD_LUL_CODE]).strip() if feat[FIELD_LUL_CODE] else "?"
        grouped[code]["flood_px"] += feat[sum_field]   or 0
        grouped[code]["total_px"] += feat[count_field] or 0
    return grouped


def build_results(grouped):
    """แปลง grouped dict → list ของ result"""
    results = []
    for code in sorted(grouped.keys()):
        d = grouped[code]
        flood_km2 = d["flood_px"] * PIXEL_AREA_KM2
        total_km2 = d["total_px"] * PIXEL_AREA_KM2
        flood_rai = d["flood_px"] * PIXEL_AREA_RAI
        total_rai = d["total_px"] * PIXEL_AREA_RAI
        pct       = (d["flood_px"] / d["total_px"] * 100) if d["total_px"] > 0 else 0

        results.append({
            "code":        code,
            "label":       LU_LABELS.get(code, code),
            "color":       LU_COLORS.get(code, "#bdbdbd"),
            "flood_km2":   round(flood_km2, 4),
            "flood_rai":   round(flood_rai, 1),
            "total_km2":   round(total_km2, 4),
            "total_rai":   round(total_rai, 1),
            "pct_flooded": round(pct, 2),
        })

    results.sort(key=lambda x: x["flood_km2"], reverse=True)
    return results


def print_table(results, title):
    total = sum(r["flood_km2"] for r in results)
    print(f"\n{'═'*68}")
    print(f"  {title}")
    print(f"{'═'*68}")
    print(f"{'Class':<6} {'ประเภท':<24} {'ท่วม (ตร.กม.)':>13} {'ท่วม (ไร่)':>11} {'% ท่วม':>8}")
    print(f"{'─'*68}")
    for r in results:
        print(f"{r['code']:<6} {r['label']:<24} {r['flood_km2']:>13.3f} {r['flood_rai']:>11.0f} {r['pct_flooded']:>7.1f}%")
    print(f"{'─'*68}")
    print(f"{'รวม':<6} {'':<24} {total:>13.3f} {total*625:>11.0f}")


def save_json(data, path):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"  ✅ {path}")


# ══════════════════════════════════════════════════════════
#  โหลด layer
# ══════════════════════════════════════════════════════════

print("โหลด layer...")
thresh_raster  = get_layer(THRESH_RASTER_NAME)
rf_raster      = get_layer(RF_RASTER_NAME)
landuse_layer  = get_layer(LANDUSE_LAYER_NAME)
print(f"  Threshold raster : {thresh_raster.name()}")
print(f"  RF raster        : {rf_raster.name()}")
print(f"  Land Use vector  : {landuse_layer.name()} ({landuse_layer.featureCount()} features)")

# ══════════════════════════════════════════════════════════
#  1) Threshold × Land Use
# ══════════════════════════════════════════════════════════

print("\n[1/2] Zonal Stats: flood_thresh × LU...")
tmp1 = os.path.join(OUTPUT_DIR, "_tmp_thresh.gpkg")
work1 = run_zonal_stats(thresh_raster, landuse_layer, "t_", tmp1)
grouped1 = aggregate_by_class(work1, "t_sum", "t_count")
results_thresh = build_results(grouped1)
print_table(results_thresh, "Threshold (−17 dB)")

# ══════════════════════════════════════════════════════════
#  2) RF Classification × Land Use
# ══════════════════════════════════════════════════════════

print("\n[2/2] Zonal Stats: flood_rf_result × LU...")
tmp2 = os.path.join(OUTPUT_DIR, "_tmp_rf.gpkg")
work2 = run_zonal_stats(rf_raster, landuse_layer, "r_", tmp2)
grouped2 = aggregate_by_class(work2, "r_sum", "r_count")
results_rf = build_results(grouped2)
print_table(results_rf, "RF Classification")

# ══════════════════════════════════════════════════════════
#  Export JSON
# ══════════════════════════════════════════════════════════

print("\nบันทึกไฟล์...")

# แยกไฟล์
save_json({
    "method": "threshold",
    "flood_layer": THRESH_RASTER_NAME,
    "classes": results_thresh,
    "summary": {
        "total_flooded_km2": round(sum(r["flood_km2"] for r in results_thresh), 4),
        "total_flooded_rai": round(sum(r["flood_rai"] for r in results_thresh), 1),
    }
}, os.path.join(OUTPUT_DIR, "flood_by_landuse_thresh.json"))

save_json({
    "method": "rf_classification",
    "flood_layer": RF_RASTER_NAME,
    "classes": results_rf,
    "summary": {
        "total_flooded_km2": round(sum(r["flood_km2"] for r in results_rf), 4),
        "total_flooded_rai": round(sum(r["flood_rai"] for r in results_rf), 1),
    }
}, os.path.join(OUTPUT_DIR, "flood_by_landuse_rf.json"))

# ไฟล์รวม (ใช้บนเว็บ — มีทั้ง 2 method)
save_json({
    "generated_by": "QGIS Python Console — flood_stats_all_qgis.py",
    "threshold": {
        "classes": results_thresh,
        "summary": {
            "total_flooded_km2": round(sum(r["flood_km2"] for r in results_thresh), 4),
            "total_flooded_rai": round(sum(r["flood_rai"] for r in results_thresh), 1),
        }
    },
    "rf_classification": {
        "classes": results_rf,
        "summary": {
            "total_flooded_km2": round(sum(r["flood_km2"] for r in results_rf), 4),
            "total_flooded_rai": round(sum(r["flood_rai"] for r in results_rf), 1),
        }
    }
}, os.path.join(OUTPUT_DIR, "flood_by_landuse.json"))

# ล้าง temp
for tmp in [tmp1, tmp2]:
    try: os.remove(tmp)
    except: pass

print("\n🎉 เสร็จสิ้น!")
