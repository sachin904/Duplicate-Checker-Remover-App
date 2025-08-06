import React, { useState, useEffect, useRef } from 'react';
import { Search, FileText, AlertTriangle, CheckCircle, Clock, HardDrive, Play, Pause, RotateCcw } from 'lucide-react';
import { scanService, ScanProgress, DuplicateStream } from '../services/api';
import { FileInfo } from '../types';

interface RealTimeScanProps {
  scanId: string;
  onScanComplete: (scanId: string) => void;
}

const RealTimeScan: React.FC<RealTimeScanProps> = ({ scanId, onScanComplete }) => {
  const [progress, setProgress] = useState<ScanProgress | null>(null);
  const [duplicates, setDuplicates] = useState<FileInfo[]>([]);
  const [isPolling, setIsPolling] = useState(true);
  const [error, setError] = useState<string>('');
  const [isCompleted, setIsCompleted] = useState(false);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const duplicateIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    startPolling();
    return () => stopPolling();
  }, [scanId]);

  const startPolling = () => {
    // Poll progress every 1 second
    progressIntervalRef.current = setInterval(async () => {
      try {
        const progressData = await scanService.getScanProgress(scanId);
        setProgress(progressData);
        
        if (progressData.status === 'COMPLETED' || progressData.status === 'FAILED') {
          stopPolling();
          if (progressData.status === 'COMPLETED') {
            setIsCompleted(true);
            // Don't immediately call onScanComplete, let user see the results
            setTimeout(() => {
              onScanComplete(scanId);
            }, 3000); // Give user 3 seconds to see completion
          }
        }
      } catch (err) {
        console.error('Error fetching progress:', err);
        setError('Failed to fetch scan progress');
      }
    }, 1000);

    // Poll duplicates every 2 seconds
    duplicateIntervalRef.current = setInterval(async () => {
      try {
        const duplicateData = await scanService.getDuplicateStream(scanId);
        setDuplicates(duplicateData.duplicates);
      } catch (err) {
        console.error('Error fetching duplicates:', err);
      }
    }, 2000);
  };

  const stopPolling = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
    if (duplicateIntervalRef.current) {
      clearInterval(duplicateIntervalRef.current);
      duplicateIntervalRef.current = null;
    }
    setIsPolling(false);
  };

  const togglePolling = () => {
    if (isPolling) {
      stopPolling();
    } else {
      startPolling();
    }
  };

  const formatFileSize = (bytes: number): string => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'scanning':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!progress) {
    return (
      <div className="text-center py-12">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Initializing scan...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress Header */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Search className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                {isCompleted ? 'Scan Completed' : 'Real-Time Scan'}
              </h3>
              <p className="text-gray-600">Scanning directory: {progress.currentDirectory}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {!isCompleted && (
              <button
                onClick={togglePolling}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isPolling 
                    ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' 
                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                }`}
              >
                {isPolling ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>
            )}
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(progress.status)}`}>
              {progress.status}
            </span>
          </div>
        </div>

        {/* Completion Message */}
        {isCompleted && (
          <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-6 h-6 text-green-500" />
              <div>
                <p className="font-medium text-green-800">Scan completed successfully!</p>
                <p className="text-sm text-green-600">
                  Found {progress.totalFiles} files with {progress.duplicateCount} duplicates.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Progress: {progress.processedFiles} / {progress.totalFiles} files</span>
            <span>{progress.progressPercentage.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${
                isCompleted 
                  ? 'bg-green-500' 
                  : 'bg-gradient-to-r from-blue-500 to-purple-600'
              }`}
              style={{ width: `${progress.progressPercentage}%` }}
            ></div>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">Total Files</p>
                <p className="text-2xl font-bold text-blue-800">{progress.totalFiles}</p>
              </div>
              <FileText className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">Processed</p>
                <p className="text-2xl font-bold text-green-800">{progress.processedFiles}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </div>
          <div className="bg-red-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-600 font-medium">Duplicates</p>
                <p className="text-2xl font-bold text-red-800">{progress.duplicateCount}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
          </div>
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 font-medium">Last Update</p>
                <p className="text-sm font-medium text-purple-800">
                  {formatDate(progress.lastUpdate)}
                </p>
              </div>
              <Clock className="w-8 h-8 text-purple-500" />
            </div>
          </div>
        </div>

        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700">{error}</p>
          </div>
        )}
      </div>

      {/* Real-Time Duplicates */}
      {duplicates.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center space-x-3 mb-4">
            <AlertTriangle className="w-6 h-6 text-amber-500" />
            <h4 className="text-lg font-bold text-gray-900">Duplicates Found ({duplicates.length})</h4>
          </div>
          
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {duplicates.map((file, index) => (
              <div key={index} className="border border-red-200 rounded-lg p-4 bg-red-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <FileText className="w-5 h-5 text-red-500" />
                    <div>
                      <p className="font-medium text-red-800">{file.fileName}</p>
                      <p className="text-sm text-red-600 truncate max-w-xs">{file.filePath}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 text-xs text-red-600">
                    <div className="flex items-center space-x-1">
                      <HardDrive className="w-3 h-3" />
                      <span>{formatFileSize(file.size)}</span>
                    </div>
                    <span className="bg-red-200 px-2 py-1 rounded text-xs font-medium uppercase">
                      {file.extension || 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Errors */}
      {progress.errors && progress.errors.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h4 className="text-lg font-bold text-gray-900 mb-4">Errors</h4>
          <div className="space-y-2">
            {progress.errors.map((error, index) => (
              <div key={index} className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RealTimeScan; 