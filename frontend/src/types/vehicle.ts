/**
 * Local vehicle types for UI state management
 */

export interface Vehicle {
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

export interface LookupResult {
  status: 'success' | 'not_found' | 'error' | 'pending_exit';
  vehicle?: any;
  message: string;
}
