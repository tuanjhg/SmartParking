/**
 * Combined Vehicle List Component (Backend + Local Simulation)
 */

'use client';

import React from 'react';
import { Car } from 'lucide-react';
import { formatTime } from '@/lib/utils';
import type { VehicleInfo } from '@/types';
import type { Vehicle } from '@/types/vehicle';

interface VehicleListCombinedProps {
  backendVehicles: VehicleInfo[];
  localVehicles: Vehicle[];
}

export default function VehicleListCombined({ backendVehicles, localVehicles }: VehicleListCombinedProps) {
  if (backendVehicles.length === 0 && localVehicles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500 py-10">
        <Car className="w-12 h-12 mb-2" />
        <span className="text-sm">No vehicles to display.</span>
      </div>
    );
  }

  return (
    <div className="space-y-3 max-h-[400px] overflow-y-auto">
      {/* Backend vehicles first */}
      {backendVehicles.map((vehicle) => (
        <div 
          key={`backend-${vehicle.slot_id}`}
          className="bg-gray-700 rounded-lg p-3 flex flex-col sm:flex-row sm:items-center justify-between transition-all duration-300 hover:bg-gray-600"
        >
          <div className="mb-2 sm:mb-0">
            <div className="flex items-center gap-2">
              <span className="font-mono text-lg font-semibold text-white tracking-wider">{vehicle.license_plate}</span>
              <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full">DB</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <span>🅿️ {vehicle.slot_id}</span>
              <span className="text-gray-500">•</span>
              <span>🕐</span>
              <span>{new Date(vehicle.arrival_time).toLocaleTimeString()}</span>
            </div>
          </div>
        </div>
      ))}
      
      {/* Local simulation vehicles */}
      {localVehicles.map((vehicle) => (
        <div 
          key={`local-${vehicle.id}`}
          className="bg-gray-700 rounded-lg p-3 flex flex-col sm:flex-row sm:items-center justify-between transition-all duration-300 hover:bg-gray-600"
        >
          <div className="mb-2 sm:mb-0">
            <div className="flex items-center gap-2">
              <span className="font-mono text-lg font-semibold text-white tracking-wider">{vehicle.id}</span>
              <span className="text-xs bg-purple-600 text-white px-2 py-0.5 rounded-full">SIM</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <span>🕐</span>
              <span>{formatTime(vehicle.checkInTime)}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
