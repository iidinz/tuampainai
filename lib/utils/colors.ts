import { SEVERITY_COLORS } from '@/lib/map/constants';
import type { Severity } from '@/types/building';

export function getSeverityColor(severity: Severity): string {
  return SEVERITY_COLORS[severity];
}
