# /public/data — ไฟล์ข้อมูล GeoTIFF

วางไฟล์ raster ทั้งหมดในโฟลเดอร์นี้ ระบบจะโหลดผ่าน MapLibre GL JS

## ไฟล์ที่ต้องการ

| ไฟล์ | คำอธิบาย | หน่วย |
|------|-----------|-------|
| `dem.tif` | Digital Elevation Model | เมตร |
| `slope.tif` | ความลาดชัน (คำนวณจาก DEM) | องศา |
| `sar_vv.tif` | Sentinel-1 VV backscatter | dB |
| `sar_vh.tif` | Sentinel-1 VH backscatter | dB |
| `flood_threshold.tif` | พื้นที่น้ำท่วม — threshold VV < −17 dB | binary (0/1) |
| `flood_classification.tif` | พื้นที่น้ำท่วม — ML classification | binary (0/1) |
| `landuse.tif` | การใช้ประโยชน์ที่ดิน | class value |

## ข้อกำหนด Projection

- **EPSG:4326** (WGS84) หรือ **EPSG:3857** (Web Mercator)
- ไฟล์ควรมี `.tfw` หรือ embedded GeoTransform ครบถ้วน
- หากเป็น COG (Cloud-Optimized GeoTIFF) จะโหลดได้เร็วกว่า

## การแปลงไฟล์ด้วย GDAL

```bash
# แปลงเป็น EPSG:4326 และทำ COG
gdal_translate -of COG -co COMPRESS=DEFLATE \
  -t_srs EPSG:4326 input.tif output_cog.tif

# ตรวจสอบ projection
gdalinfo dem.tif | grep -E "PROJ|EPSG|Origin|Pixel"
```

## Land Use Class Values

| Value | ประเภท |
|-------|--------|
| 1 | เกษตรกรรม |
| 2 | นาข้าว |
| 3 | ชุมชน / สิ่งปลูกสร้าง |
| 4 | ป่าไม้ |
| 5 | แหล่งน้ำ |
| 6 | พื้นที่เปิดโล่ง |
| 7 | อื่น ๆ |
