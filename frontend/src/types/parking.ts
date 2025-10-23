/**
 * Parking-specific types
 */

export interface ParkingSlot {
  id: string;
  status: 'occupied' | 'vacant';
  plate: string | null;
  checkInTime?: Date;
}

export interface DashboardSectionProps {
  title: string;
  count?: number;
  icon: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}
