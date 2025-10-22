'use client';

import React, { useState, useEffect } from 'react';
import { Camera, Car, Database, Zap, DollarSign, Map, Ban } from 'lucide-react';
import { 
  generateLicensePlate, 
  generateVehicleImages, 
  formatTime, 
  calculateParkingDetails 
} from '@/lib/utils';
import { 
  getParkingStatus, 
  getVehicleList, 
  checkInVehicle,
  checkOutVehicle 
} from '@/services/api';
import type { VehicleInfo, ParkingStatus as ParkingStatusType } from '@/types';
import VehicleCard from '@/components/VehicleCard';
import AiProcessingModal from '@/components/AiProcessingModal';
import ParkingMapModal from '@/components/ParkingMapModal';

interface Vehicle {
  id: string;
  checkInTime: Date;
  checkOutTime?: Date;
  status: 'parked' | 'departed';
  vehicleImageUrl: string;
  plateImageUrl: string;
  cost?: number;
  duration?: string;
  slotId?: string; // For backend integration
}

interface LookupResult {
  status: 'success' | 'not_found' | 'error' | 'pending_exit';
  vehicle?: any;
  message: string;
}

interface DashboardSectionProps {
  title: string;
  count?: number;
  icon: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export default function Home() {
  const [parkedVehicles, setParkedVehicles] = useState<Vehicle[]>([]);
  const [departedVehicles, setDepartedVehicles] = useState<Vehicle[]>([]);
  const [pendingExit, setPendingExit] = useState<Vehicle | null>(null);
  const [systemStatus, setSystemStatus] = useState("Idle. Awaiting operator action...");
  const [aiLog, setAiLog] = useState<string[]>(["[AI] System initialized."]);

  // Backend data
  const [backendVehicles, setBackendVehicles] = useState<VehicleInfo[]>([]);
  const [parkingStatus, setParkingStatus] = useState<ParkingStatusType | null>(null);
  const [loading, setLoading] = useState(true);

  // Garage Capacity - use backend data if available
  const maxCapacity = parkingStatus?.total_slots || 10;
  const currentOccupancy = parkingStatus?.occupied_slots || parkedVehicles.length;

  // State for AI Processing
  const [isProcessing, setIsProcessing] = useState(false);
  const [lookupResult, setLookupResult] = useState<LookupResult | null>(null);
  const [backendConnected, setBackendConnected] = useState(false);
  
  // State for File Upload
  const [lookupFile, setLookupFile] = useState<File | null>(null);
  const [lookupFilePreviewUrl, setLookupFilePreviewUrl] = useState<string | null>(null);
  
  // Modal state
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isParkingMapOpen, setIsParkingMapOpen] = useState(false);
  const [aiModalMode, setAiModalMode] = useState<'checkin' | 'checkout'>('checkin');

  // Cleanup for Object URL
  useEffect(() => {
    return () => {
      if (lookupFilePreviewUrl) {
        URL.revokeObjectURL(lookupFilePreviewUrl);
      }
    };
  }, [lookupFilePreviewUrl]);

  // Fetch data from backend
  const fetchBackendData = async () => {
    try {
      setLoading(true);
      const [statusData, vehiclesData] = await Promise.all([
        getParkingStatus(),
        getVehicleList(),
      ]);
      setParkingStatus(statusData);
      setBackendVehicles(vehiclesData.vehicles);
      setBackendConnected(true);
      logAiMessage(`[AI] Backend sync: ${vehiclesData.vehicles.length} vehicles in database.`);
      console.log('Backend data updated:', {
        status: statusData,
        vehicles: vehiclesData.vehicles,
        count: vehiclesData.vehicles.length
      });
    } catch (error) {
      console.error('Error fetching backend data:', error);
      setBackendConnected(false);
      logAiMessage(`[AI] Warning: Could not connect to backend. Using simulation mode.`);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch and periodic refresh
  useEffect(() => {
    fetchBackendData();
    const interval = setInterval(fetchBackendData, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const logAiMessage = (message: string) => {
    setAiLog(prev => [message, ...prev.slice(0, 4)]);
    setSystemStatus(message.replace(/\[(AI|OP)\] /g, ''));
  };

  const processEntry = async () => {
    if (pendingExit) {
      const errorMsg = `Please resolve pending exit for ${pendingExit.id} first.`;
      logAiMessage(`[AI] Error: ${errorMsg}`);
      setLookupResult({ status: 'error', message: errorMsg });
      setIsProcessing(false);
      return;
    }

    let result = null;
    logAiMessage(`[AI] Detected vehicle at ENTRANCE. Checking capacity...`);
    
    // If we have a file, use backend API
    if (lookupFile) {
      try {
        logAiMessage(`[AI] Processing image through backend OCR...`);
        const response = await checkInVehicle(lookupFile);
        
        if (response.status === 'ok') {
          // Refresh backend data
          await fetchBackendData();
          result = {
            status: 'success',
            message: response.message || `Welcome, ${response.license_plate}! Checked in to slot ${response.slot_id}.`
          };
          logAiMessage(`[AI] Backend check-in successful: ${response.license_plate} → ${response.slot_id}`);
        } else {
          result = {
            status: 'error',
            message: response.message || 'Check-in failed.'
          };
          logAiMessage(`[AI] Backend error: ${response.message}`);
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Backend connection failed';
        result = {
          status: 'error',
          message: errorMsg
        };
        logAiMessage(`[AI] Error: ${errorMsg}`);
      }
    } else {
      // Simulation mode (no file uploaded)
      if (currentOccupancy >= maxCapacity) {
        logAiMessage(`[AI] GARAGE FULL. Entry denied.`);
        result = {
          status: 'error',
          message: 'Garage is Full. Entry Denied.'
        };
      } else {
        let newPlate = generateLicensePlate();
        while ([...parkedVehicles, ...departedVehicles].some(v => v.id === newPlate)) {
          newPlate = generateLicensePlate();
        }

        const newVehicle: Vehicle = {
          id: newPlate,
          checkInTime: new Date(),
          status: 'parked',
          ...generateVehicleImages(newPlate),
        };
        
        setParkedVehicles(prev => [newVehicle, ...prev]);
        result = {
          status: 'success',
          vehicle: newVehicle,
          message: `Welcome, ${newPlate}! Auto-checked in (Simulation).`
        };
        logAiMessage(`[AI] Simulation: ${newPlate} checked in. Occupancy: ${currentOccupancy + 1}/${maxCapacity}`);
      }
    }
    
    setLookupResult(result as LookupResult);
    setIsProcessing(false);
    setLookupFile(null);
  };

  const processExit = async () => {
    if (pendingExit) {
      const errorMsg = `Please resolve pending exit for ${pendingExit.id} first.`;
      logAiMessage(`[AI] Error: ${errorMsg}`);
      setLookupResult({ status: 'error', message: errorMsg });
      setIsProcessing(false);
      return;
    }

    let result = null;
    logAiMessage(`[AI] Detected vehicle at EXIT. Cross-referencing...`);
    
    // Check if we have backend vehicles to exit
    if (backendVehicles.length > 0) {
      // Use backend vehicle for exit
      const vehicleToExit = backendVehicles[Math.floor(Math.random() * backendVehicles.length)];
      
      const checkOutTime = new Date();
      const checkInTime = new Date(vehicleToExit.arrival_time);
      const details = calculateParkingDetails(checkInTime, checkOutTime);
      
      const pendingVehicle: Vehicle = {
        id: vehicleToExit.license_plate,
        checkInTime: checkInTime,
        checkOutTime: checkOutTime,
        status: 'parked',
        ...generateVehicleImages(vehicleToExit.license_plate),
        ...details,
        slotId: vehicleToExit.slot_id, // Store slot ID for backend checkout
      };
      
      setPendingExit(pendingVehicle);
      
      result = {
        status: 'pending_exit',
        vehicle: pendingVehicle,
        message: `Vehicle ${vehicleToExit.license_plate} detected at exit. Bill $${details.cost.toFixed(2)}. Awaiting payment.`
      };
      logAiMessage(`[AI] ${result.message}`);
    } else if (parkedVehicles.length === 0) {
      logAiMessage(`[AI] GARAGE EMPTY. No vehicle to exit.`);
      result = {
        status: 'not_found',
        message: 'Garage is empty. No vehicle to exit.'
      };
    } else {
      // Simulation mode with local vehicles
      const vehicleToExitIndex = Math.floor(Math.random() * parkedVehicles.length);
      const vehicle = parkedVehicles[vehicleToExitIndex];
      
      setParkedVehicles(prev => prev.filter(v => v.id !== vehicle.id));
      
      const checkOutTime = new Date();
      const details = calculateParkingDetails(vehicle.checkInTime, checkOutTime);
      
      const pendingVehicle: Vehicle = {
        ...vehicle,
        checkOutTime,
        ...details,
      };
      
      setPendingExit(pendingVehicle);
      
      result = {
        status: 'pending_exit',
        vehicle: pendingVehicle,
        message: `Vehicle ${vehicle.id} detected at exit (Simulation). Bill $${details.cost.toFixed(2)}. Awaiting payment.`
      };
      logAiMessage(`[AI] ${result.message}`);
    }
    
    setLookupResult(result as LookupResult);
    setIsProcessing(false);
    setLookupFile(null);
  };
  
  const handleConfirmPayment = async () => {
    if (!pendingExit) return;
    
    // If vehicle has slotId, it came from backend - use API
    if (pendingExit.slotId) {
      try {
        logAiMessage(`[OP] Processing checkout for slot ${pendingExit.slotId}...`);
        await checkOutVehicle(pendingExit.slotId);
        logAiMessage(`[OP] Backend checkout successful for ${pendingExit.id}.`);
        
        // Refresh backend data
        await fetchBackendData();
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Checkout failed';
        logAiMessage(`[AI] Error during checkout: ${errorMsg}`);
        alert(`Error: ${errorMsg}`);
        return;
      }
    }
    
    // Add to departed vehicles (for UI)
    setDepartedVehicles(prev => [
      { ...pendingExit, status: 'departed' },
      ...prev
    ]);
    logAiMessage(`[OP] Confirmed payment $${pendingExit.cost} for ${pendingExit.id}.`);
    setPendingExit(null);
  };
  
  const handleRejectExit = () => {
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
    logAiMessage(`[OP] REJECTED exit for ${pendingExit.id}. Vehicle returned to parked list.`);
    setPendingExit(null);
  };

  const generateSlots = () => {
    let slotArray = [];
    
    // Create a map of occupied slots from backend data
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
        // Use backend vehicle data
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
  
  const slots = generateSlots();
  const percentage = (currentOccupancy / maxCapacity) * 100;
  const isFull = currentOccupancy >= maxCapacity;

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans p-4 sm:p-8">
      {/* Header */}
      <header className="flex items-center justify-between pb-4 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <Camera className="w-8 h-8 text-blue-400" />
          <h1 className="text-2xl sm:text-3xl font-bold text-white">AI Garage Vision System</h1>
        </div>
        <div className="flex items-center gap-4">
          {/* Parking Map Button */}
          <button
            onClick={() => setIsParkingMapOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all transform hover:scale-105 shadow-lg"
          >
            <Map className="w-5 h-5" />
            <span className="hidden sm:inline">Parking Map</span>
          </button>
          
          {/* Backend Connection Status */}
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${
            backendConnected 
              ? 'bg-green-900/50 text-green-300 border border-green-700' 
              : 'bg-red-900/50 text-red-300 border border-red-700'
          }`}>
            <div className={`w-2 h-2 rounded-full ${backendConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></div>
            <span className="hidden md:inline">{backendConnected ? 'Backend Connected' : 'Simulation Mode'}</span>
          </div>
        </div>
      </header>
      
      {/* AI Processing Button */}
      <div className="mt-6 flex justify-center">
        <button
          onClick={() => setIsAiModalOpen(true)}
          className="relative group bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 px-8 rounded-xl shadow-2xl transition-all transform hover:scale-105 flex items-center gap-3 text-lg overflow-hidden"
        >
          <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity"></div>
          <Zap className="w-6 h-6 animate-pulse" />
          <span className="relative z-10">Open AI Vision Processing</span>
          <Camera className="w-6 h-6" />
        </button>
      </div>

      {/* System Status Feed */}
      <div className="mt-6 bg-gray-800 rounded-lg shadow-lg p-4 border border-gray-700">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
          <span className="font-semibold text-lg text-white">Live AI Status:</span>
          <span className="text-lg text-green-300">{systemStatus}</span>
        </div>
        <div className="font-mono text-xs text-gray-400 space-y-1 max-h-24 overflow-y-auto">
          {aiLog.map((entry, index) => (
            <p key={index}>{entry}</p>
          ))}
        </div>
      </div>

      {/* Garage Capacity */}
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
        <DashboardSection title="Currently Parked" count={backendVehicles.length + parkedVehicles.length} icon={<Car className="w-6 h-6" />}>
          <VehicleListCombined backendVehicles={backendVehicles} localVehicles={parkedVehicles} />
        </DashboardSection>

        {/* Departure Log (History) */}
        <DashboardSection title="Departure Log (History)" count={departedVehicles.length} icon={<Database className="w-6 h-6" />}>
          <VehicleListSimple vehicles={departedVehicles} />
        </DashboardSection>

      </div>

      {/* AI Processing Modal */}
      <AiProcessingModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        onSuccess={async (mode: 'checkin' | 'checkout', vehicleData?: VehicleInfo) => {
          console.log('AI Modal onSuccess called:', { mode, vehicleData });
          
          // Refresh backend data first
          await fetchBackendData();
          
          // If checkout mode, pick a random vehicle from backend for payment
          if (mode === 'checkout') {
            // Check if we have backend vehicles to exit
            if (backendVehicles.length > 0) {
              // Pick a random vehicle (or use vehicleData if provided by backend in future)
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
        }}
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

// Dashboard Section Component
function DashboardSection({ title, count, icon, children, className = "" }: DashboardSectionProps) {
  return (
    <div className={`bg-gray-800 rounded-lg shadow-lg p-4 sm:p-6 border border-gray-700 flex flex-col min-h-[300px] ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="text-blue-400">{icon}</div>
          <h2 className="text-xl font-semibold text-white">{title}</h2>
        </div>
        {count !== undefined && (
          <span className="px-3 py-1 bg-gray-700 text-blue-300 rounded-full text-sm font-bold">
            {count}
          </span>
        )}
      </div>
      <div className="flex-grow overflow-y-auto pr-2">{children}</div>
    </div>
  );
}

// Combined Vehicle List Component (Backend + Local)
function VehicleListCombined({ backendVehicles, localVehicles }: { backendVehicles: VehicleInfo[], localVehicles: Vehicle[] }) {
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

// Simple Vehicle List Component
function VehicleListSimple({ vehicles }: { vehicles: Vehicle[] }) {
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
