import {
  CheckInResponse,
  VehicleInfo,
  ParkingStatus,
  VehicleListResponse,
  CheckOutResponse,
} from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

/**
 * Check-in a vehicle by uploading an image
 */
export async function checkInVehicle(imageFile: File): Promise<CheckInResponse> {
  const formData = new FormData();
  formData.append('file', imageFile);

  const response = await fetch(`${API_BASE_URL}/api/v1/vehicles/checkin`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to check in vehicle');
  }

  return response.json();
}

/**
 * Get parking status (total slots, occupied, free, etc.)
 */
export async function getParkingStatus(): Promise<ParkingStatus> {
  const response = await fetch(`${API_BASE_URL}/api/v1/vehicles/status`);

  if (!response.ok) {
    throw new Error('Failed to fetch parking status');
  }

  return response.json();
}

/**
 * Get list of all vehicles currently in the parking lot
 */
export async function getVehicleList(): Promise<VehicleListResponse> {
  const response = await fetch(`${API_BASE_URL}/api/v1/vehicles/list`);

  if (!response.ok) {
    throw new Error('Failed to fetch vehicle list');
  }

  return response.json();
}

/**
 * Check-out a vehicle from a specific slot
 */
export async function checkOutVehicle(slotId: string): Promise<CheckOutResponse> {
  const response = await fetch(`${API_BASE_URL}/api/v1/vehicles/checkout/${slotId}`, {
    method: 'POST',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to check out vehicle');
  }

  return response.json();
}
