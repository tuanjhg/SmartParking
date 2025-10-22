'use client';

import React from 'react';
import { X, Map } from 'lucide-react';
import ParkingMap from './ParkingMap';

interface ParkingSlot {
  id: string;
  status: 'occupied' | 'vacant';
  plate: string | null;
  checkInTime?: Date;
}

interface ParkingMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  slots: ParkingSlot[];
  currentOccupancy: number;
  maxCapacity: number;
}

export default function ParkingMapModal({ 
  isOpen, 
  onClose, 
  slots, 
  currentOccupancy, 
  maxCapacity 
}: ParkingMapModalProps) {
  if (!isOpen) return null;

  const percentage = (currentOccupancy / maxCapacity) * 100;
  const isFull = currentOccupancy >= maxCapacity;
  
  // Create a unique key based on slot data to force re-render
  const mapKey = slots.map(s => `${s.id}-${s.status}-${s.plate || 'empty'}`).join('_');
  
  console.log('ParkingMapModal rendering:', {
    totalSlots: slots.length,
    occupied: slots.filter(s => s.status === 'occupied').length,
    currentOccupancy,
    maxCapacity
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 p-4">
      <div className="bg-gray-800 rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden border border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700 bg-gray-900">
          <div className="flex items-center gap-3">
            <Map className="w-8 h-8 text-blue-400" />
            <div>
              <h2 className="text-2xl font-bold text-white">Live Parking Map</h2>
              <p className="text-sm text-gray-400">Real-time parking slot visualization</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-700 rounded-lg"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Capacity Status */}
        <div className="p-6 bg-gray-900 border-b border-gray-700">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-semibold text-white">Garage Capacity</h3>
            <span className={`text-xl font-bold ${isFull ? 'text-red-400' : 'text-blue-300'}`}>
              {currentOccupancy} / {maxCapacity} Slots
            </span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
            <div 
              className={`h-3 rounded-full transition-all duration-500 ${
                isFull ? 'bg-red-500' : 'bg-blue-500'
              }`}
              style={{ width: `${percentage}%` }}
            ></div>
          </div>
          <div className="flex justify-between items-center mt-3">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <span className="text-sm text-gray-300">Vacant ({maxCapacity - currentOccupancy})</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-500 rounded"></div>
                <span className="text-sm text-gray-300">Occupied ({currentOccupancy})</span>
              </div>
            </div>
            <span className="text-sm text-gray-400">
              {percentage.toFixed(1)}% Full
            </span>
          </div>
        </div>

        {/* Parking Map */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-300px)]">
          <ParkingMap key={mapKey} slots={slots} />
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-900 border-t border-gray-700 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
