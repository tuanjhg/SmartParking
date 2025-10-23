/**
 * Custom hook for managing vehicle state and operations
 */

import { useState, useCallback } from 'react';
import { checkOutVehicle } from '@/services/api';
import type { Vehicle } from '@/types/vehicle';

export function useVehicleManagement() {
  const [parkedVehicles, setParkedVehicles] = useState<Vehicle[]>([]);
  const [departedVehicles, setDepartedVehicles] = useState<Vehicle[]>([]);
  const [pendingExit, setPendingExit] = useState<Vehicle | null>(null);

  const addParkedVehicle = useCallback((vehicle: Vehicle) => {
    setParkedVehicles(prev => [vehicle, ...prev]);
  }, []);

  const removeParkedVehicle = useCallback((vehicleId: string) => {
    setParkedVehicles(prev => prev.filter(v => v.id !== vehicleId));
  }, []);

  const addDepartedVehicle = useCallback((vehicle: Vehicle) => {
    setDepartedVehicles(prev => [
      { ...vehicle, status: 'departed' },
      ...prev
    ]);
  }, []);

  const confirmPayment = useCallback(async () => {
    if (!pendingExit) return;
    
    // If vehicle has slotId, it came from backend - use API
    if (pendingExit.slotId) {
      try {
        await checkOutVehicle(pendingExit.slotId);
        console.log(`Backend checkout successful for ${pendingExit.id}`);
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Checkout failed';
        console.error(`Error during checkout: ${errorMsg}`);
        throw error; // Re-throw to let caller handle
      }
    }
    
    // Add to departed vehicles (for UI)
    addDepartedVehicle(pendingExit);
    setPendingExit(null);
  }, [pendingExit, addDepartedVehicle]);

  const rejectExit = useCallback(() => {
    if (!pendingExit) return;
    
    setParkedVehicles(prev => [
      { 
        id: pendingExit.id, 
        checkInTime: pendingExit.checkInTime, 
        status: 'parked',
        vehicleImageUrl: pendingExit.vehicleImageUrl,
        plateImageUrl: pendingExit.plateImageUrl,
      }, 
      ...prev
    ]);
    
    setPendingExit(null);
  }, [pendingExit]);

  return {
    parkedVehicles,
    departedVehicles,
    pendingExit,
    setPendingExit,
    addParkedVehicle,
    removeParkedVehicle,
    addDepartedVehicle,
    confirmPayment,
    rejectExit,
  };
}
