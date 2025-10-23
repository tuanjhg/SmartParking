'use client';

import { useState, useRef } from 'react';
import { checkInVehicle } from '@/services/api';
import { CheckInResponse } from '@/types';

interface CheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CheckInModal({ isOpen, onClose, onSuccess }: CheckInModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CheckInResponse | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResult(null);
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile) return;

    setLoading(true);
    setResult(null);

    try {
      const response = await checkInVehicle(selectedFile);
      setResult(response);

      if (response.status === 'ok') {
        setTimeout(() => {
          onSuccess();
          handleClose();
        }, 2000);
      }
    } catch (error) {
      setResult({
        status: 'error',
        message: error instanceof Error ? error.message : 'Đã xảy ra lỗi',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setPreviewUrl('');
    setResult(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800">🚗 Check-in Xe Vào Bãi</h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            
            {previewUrl ? (
              <div className="space-y-4">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="max-h-64 mx-auto rounded-lg shadow-md"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  Chọn ảnh khác
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="cursor-pointer"
              >
                <div className="text-6xl mb-4">📷</div>
                <p className="text-lg font-medium text-gray-700 mb-2">
                  Tải lên ảnh biển số xe
                </p>
                <p className="text-sm text-gray-500">
                  Hỗ trợ: JPG, PNG, BMP (Tối đa 10MB)
                </p>
              </div>
            )}
          </div>

          {result && (
            <div
              className={`p-4 rounded-lg ${
                result.status === 'ok'
                  ? 'bg-green-50 border border-green-200'
                  : 'bg-red-50 border border-red-200'
              }`}
            >
              <div className="flex items-start">
                <div className="text-2xl mr-3">
                  {result.status === 'ok' ? '✅' : '❌'}
                </div>
                <div className="flex-1">
                  <h3
                    className={`font-semibold mb-2 ${
                      result.status === 'ok' ? 'text-green-800' : 'text-red-800'
                    }`}
                  >
                    {result.status === 'ok' ? 'Thành công!' : 'Lỗi'}
                  </h3>
                  <p className="text-sm mb-2">{result.message}</p>
                  
                  {result.status === 'ok' && (
                    <div className="mt-3 space-y-1 text-sm">
                      <p>
                        <strong>Biển số:</strong>{' '}
                        <span className="font-mono bg-white px-2 py-1 rounded">
                          {result.license_plate}
                        </span>
                      </p>
                      <p>
                        <strong>Slot:</strong>{' '}
                        <span className="font-mono bg-white px-2 py-1 rounded">
                          {result.slot_id}
                        </span>
                      </p>
                      <p>
                        <strong>Thời gian:</strong>{' '}
                        {result.arrival_time &&
                          new Date(result.arrival_time).toLocaleString('vi-VN')}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
          <button
            onClick={handleClose}
            className="px-6 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 transition-colors"
            disabled={loading}
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            disabled={!selectedFile || loading}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              !selectedFile || loading
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin">⏳</span> Đang xử lý...
              </span>
            ) : (
              'Check-in'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
