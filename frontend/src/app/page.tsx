/**
 * Main Dashboard Page - Refactored and Simplified
 * 
 * This page orchestrates the parking management system using:
 * - Custom hooks for state management
 * - Modular components for UI
 * - Separation of concerns for maintainability
 */

'use client';

import React, { useState } from 'react';
import { Car, Database, DollarSign, Zap } from 'lucide-react';
import { calculateParkingDetails, generateVehicleImages } from '@/lib/utils';
import type { VehicleInfo } from '@/types';
import type { Vehicle } from '@/types/vehicle';
import { PARKING_CONSTANTS } from '@/lib/constants';

// Custom Hooks
import { useParkingData } from '@/hooks/useParkingData';
import { useVehicleManagement } from '@/hooks/useVehicleManagement';
import { useSystemLog } from '@/hooks/useSystemLog';

// Layout Components
import Header from '@/components/layout/Header';
import DashboardSection from '@/components/layout/DashboardSection';

// Feature Components
import AiProcessingModal from '@/components/modal/AiProcessingModal';
import AiStatusFeed from '@/components/ai/AiStatusFeed';
import ParkingMapModal from '@/components/modal/ParkingMapModal';
import ParkingCapacityBar from '@/components/parking/ParkingCapacityBar';
import VehicleCard from '@/components/vehicle/VehicleCard';
import VehicleListCombined from '@/components/vehicle/VehicleListCombined';
import VehicleListSimple from '@/components/vehicle/VehicleListSimple';

export default function Home() {
  // Custom Hooks for State Management
  const { 
    backendVehicles, 
    parkingStatus, 
    backendConnected, 
    refreshData 
  } = useParkingData();
  
  const {
    parkedVehicles,
    departedVehicles,
    pendingExit,
    setPendingExit,
    confirmPayment,
    rejectExit,
  } = useVehicleManagement();
  
  const { systemStatus, aiLog, logAiMessage } = useSystemLog();

  // Modal State
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isParkingMapOpen, setIsParkingMapOpen] = useState(false);
  const [aiModalMode, setAiModalMode] = useState<'checkin' | 'checkout'>('checkin');

  // Computed Values
  const maxCapacity = parkingStatus?.total_slots || PARKING_CONSTANTS.DEFAULT_MAX_CAPACITY;
  const currentOccupancy = parkingStatus?.occupied_slots || parkedVehicles.length;

  /**
   * Generate parking slot visualization data
   */
  const generateSlots = () => {
    const slotArray = [];
    
    // Create map of occupied slots from backend
    const occupiedSlots: Record<string, VehicleInfo> = {};
    backendVehicles.forEach(vehicle => {
      occupiedSlots[vehicle.slot_id] = vehicle;
    });
    
    console.log('Generating slots:', {
      maxCapacity,
      backendVehiclesCount: backendVehicles.length,
      occupiedSlotsMap: Object.keys(occupiedSlots)
    });
    
    for (let i = 0; i < maxCapacity; i++) {
      const slotId = `A-${i + 1}`;
      const backendVehicle = occupiedSlots[slotId];
      
      if (backendVehicle) {
        // Backend vehicle occupies this slot
        slotArray.push({
          id: slotId,
          status: 'occupied' as const,
          plate: backendVehicle.license_plate,
          checkInTime: new Date(backendVehicle.arrival_time)
        });
      } else {
        // Check local simulation vehicles
        const localVehicle = parkedVehicles[i - backendVehicles.length];
        if (localVehicle && i >= backendVehicles.length) {
          slotArray.push({
            id: slotId,
            status: 'occupied' as const,
            plate: localVehicle.id,
            checkInTime: localVehicle.checkInTime
          });
        } else {
          slotArray.push({
            id: slotId,
            status: 'vacant' as const,
            plate: null
          });
        }
      }
    }
    
    console.log('Generated slots:', slotArray.filter(s => s.status === 'occupied').length + ' occupied');
    return slotArray;
  };

  /**
   * Handle successful AI processing (check-in or check-out)
   */
  const handleAiSuccess = async (mode: 'checkin' | 'checkout', vehicleData?: VehicleInfo) => {
    console.log('AI Modal onSuccess called:', { mode, vehicleData });
    
    // Refresh backend data first
    await refreshData();
    
    // If checkout mode, pick a vehicle for payment
    if (mode === 'checkout') {
      if (backendVehicles.length > 0) {
        const vehicleToCheckout = vehicleData || backendVehicles[Math.floor(Math.random() * backendVehicles.length)];
        
        const checkOutTime = new Date();
        const checkInTime = new Date(vehicleToCheckout.arrival_time);
        const details = calculateParkingDetails(checkInTime, checkOutTime);
        
        const pendingVehicle: Vehicle = {
          id: vehicleToCheckout.license_plate,
          checkInTime: checkInTime,
          checkOutTime: checkOutTime,
          status: 'parked',
          ...generateVehicleImages(vehicleToCheckout.license_plate),
          ...details,
          slotId: vehicleToCheckout.slot_id,
        };
        
        setPendingExit(pendingVehicle);
        logAiMessage(`[AI] Vehicle ${vehicleToCheckout.license_plate} detected at exit. Bill $${details.cost.toFixed(2)}. Awaiting payment.`);
      } else {
        logAiMessage(`[AI] No vehicles in garage to check out.`);
      }
    }
  };

  /**
   * Handle payment confirmation
   */
  const handleConfirmPayment = async () => {
    try {
      await confirmPayment();
      logAiMessage(`[OP] Confirmed payment $${pendingExit?.cost} for ${pendingExit?.id}.`);
      await refreshData(); // Refresh after checkout
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Checkout failed';
      logAiMessage(`[AI] Error during checkout: ${errorMsg}`);
      alert(`Error: ${errorMsg}`);
    }
  };

  /**
   * Handle payment rejection
   */
  const handleRejectExit = () => {
    rejectExit();
    logAiMessage(`[OP] REJECTED exit for ${pendingExit?.id}. Vehicle returned to parked list.`);
  };

  const slots = generateSlots();

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans p-4 sm:p-8">
      {/* Header */}
      <Header 
        onOpenParkingMap={() => setIsParkingMapOpen(true)}
        backendConnected={backendConnected}
      />
      
      {/* AI Processing Button */}
      <div className="mt-6 flex justify-center">
        <button
          onClick={() => setIsAiModalOpen(true)}
          className="relative group bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 px-8 rounded-xl shadow-2xl transition-all transform hover:scale-105 flex items-center gap-3 text-lg overflow-hidden"
        >
          <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity"></div>
          <Zap className="w-6 h-6 animate-pulse" />
          <span className="relative z-10">Open AI Vision Processing</span>
          <Zap className="w-6 h-6" />
        </button>
      </div>

      {/* System Status Feed */}
      <AiStatusFeed systemStatus={systemStatus} aiLog={aiLog} />

      {/* Garage Capacity */}
      <ParkingCapacityBar 
        currentOccupancy={currentOccupancy}
        maxCapacity={maxCapacity}
      />
      
      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Pending Departure (Payment) */}
        {pendingExit && (
          <DashboardSection 
            title="Pending Departure / Payment" 
            icon={<DollarSign className="w-6 h-6" />} 
            className="lg:col-span-2 border-yellow-400"
          >
            <VehicleCard
              vehicle={pendingExit}
              onConfirm={handleConfirmPayment}
              onReject={handleRejectExit}
            />
          </DashboardSection>
        )}

        {/* Currently Parked */}
        <DashboardSection 
          title="Currently Parked" 
          count={backendVehicles.length + parkedVehicles.length} 
          icon={<Car className="w-6 h-6" />}
        >
          <VehicleListCombined 
            backendVehicles={backendVehicles} 
            localVehicles={parkedVehicles} 
          />
        </DashboardSection>

        {/* Departure Log (History) */}
        <DashboardSection 
          title="Departure Log (History)" 
          count={departedVehicles.length} 
          icon={<Database className="w-6 h-6" />}
        >
          <VehicleListSimple vehicles={departedVehicles} />
        </DashboardSection>
      </div>

      {/* AI Processing Modal */}
      <AiProcessingModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        onSuccess={handleAiSuccess}
        initialMode={aiModalMode}
      />
      
      {/* Parking Map Modal */}
      <ParkingMapModal
        isOpen={isParkingMapOpen}
        onClose={() => setIsParkingMapOpen(false)}
        slots={slots}
        currentOccupancy={currentOccupancy}
        maxCapacity={maxCapacity}
      />
    </div>
  );
}
