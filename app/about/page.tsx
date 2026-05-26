import Header from '@/components/layout/Header';
import { Satellite, Layers, FlaskConical, Map } from 'lucide-react';

const LAYERS = [
  {
    icon: <Map size={18} className="text-blue-400" />,
    label: 'DEM',
    desc: 'แบบจำลองระดับความสูงของพื้นดิน',
    sub: 'SRTM / Copernicus DEM 30m',
  },
  {
    icon: <Map size={18} className="text-blue-400" />,
    label: 'Slope',
    desc: 'ความลาดชันของพื้นที่',
    sub: 'คำนวณจาก DEM',
  },
  {
    icon: <Satellite size={18} className="text-indigo-400" />,
    label: 'SAR VV',
    desc: 'ค่าสะท้อนกลับแนวตั้ง (VV)',
    sub: 'Sentinel-1A GRD',
  },
  {
    icon: <Satellite size={18} className="text-indigo-400" />,
    label: 'SAR VH',
    desc: 'ค่าสะท้อนกลับแนวนอน (VH)',
    sub: 'Sentinel-1A GRD',
  },
  {
    icon: <Layers size={18} className="text-blue-500" />,
    label: 'น้ำท่วม — Threshold',
    desc: 'พื้นที่น้ำท่วมจาก VV < −17 dB',
    sub: 'Binary mask',
  },
  {
    icon: <FlaskConical size={18} className="text-blue-600" />,
    label: 'น้ำท่วม — Classification',
    desc: 'พื้นที่น้ำท่วมจาก ML classification',
    sub: 'Binary mask',
  },
  {
    icon: <Layers size={18} className="text-green-500" />,
    label: 'การใช้ประโยชน์ที่ดิน',
    desc: 'Land Use / Land Cover',
    sub: 'กรมพัฒนาที่ดิน',
  },
];

const SOURCES = [
  { label: 'ดาวเทียม', value: 'Sentinel-1A' },
  { label: 'ความถี่', value: 'C-band (5.4 GHz)' },
  { label: 'ความละเอียด', value: '10 × 10 เมตร' },
  { label: 'โหมด', value: 'IW GRD' },
];

export default function AboutPage() {
  return (
    <div className="flex flex-col bg-white">
      <Header />

      <main className="flex-1 overflow-y-auto">
        {/* ── Hero ───────────────────────────────────────────────── */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-800 px-6 py-14 md:py-20 text-white text-center">
          <p className="text-blue-200 text-sm font-medium tracking-widest uppercase mb-3">
            Flood Monitoring System
          </p>
          <h1 className="text-2xl md:text-4xl font-bold leading-snug">
            ท่วมไปไหน
          </h1>
          <p className="mt-3 text-blue-100 text-base md:text-lg max-w-md mx-auto leading-relaxed">
            ระบบติดตามพื้นที่น้ำท่วมจากข้อมูลดาวเทียม SAR
          </p>
        </div>

        <div className="max-w-2xl mx-auto px-5 py-10 space-y-12">

          {/* ── ข้อมูลดาวเทียม ─────────────────────────────────────── */}
          <section>
            <h2 className="text-lg font-semibold text-blue-900 mb-4">
              ข้อมูลดาวเทียม
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {SOURCES.map(({ label, value }) => (
                <div key={label}
                     className="rounded-xl border border-blue-100 bg-blue-50/50 px-4 py-3">
                  <div className="text-xs text-blue-400 font-medium mb-0.5">{label}</div>
                  <div className="text-sm font-semibold text-blue-900">{value}</div>
                </div>
              ))}
            </div>
          </section>

          {/* ── ชั้นข้อมูล ──────────────────────────────────────────── */}
          <section>
            <h2 className="text-lg font-semibold text-blue-900 mb-4">
              ชั้นข้อมูลในระบบ
            </h2>
            <div className="space-y-2">
              {LAYERS.map(({ icon, label, desc, sub }) => (
                <div key={label}
                     className="flex items-start gap-4 rounded-xl border border-blue-50
                                bg-white px-4 py-3.5 shadow-sm shadow-blue-50">
                  <div className="mt-0.5 shrink-0">{icon}</div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-blue-900">{label}</div>
                    <div className="text-sm text-slate-500 mt-0.5">{desc}</div>
                    <div className="text-xs text-blue-300 mt-0.5">{sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

        </div>
      </main>
    </div>
  );
}
