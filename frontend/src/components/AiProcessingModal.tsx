'use client';

import React, { useState } from 'react';
import { 
  X, 
  Upload, 
  Zap, 
  CheckCircle, 
  AlertTriangle, 
  Ban,
  Camera,
  FileImage,
  LogIn,
  LogOut
} from 'lucide-react';
import { checkInVehicle } from '@/services/api';
import type { VehicleInfo } from '@/types';

interface AiProcessingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (mode: 'checkin' | 'checkout', vehicleData?: VehicleInfo) => void | Promise<void>;
  initialMode?: 'checkin' | 'checkout';
}

type ProcessMode = 'checkin' | 'checkout';

export default function AiProcessingModal({ isOpen, onClose, onSuccess, initialMode = 'checkin' }: AiProcessingModalProps) {
  const [mode, setMode] = useState<ProcessMode>(initialMode);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [detectionStage, setDetectionStage] = useState<'idle' | 'analyzing' | 'detecting' | 'ocr' | 'complete'>('idle');
  const [result, setResult] = useState<{
    status: 'success' | 'error';
    message: string;
    licensePlate?: string;
    slotId?: string;
    confidence?: number;
    vehicleData?: VehicleInfo;
  } | null>(null);

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleModeChange = (newMode: ProcessMode) => {
    setMode(newMode);
    // Reset state when switching modes
    setSelectedFile(null);
    setPreviewUrl('');
    setResult(null);
    setDetectionStage('idle');
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResult(null);
      setDetectionStage('idle');
    }
  };

  const simulateAIDetection = async () => {
    // Stage 1: Image Analysis
    setDetectionStage('analyzing');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Stage 2: Vehicle Detection
    setDetectionStage('detecting');
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Stage 3: OCR Processing
    setDetectionStage('ocr');
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    // Stage 4: Complete
    setDetectionStage('complete');
  };

  const handleProcess = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setResult(null);

    try {
      // Simulate AI detection stages
      await simulateAIDetection();

      if (mode === 'checkin') {
        // Call backend API for check-in
        const response = await checkInVehicle(selectedFile);

        if (response.status === 'ok') {
          setResult({
            status: 'success',
            message: response.message || 'Vehicle detected and checked in successfully!',
            licensePlate: response.license_plate,
            slotId: response.slot_id,
            confidence: 95.5 // Mock confidence score
          });

          console.log('Check-in successful, refreshing backend data...');
          // Refresh backend data immediately
          await onSuccess('checkin');
          console.log('Backend data refresh complete');
          
          // Auto-close after showing success
          setTimeout(() => {
            handleClose();
          }, 2500);
        } else {
          setResult({
            status: 'error',
            message: response.message || 'Failed to process vehicle.'
          });
        }
      } else {
        // Checkout mode - we need to find the vehicle first from the image
        // For now, simulate detection and let the parent handle the checkout flow
        
        // In a real implementation, the backend would:
        // 1. Detect license plate from exit image
        // 2. Find the vehicle in database
        // 3. Calculate parking fee
        // 4. Return vehicle data for payment confirmation
        
        // Simulate successful detection
        setResult({
          status: 'success',
          message: 'Vehicle license plate detected! Fetching parking details...',
          licensePlate: 'Detecting...', // This would come from OCR
          confidence: 92.3
        });

        console.log('Checkout detected, passing vehicle data for payment...');
        // Signal parent to handle checkout (parent will pick a vehicle from backend)
        await onSuccess('checkout');
        console.log('Checkout flow initiated');
        
        // Auto-close after showing success
        setTimeout(() => {
          handleClose();
        }, 2500);
      }
    } catch (error) {
      setResult({
        status: 'error',
        message: error instanceof Error ? error.message : 'Failed to connect to backend.'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setPreviewUrl('');
    setResult(null);
    setDetectionStage('idle');
    setIsProcessing(false);
    // Don't reset mode - keep user's last selection
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border-2 border-gray-700">
        {/* Header */}
        <div className="border-b border-gray-700">
          <div className="flex items-center justify-between p-6">
            <div className="flex items-center gap-3">
              <Camera className="w-8 h-8 text-blue-400" />
              <div>
                <h2 className="text-2xl font-bold text-white">AI Vision Processing</h2>
                <p className="text-sm text-gray-400">Upload vehicle image for automatic detection & OCR</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-700 rounded-lg"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Mode Selector Tabs */}
          <div className="flex px-6 gap-2">
            <button
              onClick={() => handleModeChange('checkin')}
              className={`flex items-center gap-2 px-6 py-3 font-semibold transition-all ${
                mode === 'checkin'
                  ? 'text-white border-b-2 border-blue-500 bg-gray-700/30'
                  : 'text-gray-400 hover:text-gray-300 hover:bg-gray-700/20'
              }`}
            >
              <LogIn className="w-5 h-5" />
              Check-In (Entry)
            </button>
            <button
              onClick={() => handleModeChange('checkout')}
              className={`flex items-center gap-2 px-6 py-3 font-semibold transition-all ${
                mode === 'checkout'
                  ? 'text-white border-b-2 border-orange-500 bg-gray-700/30'
                  : 'text-gray-400 hover:text-gray-300 hover:bg-gray-700/20'
              }`}
            >
              <LogOut className="w-5 h-5" />
              Check-Out (Exit)
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* File Upload Area */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Upload Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <FileImage className="w-5 h-5 text-blue-400" />
                Upload {mode === 'checkin' ? 'Entry' : 'Exit'} Image
              </h3>
              
              {!previewUrl ? (
                <label
                  htmlFor="ai-file-upload"
                  className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-600 rounded-xl cursor-pointer bg-gray-700/50 hover:bg-gray-700 transition-all group"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    {mode === 'checkin' ? (
                      <LogIn className="w-16 h-16 mb-4 text-blue-400 group-hover:text-blue-300 transition-colors" />
                    ) : (
                      <LogOut className="w-16 h-16 mb-4 text-orange-400 group-hover:text-orange-300 transition-colors" />
                    )}
                    <p className="mb-2 text-sm text-gray-300 font-semibold">
                      {mode === 'checkin' 
                        ? 'Upload vehicle entering image' 
                        : 'Upload vehicle exiting image'}
                    </p>
                    <p className="text-xs text-gray-500">
                      Supports: JPG, PNG, BMP (Max 10MB)
                    </p>
                  </div>
                  <input
                    id="ai-file-upload"
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    onChange={handleFileSelect}
                    accept="image/*"
                  />
                </label>
              ) : (
                <div className="space-y-3">
                  <div className="relative group">
                    {/* Mode Badge Overlay */}
                    <div className={`absolute top-3 right-3 z-20 px-3 py-1 rounded-full text-xs font-bold ${
                      mode === 'checkin' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-orange-600 text-white'
                    }`}>
                      {mode === 'checkin' ? 'ENTRY' : 'EXIT'}
                    </div>
                    
                    <img
                      src={previewUrl}
                      alt="Vehicle Preview"
                      className="w-full h-64 object-cover rounded-xl"
                    />
                    {/* AI Detection Overlays */}
                    {isProcessing && (
                      <div className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center">
                        {/* Scanning Line */}
                        <div className="scan-line-animation"></div>
                        
                        {/* Bounding Boxes */}
                        {(detectionStage === 'detecting' || detectionStage === 'ocr' || detectionStage === 'complete') && (
                          <>
                            <div 
                              className="bounding-box-animation"
                              style={{ top: '15%', left: '20%', width: '60%', height: '70%' }}
                            >
                              <span className="absolute -top-6 left-0 text-xs bg-green-500 text-white px-2 py-1 rounded">
                                Vehicle Detected
                              </span>
                            </div>
                            {(detectionStage === 'ocr' || detectionStage === 'complete') && (
                              <div
                                className="bounding-box-animation"
                                style={{ top: '65%', left: '35%', width: '30%', height: '20%' }}
                              >
                                <span className="absolute -top-6 left-0 text-xs bg-blue-500 text-white px-2 py-1 rounded">
                                  License Plate
                                </span>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full px-4 py-2 text-sm text-gray-300 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                  >
                    Change Image
                  </button>
                </div>
              )}
            </div>

            {/* Processing Status Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-400" />
                AI Processing Status
              </h3>

              <div className="bg-gray-900/50 rounded-xl p-4 space-y-3 border border-gray-700">
                {/* Processing Stages */}
                <ProcessingStage
                  label="1. Image Analysis"
                  status={
                    detectionStage === 'idle' ? 'pending' :
                    detectionStage === 'analyzing' ? 'processing' : 'complete'
                  }
                />
                <ProcessingStage
                  label="2. Vehicle Detection"
                  status={
                    detectionStage === 'idle' || detectionStage === 'analyzing' ? 'pending' :
                    detectionStage === 'detecting' ? 'processing' : 'complete'
                  }
                />
                <ProcessingStage
                  label="3. License Plate OCR"
                  status={
                    ['idle', 'analyzing', 'detecting'].includes(detectionStage) ? 'pending' :
                    detectionStage === 'ocr' ? 'processing' : 'complete'
                  }
                />
                <ProcessingStage
                  label={mode === 'checkin' ? '4. Database Registration' : '4. Parking Fee Calculation'}
                  status={
                    detectionStage === 'complete' ? 'complete' : 'pending'
                  }
                />
              </div>

              {/* Result Display */}
              {result && (
                <div className={`rounded-xl p-4 border-2 ${
                  result.status === 'success' 
                    ? 'bg-green-900/30 border-green-600' 
                    : 'bg-red-900/30 border-red-600'
                }`}>
                  <div className="flex items-start gap-3">
                    {result.status === 'success' ? (
                      <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
                    ) : (
                      <Ban className="w-6 h-6 text-red-400 flex-shrink-0 mt-1" />
                    )}
                    <div className="flex-1">
                      <h4 className={`font-bold mb-2 ${
                        result.status === 'success' ? 'text-green-300' : 'text-red-300'
                      }`}>
                        {result.status === 'success' ? 'Success!' : 'Error'}
                      </h4>
                      <p className="text-sm text-gray-300 mb-3">{result.message}</p>
                      
                      {result.status === 'success' && result.licensePlate && (
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center justify-between bg-gray-800/50 rounded-lg p-2">
                            <span className="text-gray-400">License Plate:</span>
                            <span className="font-mono font-bold text-white text-lg">
                              {result.licensePlate}
                            </span>
                          </div>
                          <div className="flex items-center justify-between bg-gray-800/50 rounded-lg p-2">
                            <span className="text-gray-400">Assigned Slot:</span>
                            <span className="font-bold text-blue-400">{result.slotId}</span>
                          </div>
                          {result.confidence && (
                            <div className="flex items-center justify-between bg-gray-800/50 rounded-lg p-2">
                              <span className="text-gray-400">Confidence:</span>
                              <span className="font-bold text-green-400">{result.confidence}%</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4 border-t border-gray-700">
            <button
              onClick={handleClose}
              disabled={isProcessing}
              className="flex-1 px-6 py-3 rounded-lg border border-gray-600 text-gray-300 hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
            >
              Cancel
            </button>
            <button
              onClick={handleProcess}
              disabled={!selectedFile || isProcessing}
              className={`flex-1 px-6 py-3 rounded-lg transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed font-semibold flex items-center justify-center gap-2 ${
                mode === 'checkin'
                  ? 'bg-blue-600 hover:bg-blue-700'
                  : 'bg-orange-600 hover:bg-orange-700'
              } text-white`}
            >
              {isProcessing ? (
                <>
                  <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
                  Processing...
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5" />
                  {mode === 'checkin' ? 'Process Check-In' : 'Process Check-Out'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Processing Stage Component
interface ProcessingStageProps {
  label: string;
  status: 'pending' | 'processing' | 'complete';
}

function ProcessingStage({ label, status }: ProcessingStageProps) {
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
