'use client';

interface BadgeProps {
  label: string;
  color: string;
}

export default function Badge({ label, color }: BadgeProps) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium"
      style={{ backgroundColor: `${color}20`, color }}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: color }}
      />
      {label}
    </span>
  );
}
