'use client';

import React from 'react';
import { CheckCircle, XCircle } from 'lucide-react';
import { formatTime } from '@/lib/utils';

interface Vehicle {
  id: string;
  checkInTime: Date;
  checkOutTime?: Date;
  vehicleImageUrl: string;
  plateImageUrl: string;
  cost?: number;
  duration?: string;
}

interface VehicleCardProps {
  vehicle: Vehicle;
  onConfirm?: () => void;
  onReject?: () => void;
}

/**
 * Card to display a vehicle (for exit confirmation/payment).
 */
export default function VehicleCard({ vehicle, onConfirm, onReject }: VehicleCardProps) {
  return (
    <div className="bg-gray-700 rounded-lg p-4 transition-all duration-300">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Image Column */}
        <div className="space-y-4">
          <img 
            src={vehicle.vehicleImageUrl} 
            alt="Vehicle" 
            className="rounded-lg w-full aspect-video object-cover bg-gray-600"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = 'https://placehold.co/600x400/334155/94a3b8?text=Image+Error';
            }}
          />
          <img 
            src={vehicle.plateImageUrl} 
            alt={`License Plate ${vehicle.id}`}
            className="rounded-md w-full max-w-[200px] mx-auto aspect-[3/1] object-cover bg-gray-500"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = 'https://placehold.co/300x100/94a3b8/334155?text=Error';
            }}
          />
        </div>
        
        {/* Info Column */}
        <div className="flex flex-col justify-between">
          <div>
            <div className="text-3xl font-bold text-white tracking-wider font-mono">
              {vehicle.id}
            </div>
            <div className="text-sm text-gray-300 mt-1">
              Checked In: {formatTime(vehicle.checkInTime)}
            </div>
          </div>

          {vehicle.cost !== undefined && vehicle.duration && (
            <div className="text-left mt-4">
              <div className="text-3xl font-bold text-green-400">
                ${vehicle.cost.toFixed(2)}
              </div>
              <div className="text-sm text-gray-300">
                Total Duration: {vehicle.duration}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Action buttons */}
      {onConfirm && onReject && (
        <div className="flex gap-4 mt-6">
          <button
            onClick={onConfirm}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold text-white transition-all bg-green-600 hover:bg-green-700"
          >
            <CheckCircle className="w-5 h-5" />
            Confirm Payment
          </button>
          <button
            onClick={onReject}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-red-600 hover:bg-red-700 font-semibold text-white transition-all"
          >
            <XCircle className="w-5 h-5" />
            Reject / Re-park
          </button>
        </div>
      )}
    </div>
  );
}
