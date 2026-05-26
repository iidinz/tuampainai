export function formatNumber(value: number | null): string {
  if (value === null || value === undefined) return '—';
  return value.toLocaleString();
}

export function formatPercent(value: number | null): string {
  if (value === null || value === undefined) return '—';
  return `${value.toFixed(1)}%`;
}
