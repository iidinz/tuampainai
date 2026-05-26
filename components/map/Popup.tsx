'use client';

import type { AffectedBuilding } from '@/types/building';
import Badge from '@/components/ui/Badge';
import { getSeverityColor } from '@/lib/utils/colors';

interface PopupProps {
  building: AffectedBuilding;
}

export default function BuildingPopup({ building }: PopupProps) {
  const { severity, floodDepth, tambon, buildingType } = building.properties;

  return (
    <div className="p-2 min-w-[180px]">
      <div className="flex items-center justify-between mb-2">
        <Badge label={severity} color={getSeverityColor(severity)} />
        {buildingType && (
          <span className="text-xs text-slate-500 capitalize">{buildingType}</span>
        )}
      </div>
      <div className="space-y-1 text-xs text-slate-600">
        <div>Flood depth: <span className="font-medium text-slate-900">{floodDepth.toFixed(2)} m</span></div>
        <div>Tambon: <span className="font-medium text-slate-900">{tambon}</span></div>
      </div>
    </div>
  );
}
