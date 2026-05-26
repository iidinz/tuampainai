import fs from 'node:fs/promises';
import path from 'node:path';
import zlib from 'node:zlib';
import parseGeoraster from 'georaster';

const ROOT = process.cwd();
const RASTER_DIR = path.join(ROOT, 'public', 'data', 'raster');
const MAX_DIM = 2048;

const OVERLAYS = [
  {
    id: 'flood_threshold',
    input: 'flood_thresh.tif',
    output: 'flood_thresh_overlay.png',
    color: (value) => (value >= 1 ? [13, 71, 161, 210] : [0, 0, 0, 0]),
  },
  {
    id: 'sar_vv',
    input: 'vv_s1a.tif',
    output: 'vv_s1a_overlay.png',
    color: grey,
  },
  {
    id: 'sar_vh',
    input: 'vh_s1a.tif',
    output: 'vh_s1a_overlay.png',
    color: grey,
  },
];

function grey(value, min, max) {
  const t = Math.max(0, Math.min(1, (value - min) / (max - min)));
  const c = Math.round(t * 255);
  return [c, c, c, 200];
}

function makeCrcTable() {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c >>> 0;
  }
  return table;
}

const CRC_TABLE = makeCrcTable();

function crc32(buf) {
  let c = 0xffffffff;
  for (const byte of buf) {
    c = CRC_TABLE[(c ^ byte) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const typeBuf = Buffer.from(type);
  const out = Buffer.alloc(12 + data.length);
  out.writeUInt32BE(data.length, 0);
  typeBuf.copy(out, 4);
  data.copy(out, 8);
  out.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 8 + data.length);
  return out;
}

function encodePng(width, height, rgba) {
  const stride = width * 4;
  const raw = Buffer.alloc((stride + 1) * height);
  for (let row = 0; row < height; row++) {
    const rawOffset = row * (stride + 1);
    raw[rawOffset] = 0;
    rgba.copy(raw, rawOffset + 1, row * stride, (row + 1) * stride);
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

async function generateOverlay(config) {
  const inputPath = path.join(RASTER_DIR, config.input);
  const outputPath = path.join(RASTER_DIR, config.output);
  const buffer = await fs.readFile(inputPath);
  const georaster = await parseGeoraster(buffer);

  const { width, height, values, mins, maxs, noDataValue, xmin, ymin, xmax, ymax } = georaster;
  const scale = Math.min(1, MAX_DIM / Math.max(width, height));
  const outW = Math.max(1, Math.round(width * scale));
  const outH = Math.max(1, Math.round(height * scale));
  const rgba = Buffer.alloc(outW * outH * 4);
  const band = values[0];
  const min = mins[0];
  const max = maxs[0];

  for (let row = 0; row < outH; row++) {
    const srcRow = Math.min(Math.round(row / scale), height - 1);
    for (let col = 0; col < outW; col++) {
      const srcCol = Math.min(Math.round(col / scale), width - 1);
      const value = band[srcRow]?.[srcCol];
      const offset = (row * outW + col) * 4;
      if (value == null || Number.isNaN(value) || value === noDataValue || value === 0) {
        rgba[offset + 3] = 0;
        continue;
      }
      const [r, g, b, a] = config.color(value, min, max);
      rgba[offset] = r;
      rgba[offset + 1] = g;
      rgba[offset + 2] = b;
      rgba[offset + 3] = a;
    }
  }

  const png = encodePng(outW, outH, rgba);
  await fs.writeFile(outputPath, png);

  return {
    id: config.id,
    file: config.output,
    width,
    height,
    outW,
    outH,
    size: png.length,
    extent: [xmin, ymin, xmax, ymax],
  };
}

const results = [];
for (const overlay of OVERLAYS) {
  console.log(`Generating ${overlay.output}...`);
  results.push(await generateOverlay(overlay));
}

console.log(JSON.stringify(results, null, 2));
