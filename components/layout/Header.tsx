'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Droplets } from 'lucide-react';

const NAV_ITEMS = [
  { href: '/', label: 'แผนที่' },
  { href: '/about', label: 'เกี่ยวกับ' },
];

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="h-12 shrink-0 flex items-center justify-between px-4 md:px-6
                       bg-white/95 backdrop-blur border-b border-blue-100 z-50">
      {/* Brand */}
      <div className="flex items-center gap-2">
        <Droplets size={18} className="text-blue-600" />
        <div className="flex flex-col leading-none">
          <span className="text-base font-bold text-blue-900 tracking-tight">
            TuamPaiNai
          </span>
          <span className="text-[10px] text-blue-400 font-normal">
            ท่วมไปไหน
          </span>
        </div>
      </div>

      {/* Nav — label ย่อบนมือถือ */}
      <nav className="flex items-center gap-0.5">
        {NAV_ITEMS.map(({ href, label }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
                          ${isActive
                            ? 'text-blue-700 bg-blue-50'
                            : 'text-slate-400 hover:text-blue-700 hover:bg-blue-50'
                          }`}
            >
              {label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
