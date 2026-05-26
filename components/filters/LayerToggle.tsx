'use client';

// LayerToggle ใน Sidebar — แสดงรายชื่อ layer สั้น ๆ (ไม่มี opacity slider)
// สำหรับ opacity + group ใช้ LayerControlPanel บนแผนที่แทน
import { Layers } from 'lucide-react';
import { LAYER_CONFIGS } from '@/config/layers';

export default function LayerToggle() {
  return (
    <div>
      <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 mb-2">
        <Layers size={13} />
        Layers
      </div>
      <p className="text-xs text-slate-400 leading-snug">
        ควบคุม layer ได้จากปุ่ม&nbsp;
        <span className="font-medium text-slate-500">Layers</span>&nbsp;
        บนแผนที่ด้านขวาบน
      </p>
      <div className="mt-2 space-y-1">
        {LAYER_CONFIGS.map((layer) => (
          <div
            key={layer.id}
            className="flex items-center gap-2 text-xs text-slate-600"
          >
            <span className="h-2 w-2 rounded-full bg-blue-400 shrink-0" />
            {layer.label}
          </div>
        ))}
      </div>
    </div>
  );
}
