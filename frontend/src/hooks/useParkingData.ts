/**
 * Custom hook for managing parking data from backend
 */

import { useState, useEffect, useCallback } from 'react';
import { getParkingStatus, getVehicleList } from '@/services/api';
import type { VehicleInfo, ParkingStatus } from '@/types';
import { PARKING_CONSTANTS } from '@/lib/constants';

export function useParkingData() {
  const [backendVehicles, setBackendVehicles] = useState<VehicleInfo[]>([]);
  const [parkingStatus, setParkingStatus] = useState<ParkingStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [backendConnected, setBackendConnected] = useState(false);

  const fetchBackendData = useCallback(async () => {
    try {
      setLoading(true);
      const [statusData, vehiclesData] = await Promise.all([
        getParkingStatus(),
        getVehicleList(),
      ]);
      
      setParkingStatus(statusData);
      setBackendVehicles(vehiclesData.vehicles);
      setBackendConnected(true);
      
      console.log('Backend data updated:', {
        status: statusData,
        vehicles: vehiclesData.vehicles,
        count: vehiclesData.vehicles.length
      });
      
      return {
        status: statusData,
        vehicles: vehiclesData.vehicles,
        success: true
      };
    } catch (error) {
      console.error('Error fetching backend data:', error);
      setBackendConnected(false);
      return {
        status: null,
        vehicles: [],
        success: false,
        error
      };
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch and periodic refresh
  useEffect(() => {
    fetchBackendData();
    const interval = setInterval(fetchBackendData, PARKING_CONSTANTS.REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchBackendData]);

  return {
    backendVehicles,
    parkingStatus,
    loading,
    backendConnected,
    refreshData: fetchBackendData,
  };
}
