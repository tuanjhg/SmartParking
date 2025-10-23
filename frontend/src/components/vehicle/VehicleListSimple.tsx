/**
 * Simple Vehicle List Component (for departed vehicles)
 */

'use client';

import React from 'react';
import { Car } from 'lucide-react';
import { formatTime } from '@/lib/utils';
import type { Vehicle } from '@/types/vehicle';

interface VehicleListSimpleProps {
  vehicles: Vehicle[];
}

export default function VehicleListSimple({ vehicles }: VehicleListSimpleProps) {
  if (vehicles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500 py-10">
        <Car className="w-12 h-12 mb-2" />
        <span className="text-sm">No vehicles to display.</span>
      </div>
    );
  }

  return (
    <div className="space-y-3 max-h-[400px] overflow-y-auto">
      {vehicles.map((vehicle) => (
        <div 
          key={vehicle.id}
          className="bg-gray-700 rounded-lg p-3 flex flex-col sm:flex-row sm:items-center justify-between transition-all duration-300 hover:bg-gray-600"
        >
          <div className="mb-2 sm:mb-0">
            <div className="font-mono text-lg font-semibold text-white tracking-wider">{vehicle.id}</div>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <span>🕐</span>
              <span>{formatTime(vehicle.checkInTime)}</span>
              {vehicle.status === 'departed' && vehicle.checkOutTime && (
                <>
                  <span className="text-gray-500">&rarr;</span>
                  <span>{formatTime(vehicle.checkOutTime)}</span>
                </>
              )}
            </div>
          </div>
          {vehicle.status === 'departed' && vehicle.cost !== undefined && vehicle.duration && (
            <div className="text-left sm:text-right">
              <div className="text-lg font-semibold text-green-400">${vehicle.cost.toFixed(2)}</div>
              <div className="text-sm text-gray-400">{vehicle.duration}</div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
