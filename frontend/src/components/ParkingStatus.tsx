'use client';

import { ParkingStatus as ParkingStatusType } from '@/types';

interface ParkingStatusProps {
  status: ParkingStatusType | null;
  loading: boolean;
}

export default function ParkingStatus({ status, loading }: ParkingStatusProps) {
  if (loading) {
    return (
      <div className="glass rounded-2xl shadow-2xl p-8 animate-pulse">
        <div className="h-8 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-1/3 mb-6"></div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-gradient-to-br from-gray-200 to-gray-300 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!status) {
    return (
      <div className="glass rounded-2xl shadow-2xl p-8">
        <div className="text-center text-gray-600">
          <p className="text-2xl mb-2">⚠️</p>
          <p className="text-xl">Không thể tải trạng thái bãi xe</p>
        </div>
      </div>
    );
  }

  const getStatusColor = () => {
    if (status.occupancy_rate >= 90) return 'text-red-600';
    if (status.occupancy_rate >= 70) return 'text-orange-600';
    return 'text-green-600';
  };

  const getStatusBadge = () => {
    if (status.status === 'full') {
      return (
        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg animate-pulse">
          <span className="text-lg">🚫</span> BÃI ĐẦY
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg">
        <span className="text-lg">✅</span> CÒN CHỖ
      </span>
    );
  };

  return (
    <div className="glass rounded-2xl shadow-2xl p-8 card-hover">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold gradient-text flex items-center gap-3">
          <span className="text-4xl">📊</span>
          Trạng thái bãi đỗ
        </h2>
        {getStatusBadge()}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {/* Total Slots */}
        <div className="relative group bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 shadow-xl card-hover overflow-hidden">
          <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-blue-100 font-medium uppercase tracking-wide">Tổng slot</p>
              <div className="text-4xl">🅿️</div>
            </div>
            <p className="text-5xl font-black text-white">{status.total_slots}</p>
          </div>
          <div className="absolute bottom-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mb-12"></div>
        </div>

        {/* Occupied Slots */}
        <div className="relative group bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 shadow-xl card-hover overflow-hidden">
          <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-orange-100 font-medium uppercase tracking-wide">Đã dùng</p>
              <div className="text-4xl">🚗</div>
            </div>
            <p className="text-5xl font-black text-white">{status.occupied_slots}</p>
          </div>
          <div className="absolute bottom-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mb-12"></div>
        </div>

        {/* Free Slots */}
        <div className="relative group bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 shadow-xl card-hover overflow-hidden">
          <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-green-100 font-medium uppercase tracking-wide">Còn trống</p>
              <div className="text-4xl">✅</div>
            </div>
            <p className="text-5xl font-black text-white">{status.free_slots}</p>
          </div>
          <div className="absolute bottom-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mb-12"></div>
        </div>

        {/* Occupancy Rate */}
        <div className="relative group bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 shadow-xl card-hover overflow-hidden">
          <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-purple-100 font-medium uppercase tracking-wide">Lấp đầy</p>
              <div className="text-4xl">📈</div>
            </div>
            <p className="text-5xl font-black text-white">
              {status.occupancy_rate}%
            </p>
          </div>
          <div className="absolute bottom-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mb-12"></div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-8 bg-white/50 backdrop-blur-sm rounded-2xl p-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-bold text-gray-700 uppercase tracking-wide">Mức độ sử dụng</span>
          <span className="text-lg font-black gradient-text">
            {status.occupied_slots} / {status.total_slots}
          </span>
        </div>
        <div className="relative w-full bg-gray-200 rounded-full h-6 overflow-hidden shadow-inner">
          <div
            className={`h-full rounded-full transition-all duration-1000 ease-out relative overflow-hidden ${
              status.occupancy_rate >= 90
                ? 'bg-gradient-to-r from-red-500 to-red-600'
                : status.occupancy_rate >= 70
                ? 'bg-gradient-to-r from-orange-500 to-orange-600'
                : 'bg-gradient-to-r from-green-500 to-green-600'
            }`}
            style={{ width: `${status.occupancy_rate}%` }}
          >
            <div className="absolute inset-0 bg-white/30 animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
