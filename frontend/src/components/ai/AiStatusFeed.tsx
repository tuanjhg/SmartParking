/**
 * AI System Status Feed Component
 */

'use client';

import React from 'react';

interface AiStatusFeedProps {
  systemStatus: string;
  aiLog: string[];
}

export default function AiStatusFeed({ systemStatus, aiLog }: AiStatusFeedProps) {
  return (
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
  );
}
