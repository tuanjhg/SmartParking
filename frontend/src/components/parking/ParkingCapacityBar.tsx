/**
 * Parking Capacity Bar Component
 */

'use client';

import React from 'react';
import { Ban } from 'lucide-react';

interface ParkingCapacityBarProps {
  currentOccupancy: number;
  maxCapacity: number;
}

export default function ParkingCapacityBar({ currentOccupancy, maxCapacity }: ParkingCapacityBarProps) {
  const percentage = (currentOccupancy / maxCapacity) * 100;
  const isFull = currentOccupancy >= maxCapacity;

  return (
    <div className="mt-6 bg-gray-800 rounded-lg shadow-lg p-4 border border-gray-700">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-semibold text-white">Garage Capacity</h3>
        <span className={`text-lg font-bold ${isFull ? 'text-red-400' : 'text-blue-300'}`}>
          {currentOccupancy} / {maxCapacity} Slots Filled
        </span>
      </div>
      <div className="w-full bg-gray-700 rounded-full h-4 overflow-hidden">
        <div 
          className={`h-4 rounded-full transition-all duration-500 ${isFull ? 'bg-red-500' : 'bg-blue-500'}`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
      {isFull && (
        <div className="flex items-center gap-2 text-red-400 mt-2">
          <Ban className="w-4 h-4" />
          <span className="font-semibold">GARAGE IS FULL</span>
        </div>
      )}
    </div>
  );
}
