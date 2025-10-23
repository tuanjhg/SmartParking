'use client';

import React from 'react';
import { Car, CheckCircle, Map } from 'lucide-react';

interface ParkingSlot {
  id: string;
  status: 'occupied' | 'vacant';
  plate: string | null;
  checkInTime?: Date;
}

interface ParkingMapProps {
  slots: ParkingSlot[];
}

interface ParkingSlotProps {
  slot: ParkingSlot;
}

/**
 * Displays a single parking slot.
 */
function ParkingSlotDisplay({ slot }: ParkingSlotProps) {
  const isOccupied = slot.status === 'occupied';
  
  return (
    <div 
      className={`rounded-lg p-3 shadow-md border-2 transition-all duration-300 ${
        isOccupied 
          ? 'bg-red-900 border-red-700' 
          : 'bg-green-900 border-green-700'
      }`}
    >
      <div className="flex justify-between items-center mb-2">
        <span className="font-bold text-lg text-white">{slot.id}</span>
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
          isOccupied 
            ? 'bg-red-300 text-red-900' 
            : 'bg-green-300 text-green-900'
        }`}>
          {isOccupied ? 'Occupied' : 'Vacant'}
        </span>
      </div>
      <div className="flex flex-col items-center justify-center min-h-[60px]">
        {isOccupied ? (
          <>
            <Car className="w-8 h-8 text-red-300 mb-1" />
            <span className="font-mono text-sm text-red-200 tracking-wider break-all text-center">
              {slot.plate}
            </span>
          </>
        ) : (
          <CheckCircle className="w-8 h-8 text-green-400 opacity-70" />
        )}
      </div>
    </div>
  );
}

/**
 * Displays a grid of all parking slots.
 */
function ParkingMap({ slots }: ParkingMapProps) {
  console.log('ParkingMap rendering with slots:', slots.length, slots.filter(s => s.status === 'occupied').length, 'occupied');
  
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 p-2 bg-gray-900 rounded-lg">
      {slots.map(slot => (
        <ParkingSlotDisplay key={slot.id} slot={slot} />
      ))}
    </div>
  );
}

export default React.memo(ParkingMap);
