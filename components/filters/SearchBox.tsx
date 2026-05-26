'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X, MapPin } from 'lucide-react';

export interface AmphoeFeature {
  type: 'Feature';
  properties: {
    AMP_CODE: string;
    PRV_CODE: string;
    AMP_NAME_T: string;
    AMP_NAME_E: string;
    Shape_Leng: number;
    Shape_Area: number;
  };
  geometry: GeoJSON.Geometry;
}

interface Props {
  onSelect: (feature: AmphoeFeature | null) => void;
}

export default function SearchBox({ onSelect }: Props) {
  const [query, setQuery] = useState('');
  const [features, setFeatures] = useState<AmphoeFeature[]>([]);
  const [results, setResults] = useState<AmphoeFeature[]>([]);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<AmphoeFeature | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // โหลด GeoJSON ครั้งเดียว
  useEffect(() => {
    fetch('/data/vector/amarea_ayutthaya.geojson')
      .then((r) => r.json())
      .then((geojson) => {
        setFeatures(geojson.features as AmphoeFeature[]);
      })
      .catch((err) => console.warn('[SearchBox] load amphoe error:', err));
  }, []);

  // กรองผลลัพธ์ตาม query
  useEffect(() => {
    if (!query.trim()) {
      setResults(features); // แสดงทั้งหมดเมื่อยังไม่พิมพ์
      return;
    }
    const q = query.trim().toLowerCase();
    const filtered = features.filter((f) => {
      const t = f.properties.AMP_NAME_T?.toLowerCase() ?? '';
      const e = f.properties.AMP_NAME_E?.toLowerCase() ?? '';
      return t.includes(q) || e.includes(q);
    });
    setResults(filtered);
  }, [query, features]);

  // ปิด dropdown เมื่อคลิกข้างนอก
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = useCallback(
    (feature: AmphoeFeature) => {
      setSelected(feature);
      setQuery('');
      setOpen(false);
      onSelect(feature);
    },
    [onSelect],
  );

  const handleClear = useCallback(() => {
    setSelected(null);
    setQuery('');
    onSelect(null);
  }, [onSelect]);

  return (
    <div ref={wrapperRef} className="absolute top-3 left-3 z-20 w-64">
      {/* ── Input ───────────────────────────────────────────────────── */}
      <div
        className="flex items-center gap-2 rounded-lg border border-blue-100
                   bg-white/95 backdrop-blur px-3 py-2
                   shadow-lg shadow-blue-100/40
                   focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100
                   transition-all"
      >
        <Search size={13} className="text-blue-300 shrink-0" />

        {selected ? (
          <div className="flex items-center gap-1.5 flex-1 min-w-0">
            <MapPin size={12} className="text-blue-500 shrink-0" />
            <span className="text-[13px] text-blue-900 truncate">
              {selected.properties.AMP_NAME_T}
            </span>
            <button
              onClick={handleClear}
              className="ml-auto shrink-0 text-slate-400 hover:text-red-400 transition-colors"
            >
              <X size={13} />
            </button>
          </div>
        ) : (
          <input
            type="text"
            placeholder="ค้นหาอำเภอ…"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            className="w-full bg-transparent text-[13px] text-blue-900
                       placeholder:text-blue-200 outline-none"
          />
        )}
      </div>

      {/* ── Dropdown ────────────────────────────────────────────────── */}
      {open && !selected && (
        <div
          className="mt-1 max-h-60 overflow-y-auto rounded-lg border border-blue-100
                     bg-white/95 backdrop-blur shadow-xl shadow-blue-100/30
                     divide-y divide-blue-50"
        >
          {results.length === 0 ? (
            <div className="px-3 py-3 text-[12px] text-slate-400 text-center">
              ไม่พบอำเภอ
            </div>
          ) : (
            results.map((f) => (
              <button
                key={f.properties.AMP_CODE}
                onClick={() => handleSelect(f)}
                className="w-full text-left px-3 py-2 hover:bg-blue-50
                           transition-colors flex items-center gap-2"
              >
                <MapPin size={12} className="text-blue-400 shrink-0" />
                <div className="min-w-0">
                  <div className="text-[13px] text-slate-800 truncate">
                    {f.properties.AMP_NAME_T}
                  </div>
                  <div className="text-[11px] text-slate-400 truncate">
                    {f.properties.AMP_NAME_E}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
