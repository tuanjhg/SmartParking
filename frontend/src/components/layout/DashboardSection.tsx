/**
 * Reusable dashboard section wrapper component
 */

'use client';

import React from 'react';
import type { DashboardSectionProps } from '@/types/parking';

export default function DashboardSection({ 
  title, 
  count, 
  icon, 
  children, 
  className = "" 
}: DashboardSectionProps) {
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
