'use client';

import { useRef, useCallback, useState } from 'react';
import Map, { NavigationControl, ScaleControl, type MapRef } from 'react-map-gl/maplibre';
import { STUDY_CENTER, DEFAULT_ZOOM } from '@/lib/map/constants';
import type { RasterId, VectorId } from '@/lib/map/constants';
import { PNG_FILES } from '@/lib/map/constants';
import { LIGHT_STYLE, SATELLITE_STYLE } from '@/lib/map/style';
import SearchBox, { type AmphoeFeature } from '@/components/filters/SearchBox';
import Legend from './Legend';
import LayerControlPanel from './LayerControlPanel';
import RasterLayer, { COLORMAPS } from './RasterLayer';
import PngRasterLayer, { type PngLayerId } from './PngRasterLayer';
import VectorLayer from './VectorLayer';
import ClickInspector from './ClickInspector';
import AmphoeLayer from './AmphoeLayer';
import AmphoeStats from './AmphoeStats';
import StatsPanel from './StatsPanel';

// ── รวม layer id ทั้งหมด ────────────────────────────────────────────────────
type AnyLayerId = RasterId | VectorId;

interface ActiveLayer {
  id: AnyLayerId;
  opacity: number;
  type: 'raster' | 'vector';
}

const DEFAULT_ACTIVE: ActiveLayer[] = [
  { id: 'flood_classification', opacity: 0.8, type: 'raster' },
];

// colormap ที่ใช้แต่ละ raster layer (georaster)
const RASTER_COLORMAPS: Partial<Record<RasterId,
  (v: number, min: number, max: number) => [number, number, number, number]
>> = {
  flood_threshold:      COLORMAPS.classification,
  flood_classification: COLORMAPS.classification,
  sar_vv:               COLORMAPS.grey,
  sar_vh:               COLORMAPS.grey,
  dem:                  COLORMAPS.viridis,
};

export default function MapView() {
  const mapRef = useRef<MapRef>(null);
  const [activeLayers, setActiveLayers] = useState<ActiveLayer[]>(DEFAULT_ACTIVE);
  const [basemap, setBasemap] = useState<'light' | 'satellite'>('light');
  const [selectedAmphoe, setSelectedAmphoe] = useState<AmphoeFeature | null>(null);

  const toggleLayer = useCallback((id: AnyLayerId, type: 'raster' | 'vector') => {
    setActiveLayers((prev) => {
      const exists = prev.find((l) => l.id === id);
      if (exists) return prev.filter((l) => l.id !== id);
      return [...prev, { id, opacity: 0.8, type }];
    });
  }, []);

  const setOpacity = useCallback((id: AnyLayerId, opacity: number) => {
    setActiveLayers((prev) =>
      prev.map((l) => (l.id === id ? { ...l, opacity } : l))
    );
  }, []);

  return (
    <div className="relative h-full w-full">
      <Map
        ref={mapRef}
        initialViewState={{
          longitude: STUDY_CENTER[0],
          latitude: STUDY_CENTER[1],
          zoom: DEFAULT_ZOOM,
        }}
        mapStyle={basemap === 'light' ? LIGHT_STYLE : SATELLITE_STYLE}
        style={{ width: '100%', height: '100%' }}
      >
        <NavigationControl position="top-right" />
        <ScaleControl position="bottom-left" />

        {/* ── GeoTIFF raster layers (georaster) ────────────────────────── */}
        {activeLayers
          .filter((l) => l.type === 'raster')
          .map(({ id, opacity }) => {
            if (id in PNG_FILES) {
              return (
                <PngRasterLayer
                  key={`${basemap}-${id}`}
                  id={id as PngLayerId}
                  opacity={opacity}
                />
              );
            }

            return (
              <RasterLayer
                key={`${basemap}-${id}`}
                id={id as RasterId}
                opacity={opacity}
                colormap={RASTER_COLORMAPS[id as RasterId]}
              />
            );
          })}

        {/* ── Vector layers (GeoJSON) ───────────────────────────────────── */}
        {activeLayers
          .filter((l) => l.type === 'vector')
          .map(({ id, opacity }) => (
            <VectorLayer
              key={`${basemap}-${id}`}
              id={id as VectorId}
              opacity={opacity}
            />
          ))}

        {/* ── Click to inspect ─────────────────────────────────────────── */}
        <ClickInspector />

        {/* ── Amphoe layer (selected district boundary) ─────────────────── */}
        <AmphoeLayer key={basemap} feature={selectedAmphoe} />
      </Map>

      {/* ── UI overlays ──────────────────────────────────────────────────── */}
      <SearchBox onSelect={setSelectedAmphoe} />
      <AmphoeStats feature={selectedAmphoe} />
      <Legend activeLayers={activeLayers.map((l) => l.id)} />
      <StatsPanel />
      <LayerControlPanel
        activeLayers={activeLayers as Parameters<typeof LayerControlPanel>[0]['activeLayers']}
        onToggle={(id: string, type) => toggleLayer(id as AnyLayerId, type)}
        onOpacityChange={(id: string, opacity) => setOpacity(id as AnyLayerId, opacity)}
        basemap={basemap}
        onBasemapChange={setBasemap}
      />
    </div>
  );
}
