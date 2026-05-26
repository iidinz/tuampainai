import type { Severity } from './building';

export interface TambonStats {
  tambon: string;
  total: number;
  affected: number;
  bySeverity: Record<Severity, number>;
}
