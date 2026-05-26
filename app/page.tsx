'use client';

import dynamic from 'next/dynamic';
import Header from '@/components/layout/Header';

const MapView = dynamic(() => import('@/components/map/MapView'), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center bg-blue-50 text-blue-300 text-sm">
      Loading map…
    </div>
  ),
});

export default function HomePage() {
  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Header />
      <main className="flex-1 relative overflow-hidden">
        <MapView />
      </main>
    </div>
  );
}
