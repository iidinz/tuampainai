import type { TambonStats } from '@/types/stats';

export const mockSummary = {
  affectedBuildings: null as number | null,
  severe: null as number | null,
  tambonsAffected: null as number | null,
  percentOfTotal: null as number | null,
};

export const mockSeverityBreakdown: Record<string, number | null> = {
  severe: null,
  moderate: null,
  light: null,
  safe: null,
};

export const mockTopTambons: TambonStats[] = [];
