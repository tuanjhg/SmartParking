/**
 * Application header with parking map button and connection status
 */

'use client';

import React from 'react';
import { Camera, Map } from 'lucide-react';

interface HeaderProps {
  onOpenParkingMap: () => void;
  backendConnected: boolean;
}

export default function Header({ onOpenParkingMap, backendConnected }: HeaderProps) {
  return (
    <header className="flex items-center justify-between pb-4 border-b border-gray-700">
      <div className="flex items-center gap-3">
        <Camera className="w-8 h-8 text-blue-400" />
        <h1 className="text-2xl sm:text-3xl font-bold text-white">AI Garage Vision System</h1>
      </div>
      
      <div className="flex items-center gap-4">
        {/* Parking Map Button */}
        <button
          onClick={onOpenParkingMap}
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
  );
}
