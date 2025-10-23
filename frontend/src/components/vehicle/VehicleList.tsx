'use client';

import { useState } from 'react';
import { VehicleInfo } from '@/types';
import { checkOutVehicle } from '@/services/api';

interface VehicleListProps {
  vehicles: VehicleInfo[];
  loading: boolean;
  onCheckOut: () => void;
}

export default function VehicleList({ vehicles, loading, onCheckOut }: VehicleListProps) {
  const [checkingOut, setCheckingOut] = useState<string | null>(null);

  const handleCheckOut = async (slotId: string) => {
    if (!confirm(`Xác nhận check-out xe tại slot ${slotId}?`)) {
      return;
    }

    setCheckingOut(slotId);
    try {
      await checkOutVehicle(slotId);
      alert(`Xe tại slot ${slotId} đã check-out thành công!`);
      onCheckOut();
    } catch (error) {
      alert(`Lỗi: ${error instanceof Error ? error.message : 'Không thể check-out'}`);
    } finally {
      setCheckingOut(null);
    }
  };

  const formatTime = (timeString: string) => {
    const date = new Date(timeString);
    return date.toLocaleString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const calculateDuration = (arrivalTime: string) => {
    const arrival = new Date(arrivalTime);
    const now = new Date();
    const diffMs = now.getTime() - arrival.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const hours = Math.floor(diffMins / 60);
    const minutes = diffMins % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">🚗 Danh sách xe trong bãi</h2>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-20 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">🚗 Danh sách xe trong bãi</h2>
        <span className="bg-blue-100 text-blue-800 text-sm font-semibold px-3 py-1 rounded-full">
          {vehicles.length} xe
        </span>
      </div>

      {vehicles.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🅿️</div>
          <p className="text-xl text-gray-500 mb-2">Bãi xe trống</p>
          <p className="text-sm text-gray-400">Chưa có xe nào trong bãi</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Slot</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">
                  Biển số
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">
                  Thời gian vào
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">
                  Thời lượng
                </th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody>
              {vehicles.map((vehicle, index) => (
                <tr
                  key={`${vehicle.slot_id}-${index}`}
                  className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <td className="py-4 px-4">
                    <span className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-blue-100 text-blue-800 font-bold text-lg">
                      {vehicle.slot_id}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="font-mono font-semibold text-lg bg-gray-100 px-3 py-1 rounded">
                      {vehicle.license_plate}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-gray-600">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🕐</span>
                      <span>{formatTime(vehicle.arrival_time)}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="inline-flex items-center gap-1 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                      ⏱️ {calculateDuration(vehicle.arrival_time)}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <button
                      onClick={() => handleCheckOut(vehicle.slot_id)}
                      disabled={checkingOut === vehicle.slot_id}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        checkingOut === vehicle.slot_id
                          ? 'bg-gray-300 cursor-not-allowed'
                          : 'bg-red-600 hover:bg-red-700 text-white'
                      }`}
                    >
                      {checkingOut === vehicle.slot_id ? (
                        <span className="flex items-center gap-2">
                          <span className="animate-spin">⏳</span> Đang xử lý...
                        </span>
                      ) : (
                        'Check-out'
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
