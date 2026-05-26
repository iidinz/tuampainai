import type { StyleSpecification } from 'maplibre-gl';

export const LIGHT_STYLE = 'https://tiles.openfreemap.org/styles/positron';

export const SATELLITE_STYLE: StyleSpecification = {
  version: 8,
  sources: {
    satellite: {
      type: 'raster',
      tiles: [
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      ],
      tileSize: 256,
      attribution: 'Tiles © Esri',
    },
  },
  layers: [
    {
      id: 'satellite',
      type: 'raster',
      source: 'satellite',
    },
  ],
};
