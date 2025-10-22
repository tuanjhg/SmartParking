export interface CheckInResponse {
  status: 'ok' | 'error';
  slot_id?: string;
  license_plate?: string;
  arrival_time?: string;
  message: string;
}

export interface VehicleInfo {
  license_plate: string;
  slot_id: string;
  arrival_time: string;
  image_url?: string;
}

export interface ParkingStatus {
  total_slots: number;
  occupied_slots: number;
  free_slots: number;
  status: 'available' | 'full';
  occupancy_rate: number;
}

export interface VehicleListResponse {
  total: number;
  vehicles: VehicleInfo[];
}

export interface CheckOutResponse {
  status: 'ok' | 'error';
  message: string;
}
