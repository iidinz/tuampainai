import { SEVERITY_COLORS } from './constants';

export const floodLayerPaint = {
  'fill-color': '#3B82F6',
  'fill-opacity': 0.3,
};

export const buildingLayerPaint = {
  'fill-color': [
    'match',
    ['get', 'severity'],
    'severe', SEVERITY_COLORS.severe,
    'moderate', SEVERITY_COLORS.moderate,
    'light', SEVERITY_COLORS.light,
    'safe', SEVERITY_COLORS.safe,
    '#94a3b8',
  ],
  'fill-opacity': 0.7,
  'fill-outline-color': '#334155',
};
