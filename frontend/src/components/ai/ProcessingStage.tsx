/**
 * Processing Stage Component for AI Detection Steps
 */

'use client';

import React from 'react';
import { CheckCircle } from 'lucide-react';

export interface ProcessingStageProps {
  label: string;
  status: 'pending' | 'processing' | 'complete';
}

export default function ProcessingStage({ label, status }: ProcessingStageProps) {
  return (
    <div className="flex items-center gap-3">
      <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
        status === 'complete' ? 'bg-green-600' :
        status === 'processing' ? 'bg-blue-600 animate-pulse' :
        'bg-gray-700'
      }`}>
        {status === 'complete' ? (
          <CheckCircle className="w-4 h-4 text-white" />
        ) : status === 'processing' ? (
          <div className="w-3 h-3 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
        ) : (
          <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
        )}
      </div>
      <span className={`text-sm font-medium ${
        status === 'complete' ? 'text-green-300' :
        status === 'processing' ? 'text-blue-300' :
        'text-gray-500'
      }`}>
        {label}
      </span>
    </div>
  );
}
